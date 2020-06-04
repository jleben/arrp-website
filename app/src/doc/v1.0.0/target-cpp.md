# Generated C++ Code

To output C++ code, run the Arrp compiler with the "--cpp" option:

    arrp example.arrp --cpp

By default the compiler generates a file named "module.cpp", with "module" replaced by
the actual name of the compiled module.
To generate a file with a different name, follow the "--cpp" option with
the desired name. For example, to generate "something.cpp", execute:

    arrp example.arrp --cpp something.cpp

## Namespace

By default the C++ code is placed into a namespace with the same name as the module name.
To generate code in a different namespace, provide the "--cpp-namespace" option:

    arrp example.arrp --cpp-namespace some_namespace

## The program class

An Arrp program is represented as a C++ class named "program".
For example:

**Arrp:**

    module example;

    input a : int;
    input b : [~,10]real64;
    ...
    output c;

**C++:**

    namespace example
    {
      template <typename IO>
      class program
      {
      private:
          int a;
          double b[10];
      public:
          IO * io;
          void prelude()
          {
              ... input_a(a) ...
              ... input_b(b) ...
          }
          void period()
          {
              ... input_b(b) ...
              ... output_c(...) ...
          }
      };
    }

### Prelude and period

The program class has two functions, named "prelude" and "period".

The prelude computes all finite data and possibly an introductory part of infinite arrays.
It should be called before calling the period function and only once.

The period computes one period of the infinite arrays. It should be called repeatedly
after calling the prelude once.

### Input and output

The program class is a template with a parameter IO representing the type that
provides the input and consumes the output. The class contains
a data field `IO* io` - a pointer which must be initialized to an instance
of IO before using the rest of the class.

When some input or output data needs to be exchanged, the program class will
call a method of the IO object.
This method is called `input_name` for an input
named "name", and likewise `output_name` for an output.
The method is passed an argument:
the buffer where the data is to be written or read from.

If an input or output is a stream, the input or output function is
called once for each sample of the stream in the first dimension.
The calls happen in order from index 0 to infiniy.

If an input or output is not a stream, the input or output function
is called only a single time for the entire data.

