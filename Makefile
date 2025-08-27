PackageSpec!=jq '.name' package.json

test:
	mkdir -p test

init: test
	npm i
	cd ./test ; npx ../. init

dev: test
	cd ./test ; npx ../ start
