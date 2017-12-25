const builder = require('electron-builder');
const package = require('./package.json');

builder.build({
	config: {
		"productName": "Kakin Counter",
		"buildVersion": package.version,
		"appId": "org.bitnari.kakinpos",
		"asar": true,
		"files": [ "!.cache/**/*" ],
		"protocols": {
			"name": "kakinpos",
			"schemes": [
				"kakinpos"
			]
		},
		"win": {
			"icon": "./app/img/kakin.ico",
			"target": [{
				"target": "zip",
				"arch": [
					"ia32",
					"x64"
				]
			}]
		},
		"directories": {
			"output": "build/"
		}
	}
});
