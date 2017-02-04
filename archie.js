module.exports = {
	src: "src",
	dest: "build",
	data: ["src/**/*.data.{yaml,json,js}"],
	html: {
		src: "src/**/*.html.pug",
		options: {
			minify: false
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
		app: "src/**/*.styl"
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
		app: ["src/**/*.js", "!src/**/*.data.js"]
	},
	custom: {
		src: "src/**/*.txt",
		options: {
			script: function customBundle (name, bundle, archie) {
				console.log('------\nrunning customBundle');
				return true;
			}
		}
	}
};
