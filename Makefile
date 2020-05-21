
COMPILER_SERVICE_VERSION := $(shell cat compiler/VERSION)
COMPILER_IMAGE := "gcr.io/arrp-lang/arrp-compiler-v$(COMPILER_SERVICE_VERSION)"
COMPILER_SERVICE := "arrp-compiler-v$(COMPILER_SERVICE_VERSION)"

.PHONY: info
info:
	@echo "Compiler image: $(COMPILER_IMAGE)"
	@echo "Compiler service: $(COMPILER_SERVICE)"

.PHONY: compiler
compiler:
	docker build -t $(COMPILER_IMAGE) compiler

.PHONY: deploy-compiler
deploy-compiler:
	docker push $(COMPILER_IMAGE)
	gcloud beta run deploy $(COMPILER_SERVICE) \
	--image=$(COMPILER_IMAGE) \
	--port=8000 \
	--concurrency=1 \
	--max-instances=50 \
	--allow-unauthenticated \
	--platform=managed \
	--region=us-central1

.PHONY: ui
ui: pug
	mkdir -p public
	docker run --rm -it -v $(shell pwd):/opt/build pug pug /opt/build/ui/pages \
	--basedir /opt/build/ui \
	-O "{base_url: ''}" \
	--out /opt/build/public
	cp -r ui/css ui/js public/

clean:
	sudo rm -rf public

.PHONY: pug
pug:
	docker build -t pug -f ui/pug-docker ui
