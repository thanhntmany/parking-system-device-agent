PackageSpec!=jq '.name' package.json

dev:
	mkdir -p dev

init: dev
	npm i
	npm i -g .
	cd ./dev ; npx ${PackageSpec} init

test: dev
	cd ./dev ; npx ${PackageSpec} start
