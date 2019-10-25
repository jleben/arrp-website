#ifndef ARRP_WWW_GENERIC_PRINTER
#define ARRP_WWW_GENERIC_PRINTER

#include <iostream>
#include <iomanip>

namespace arrp_www {

class generic_printer
{
    int m_output_count = 10;

public:
    generic_printer(int output_count): m_output_count(output_count) {
        cout << std::fixed << std::setprecision(3);
    }

    int remaining_output_count() { return m_output_count; }

    template <typename T, size_t S>
    void output(T (&a)[S])
    {
        if (m_output_count < 1)
            return;
        --m_output_count;

        using namespace std;
        print(a);
        cout << endl;
    }

    template <typename T>
    void output(T value)
    {
        if (m_output_count < 1)
            return;
        --m_output_count;

        print(value);
        cout << endl;
    }

    template <typename T, size_t S>
    void print(T (&a)[S])
    {
        using namespace std;
        cout << "(";
        for (int i = 0; i < S; ++i)
        {
            if (i > 0)
                cout << ",";
            print(a[i]);
        }
        cout << ")";
    }

    template <typename T>
    void print(T a)
    {
        using namespace std;
        cout << a;
    }
};

}

#endif // ARRP_WWW_GENERIC_PRINTER
