

VERSION=$(shell cat VERSION)

.PHONY: all
all: compiler ui

.PHONY: compiler
compiler:
	docker build -t jakobleben/arrp-web-compiler:$(VERSION) compiler

.PHONY: ui
ui:
	docker build -t jakobleben/arrp-web-ui:$(VERSION) ui
