#pragma once

#include <Poco/URI.h>
#include <Poco/Net/HTTPServer.h>
#include <Poco/Net/HTTPRequestHandler.h>
#include <Poco/Net/HTTPRequestHandlerFactory.h>

#include <stdexcept>
#include <atomic>
#include <mutex>
#include <filesystem>

namespace fs = std::filesystem;

namespace Arrp_Web {

using Poco::Net::HTTPServer;
using Poco::Net::HTTPServerParams;
using Poco::Net::HTTPServerRequest;
using Poco::Net::HTTPServerResponse;
using Poco::Net::HTTPRequestHandler;
using Poco::Net::HTTPRequestHandlerFactory;
using std::string;
using std::atomic;
using std::mutex;
using std::istream;
using std::ostream;

class Options
{
public:
    int port = 8000;
    string data_path;
    int max_log_count = 100;
};

Options & options();

class Server
{
public:
    Server();

private:
    static HTTPServerParams * params();

    HTTPServer d_server;
};

class Request_Handler_Factory : public HTTPRequestHandlerFactory
{
public:
    Request_Handler_Factory();

private:
    HTTPRequestHandler * createRequestHandler
    (const HTTPServerRequest & request) override;

    mutex d_mutex;
    int d_max_ids = 10;
    int d_next_id = 0;
};

class Play_Handler : public HTTPRequestHandler
{
public:
    struct Error : public std::exception
    {
        string msg;
        Error(const string & msg) : msg(msg) {}
        const char * what() const noexcept override { return msg.c_str(); }
    };

    struct Request_Error : public Error
    {
        using Error::Error;
    };

    struct Program_Error : public Error
    {
        using Error::Error;
    };

    Play_Handler(int id);

private:
    struct Request
    {
        string code;
        string input;
        int program_out_count = 10;
    };

    int d_id = 0;

    fs::path log_path;
    const fs::path output_path = "output";
    const fs::path arrp_source_path = output_path / "program.arrp";
    const fs::path arrp_compile_log_path = output_path / "arrp_compile_log.txt";
    const fs::path arrp_version_path = output_path / "arrp_version.txt";
    const string program_name = "program";
    const fs::path cpp_kernel_path = output_path / "program.h";
    const fs::path cpp_main_path = output_path / "program-stdio-main.cpp";
    const fs::path cpp_compile_log_path = output_path / "cpp_compile_log.txt";
    const fs::path program_path = output_path / "program";
    const fs::path program_in_path = output_path / "program_in.txt";
    const fs::path program_out_path = output_path / "program_out.txt";

    void handleRequest
    (HTTPServerRequest & request,
     HTTPServerResponse & response)
    override;

    void play(HTTPServerRequest & request,
              HTTPServerResponse & response,
              const Poco::URI &);

    Request parse_request(HTTPServerRequest & request);
    static Request parse_query(const Poco::URI &);
    void prepare_filesystem();
    static void ensure_empty_dir(const fs::path &);
    void write_input_files(Request &);
    void get_arrp_version();
    void compile_arrp_code();
    void compile_cpp_code();
    void run_program(int out_count);
    void send_report(HTTPServerResponse & response, const string & error = string());
    static string encode_file_in_base64(const fs::path &);
    static void print_file(const fs::path &);
    static void copy_stream(istream &, ostream &, std::size_t max_size);
};

}
