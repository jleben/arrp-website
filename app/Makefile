
default: build/home.md-html


build/%.md-html: src/%.md build
	pandoc $< -o $@

build:
	mkdir -p build
