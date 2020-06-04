
default: \
build/home.md-html \
build/doc/v1.0.0/index.md-html \
build/doc/v1.0.0/compiler.md-html \
build/doc/v1.0.0/target-cpp.md-html

build/%.md-html: src/%.md
	mkdir -p $(@D)
	pandoc $< -o $@
