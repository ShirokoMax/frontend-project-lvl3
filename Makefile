develop:
	npx webpack serve

install:
	npm install

build:
	NODE_ENV=production npx webpack

lint:
	npx eslint .

lint-fix:
	npx eslint . --fix

.PHONY: test