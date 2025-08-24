PackageSpec=parking-system-device-agent

dev:
	mkdir -p dev

init: dev
	npm i -g ./lib/${PackageSpec}
	cd ./dev ; npx ${PackageSpec} init

test: dev
	cd ./dev ; npx ${PackageSpec} start
