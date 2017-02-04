module.exports = {
	src: "src",
	dest: "build",
	options: {
		verbose: true,
		debug: false
	},
	data: {
		_main: {
			src: ["src/**/*.data.{yaml,json,js}"]
		}
	},
	html: {
		options: {
			minify: false
		},
		_main: {
			src: "src/**/*.html.pug",
		}
	},
	css: {
		dest: "css",
		vendor: {
			src: ["vendor/**/*.styl"],
			options: {
				root: "",
				minify: true
			}
		},
		app: {
			src: "src/**/*.styl"
		}
	},
	js: {
		dest: "js",
		vendor: {
			src: ["vendor/**/*.js", "node_modules/file.js"],
			options: {
				root: "",
				minify: false
			}
		},
		app: {
			src: ["src/**/*.js", "!src/**/*.data.js"]
		}
	},
	custom: {
		_main: {
			src: "src/**/*.txt",
		},
		options: {
			script: function customBundle (name, bundle, archie) {
				console.log('------\nrunning customBundle');
				return true;
			}
		}
	}
};
