#include "arrp_program.cpp"
#include "generic_printer.hpp"

#include <cstring>

using namespace std;

int main(int argc, char * argv[])
{
    int out_count = 10;

    if (argc > 1)
        out_count = std::max(1, std::min(1000, atoi(argv[1])));

    int max_reps = 10000;

    auto d = new arrp_www::generic_printer(out_count);
    auto k = new arrp::program<arrp_www::generic_printer>;
    k->io = d;

    k->prelude();

    while(max_reps-- && d->remaining_output_count() > 0)
    {
        k->period();
    }

    delete k;
    delete d;
}
