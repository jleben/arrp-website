

VERSION=$(shell cat VERSION)

.PHONY: all
all: compiler ui pug

.PHONY: compiler
compiler:
	docker build -t jakobleben/arrp-web-compiler:$(VERSION) compiler

.PHONY: ui
ui:
	docker build -t jakobleben/arrp-web-ui:$(VERSION) ui

.PHONY: pug
pug:
	docker build -t pug -f ui/pug-docker ui

.PHONY: push
push:
	docker push jakobleben/arrp-web-compiler:$(VERSION)
	docker push jakobleben/arrp-web-ui:$(VERSION)
