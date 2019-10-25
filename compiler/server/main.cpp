#include "server.hpp"
#include "../arguments/arguments.hpp"

#include <thread>
#include <chrono>
#include <iostream>

using namespace Arrp_Web;
using namespace std;

int main(int argc, char * argv[])
{
    options().port = 8000;

    Arguments::Parser parser;
    parser.add_option("-d", options().data_path);
    parser.add_option("--logs", options().max_log_count);

    parser.parse(argc, argv);

    if (options().data_path.empty())
    {
        cerr << "Missing option: -d (data path)" << endl;
        return 1;
    }

    if (options().max_log_count < 0)
    {
        cerr << "Invalid option: maximum log count: " << options().max_log_count << endl;
        return 1;
    }

    Server server;

    for(;;)
    {
        //cout << "Ping." << endl;
        this_thread::sleep_for(chrono::seconds(1));
    }

    //cout << "End." << endl;

    return 0;
}
