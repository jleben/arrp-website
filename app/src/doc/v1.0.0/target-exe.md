# Generated Executables

The Arrp compiler can generate an executable program (with the help of a C++ compiler).

The executable can read/write inputs and outputs from standard input and output channels (terminal, pipe, etc.) and from files.
Small amounts of input data can also be provided using command line options.
Input and output can use various formats (currently text or native binary).

## A Quick Example

For example, consider the following Arrp code:


    input x : [~]int;
    output y = x * 2;

Assuming the above code is in a file `program.arrp`, we can generate an executable named `program` like this:

    arrp program.arrp -x program

By default, this program will use the standard input channel for stream `x` and the standard output channel for stream `y`, both using the [text format](#text-format).

Running `./program -h` will print help on other options.

When running `./program` in a terminal, it waits for us to type in some input.
After typing some input and a line break, the program responds with the corresponding output, each element on a separate line.
A terminal session might look like this:

    input  ->  1
    output ->  2
    input  ->  5
    output ->  10
    input  ->  3 -2 6
    output ->  6
    output ->  -4
    output ->  12

## Input Sources and Output Destinations

Running `./program -h` will print help on all the options and a list of input and output names.

If an input requires a small amount of data, it can be provided literally on the command line. For example, assuming `program` contains `input some_option : [3]int`, the input can be set like this:

    ./program some_option="2 5 6"

Literal values like this use the [text format](#text-format).

To instruct the program to read an input or write an output to a file, provide the file name like this:

    ./program some_input=some_file

In place of the file name, "pipe" can be used to explicitly use the standard input or output channel:

    ./program some_input=pipe

Standard channels and files can use any of the [available formats](#io-formats).

If there is a single input/output or a single stream-type input/output,
it will automatically use the standard input/output channel.


## Input and Output Formats {id=io-formats}

Different formats can be specified for inputs and outputs using standard channels and files.

Unless otherwise specified, all inputs and outputs use the text format.

A different default format can be specified with the `-f` option:

    ./program -f raw

A format for an individual input or output can be specified following a colon:

    ./program some_input=pipe:raw


In all cases, array elements are read and written as a sequence following the lexicographical
order of array indices, e.g. for a 2 dimensional array:
(0,0), (0,1), (0,2), ... (1,0), (1,1), ...

These are the available formats:


### Text Format (option `text`) {id=text-format}

Individual array elements are extracted as if using the C++ stream
[input](https://en.cppreference.com/w/cpp/io/basic_istream/operator_gtgt)
and
[output](https://en.cppreference.com/w/cpp/io/basic_ostream/operator_ltlt)
operators.
Elements are separated by spaces, line breaks or other white space.

### Raw Format (option `raw`)

  Each array element is stored just like natively in the memory,
  for example a value of type `real32` may be stored as a
  little-endian 32-bit IEEE floating point number.


## Buffering

To improve performance, the generated executable may read and write data in larger chunks and buffer it.

The buffer size can be adjusted using the `-b` option. For example, to set it to 64 elements:

    ./program -b 64

When an input is buffered, the program reads from the source in chunks equal to the size of the
buffer.
It will read the next chunk only when more data is required to produce output.

When an output is buffered, the program will write to the destination in chunks equal to the size of
the buffer.
It will write a chunk as soon as that amount of new data is produced.

Currently, buffering is enabled only for inputs and outputs in raw format,
and when the chosen buffer size is considerably larger than the amount of data
the program normally consumes and produces at one time.
Mind that (depending on the compilation options)
a multi-dimensional stream may produce or consume an entire slice at a time -
meaning a group of elements with the same index in the first dimension.
