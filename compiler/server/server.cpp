#include "server.hpp"

#include <Poco/Net/HTTPServerParams.h>
#include <Poco/Net/HTTPServerRequest.h>
#include <Poco/Net/HTTPServerResponse.h>
#include <Poco/URI.h>
#include <Poco/Base64Encoder.h>
#include "../json/json.hpp"

#include <iostream>
#include <sstream>
#include <fstream>
#include <unordered_map>
#include <iterator>

using namespace std;

namespace Arrp_Web {

Options & options()
{
    static Options options;
    return options;
}

Server::Server():
    d_server(new Request_Handler_Factory, options().port, params())
{
    d_server.start();
}

Poco::Net::HTTPServerParams * Server::params()
{
    auto params = new HTTPServerParams;
    params->setMaxThreads(1);
    return params;
}

Request_Handler_Factory::Request_Handler_Factory()
{
    d_max_ids = options().max_log_count;
}

HTTPRequestHandler * Request_Handler_Factory::createRequestHandler
(const HTTPServerRequest &)
{
    lock_guard<mutex> guard(d_mutex);

    int id = d_next_id;

    d_next_id = (d_next_id + 1) % d_max_ids;

    return new Play_Handler(id);
}

Play_Handler::Play_Handler(int id):
    d_id(id)
{
    log_path = "log/" + to_string(id);
}

void Play_Handler::handleRequest(HTTPServerRequest &request, HTTPServerResponse &response)
{
    using namespace Poco::Net;

    cerr << "Request: " << request.getMethod() << " " << request.getURI() << endl;

    response.set("Access-Control-Allow-Origin", "*");

    Poco::URI uri(request.getURI());

    try
    {
        play(request, response, uri);
    }
    catch (Request_Error & e)
    {
        cerr << "Request error: " << e.what() << endl;
        response.setStatusAndReason(HTTPResponse::HTTP_BAD_REQUEST, e.what());
        response.send();
    }
    catch (Program_Error & e)
    {
        cerr << "Program error: " << e.what() << endl;
        send_report(response, e.what());
    }
    catch (Error & e)
    {
        cerr << "Error: " << e.what() << endl;
        response.setStatusAndReason
                (HTTPResponse::HTTP_INTERNAL_SERVER_ERROR, e.what());
        response.send();
    }

    if (!response.sent())
    {
        response.setStatus(HTTPResponse::HTTP_INTERNAL_SERVER_ERROR);
        response.send();
    }
}

void Play_Handler::play(HTTPServerRequest & http_request,
                        HTTPServerResponse & http_response,
                        const Poco::URI & uri)
{
    using namespace Poco::Net;

    //auto play_request = parse_query(uri);
    Request request = parse_request(http_request);
    request.program_out_count = 1000;
    prepare_filesystem();
    write_input_files(request);
    compile_arrp_code();
    //compile_cpp_code();
    run_program(request.program_out_count);
    send_report(http_response);
}

Play_Handler::Request Play_Handler::parse_request(HTTPServerRequest & http_request)
{
    auto & in = http_request.stream();

    int limit_bytes = 512 * 1000;

    string data;
    vector<char> buffer(512);
    while(in and data.size() < limit_bytes)
    {
        in.read(buffer.data(), 512);
        int extracted_count = in.gcount();
        data += string(buffer.data(), extracted_count);
    }

    if (data.size() >= limit_bytes and !in.eof())
    {
        throw Request_Error("Request data too big.");
    }
    if (!in and !in.eof())
    {
        throw Request_Error("Failed to read data.");
    }

    using nlohmann::json;

    json data_json;

    try { data_json = json::parse(data); }
    catch (json::parse_error & e)
    {
        throw Request_Error("Data could not be parsed as JSON.");
    }

    Request request;
    request.code = data_json["code"];
    request.input = data_json["input"];
    return request;
}

Play_Handler::Request Play_Handler::parse_query(const Poco::URI & uri)
{
    auto query_list = uri.getQueryParameters();

    unordered_map<string,string> queries;
    for (auto & query : query_list)
    {
        queries[query.first] = query.second;
    }

    Request request;

    auto & out_count_param = queries["out_count"];
    if (!out_count_param.empty())
    {
        request.program_out_count = stoi(out_count_param);
    }

    if (request.program_out_count < 1 || request.program_out_count > 10000)
    {
        throw Request_Error("Invalid number of output elements requested: " +
                            to_string(request.program_out_count));
    }
    return request;
}

void Play_Handler::prepare_filesystem()
{
    try
    {
        ensure_empty_dir(output_path);
    }
    catch(Error & e)
    {
        throw Error(string("Failed to prepare output dir: ") + e.what());
    }

    try
    {
        ensure_empty_dir(log_path);
    }
    catch(Error & e)
    {
        throw Error(string("Failed to prepare log dir:") + e.what());
    }
}

void Play_Handler::ensure_empty_dir(const fs::path & dir)
{
    try
    {
        fs::remove_all(dir);
    }
    catch(fs::filesystem_error &) {}

    if (fs::exists(dir))
    {
        throw Error("Failed to remove previous directory.");
    }

    try
    {
        fs::create_directories(dir);
    }
    catch (fs::filesystem_error & e)
    {
        throw Error(string("Failed to create directory: ") + e.what());
    }
}

void Play_Handler::write_input_files(Request & request)
{
    using namespace Poco::Net;

    auto write_file = [](const string & text, const string & path)
    {
        ofstream file(path);
        file << text << endl;
        if (file.fail())
        {
            throw Error("Failed to write request data into file.");
        }
    };

    write_file(request.code, arrp_source_path);
    write_file(request.code, log_path / "program.arrp");
    write_file(request.input, program_in_path);
}

void Play_Handler::compile_arrp_code()
{
    using namespace Poco::Net;

    ostringstream cmd;
    cmd << "ARRP_HOME=" << options().data_path
        << " " << options().data_path << "/bin/arrp"
        << " " << arrp_source_path
        << " --exe " << program_path
//        << " --cpp " << (cpp_source_path.parent_path() / cpp_source_path.stem())
//        << " --cpp-namespace arrp"
        << " 2> " << arrp_compile_log_path;

    cerr << "Executing: " << cmd.str() << endl;

    int status = system(cmd.str().c_str());
    if (status == 0)
        return;

    throw Program_Error("Arrp compilation failed.");
}

void Play_Handler::compile_cpp_code()
{
    using namespace Poco::Net;

    ostringstream cmd;
    cmd << "g++ -std=c++17"
        << " -I" << options().data_path << "/include"
        << " -I" << output_path
        << " " << options().data_path << "/generic_main.cpp"
        << " -o " << program_path
        << " 2> " << cpp_compile_log_path;

    cerr << "Executing: " << cmd.str() << endl;

    int status = system(cmd.str().c_str());
    if (status == 0)
        return;

    throw Program_Error("C++ compilation failed.");
}

void Play_Handler::run_program(int out_count)
{
    using namespace Poco::Net;

    ostringstream cmd;
    cmd << "./" << program_path
        << " -f text "
        << " < " << program_in_path
        << " | head -n " << out_count
        << " > " << program_out_path;

    cerr << "Executing: " << cmd.str() << endl;

    int status = system(cmd.str().c_str());
    if (status == 0)
        return;

    throw Program_Error("Program execution failed.");
}

void Play_Handler::send_report(HTTPServerResponse & response, const string & error)
{
    using namespace Poco::Net;
    using nlohmann::json;

    string data;

    cerr << "-- Arrp code:" << endl;
    print_file(arrp_source_path);
    cerr << "-- Arrp compilation:" << endl;
    print_file(arrp_compile_log_path);
    cerr << "-- C++ program:" << endl;
    print_file(cpp_source_path);
    cerr << "-- C++ compilation:" << endl;
    print_file(cpp_compile_log_path);
    cerr << "-- Program output:" << endl;
    print_file(program_out_path);

    json j;

    j["error"] = error;
    j["arrp"] = encode_file_in_base64(arrp_source_path);
    j["arrp_compiler"] = encode_file_in_base64(arrp_compile_log_path);
    j["cpp"] = encode_file_in_base64(cpp_source_path);
    j["cpp_compiler"] = encode_file_in_base64(cpp_compile_log_path);
    j["output"] = encode_file_in_base64(program_out_path);

    response.setStatus(HTTPResponse::HTTP_OK);
    response.setContentType("application/json");
    auto & body = response.send();
    body << j.dump(4);
}

string Play_Handler::encode_file_in_base64(const fs::path & p)
{
    ostringstream data;

    {
        ifstream file(p);
        if (!file.is_open())
            return string();

        Poco::Base64Encoder encoder(data);
        encoder.rdbuf()->setLineLength(0);
        copy_stream(file, encoder, 1024 * 1024);
    }

    return data.str();
}

void Play_Handler::print_file(const fs::path & p)
{
    ifstream file(p);
    if (file.is_open())
    {
        string d(std::istreambuf_iterator<char>(file), {});
        cerr << d;
    }
    cerr << endl;
}

void Play_Handler::copy_stream(istream & in, ostream & out, std::size_t max_size)
{
    vector<char> data(max_size);

    in.read(data.data(), max_size);

    if (in.bad())
        throw Error("Failed to read stream.");

    auto size = in.gcount();

    out.write(data.data(), size);

    if (!out)
        throw Error("Failed to write stream.");
}

}
