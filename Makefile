
.PHONY: all
all: compiler ui pug

.PHONY: compiler
compiler:
	docker build -t jakobleben/arrp-web-compiler:dev compiler

.PHONY: ui
ui:
	docker build -t jakobleben/arrp-web-ui:dev ui

.PHONY: pug
pug:
	docker build -t pug -f ui/pug-docker ui

.PHONY: release
release:
	docker tag jakobleben/arrp-web-compiler:dev jakobleben/arrp-web-compiler:release
	docker tag jakobleben/arrp-web-ui:dev jakobleben/arrp-web-ui:release
	docker push jakobleben/arrp-web-compiler:release
	docker push jakobleben/arrp-web-ui:release

.PHONY: deploy
deploy:
	docker stack deploy -c docker-compose.yml arrp-website

.PHONY: test
test:
	docker stack deploy -c test-compose.yml --resolve-image never test-arrp-website
