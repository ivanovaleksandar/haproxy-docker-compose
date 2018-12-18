install: down build up ps

build-nodejs:
	cd app/; \
	docker build -t ivanovaleksandar/nodejs-app:latest .

build-haproxy:
	cd haproxy/; \
	docker build -t ivanovaleksandar/haproxy:latest .

build-rsyslog:
	cd rsyslog/; \
	docker build -t ivanovaleksandar/rsyslog:latest .

build: build-nodejs build-haproxy build-rsyslog

up: 
	docker-compose up -d

ps:
	docker-compose ps

down: 
	docker-compose down

test:
	curl -i localhost:8080

.PHONY: build install up
