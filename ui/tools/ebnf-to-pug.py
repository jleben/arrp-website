import argparse
import codecs
import re

def main():
  parser = argparse.ArgumentParser(description='Translate EBNF grammar to pug.')
  parser.add_argument('input', nargs=1)
  parser.add_argument('output', nargs='?')
  a = parser.parse_args()

  in_file_name = a.input[0]
  out_file_name = None

  if a.output != None:
    out_file_name = a.output
  else:
    out_file_name = in_file_name.split('/')[-1].rpartition('.')[0] + ".pug"

  print "input = " + in_file_name
  print "output = " + out_file_name

  in_file = codecs.open(in_file_name, encoding='utf-8', mode='r')
  out_file = codecs.open(out_file_name, encoding='utf-8', mode='w')

  space_pat = re.compile("[ ]*")
  def_pat = re.compile("([a-zA-Z-]+)\\s*=")
  ref_pat = re.compile("\"[^\"]*\"|\\[[^\\]]*\\]|([a-zA-Z-]+)")

  out_file.write("pre.\n")

  for line in in_file:
    print "Line: " + line[:-1]

    newline = "  "
    pos = 0

    match = def_pat.search(line, pos)
    if match:
      name = match.group(1)
      print "Found def: " + str(name) + " {}:{}".format(match.start(1), match.end(1))
      #replacement = "<a name=\"" + name + "\">" + name + "</a>"
      replacement = "#[a(name='" + name + "') " + name + "]"
      newline = newline + line[pos:match.start(1)] + replacement + line[match.end(1):match.end()]
      pos = match.end()

    for match in ref_pat.finditer(line, pos):
      print "Ref match: " + match.group(0)
      if not match.group(1):
        continue;
      name = match.group(1)
      print "Found ref: " + str(name) + " {}:{}".format(match.start(1), match.end(1))
      #replacement = "<a href=\"#" + name + "\">" + name + "</a>"
      replacement = "#[a(href='#" + name + "') " + name + "]"
      newline = newline + line[pos:match.start(1)] + replacement + line[match.end(1):match.end()]
      pos = match.end();

    newline = newline + line[pos:]

    print "New line: " + newline[:-1]
    print

    out_file.write(newline)

main()
