/**
 * archie config
 * -------------
 * Configuration data for archie.
 */


module.exports = {
	project: {
		name: 'archie',
		description: 'This is my project.',
		version: '0.0.1',
		author: {
			name: 'Zimmee',
			email: 'thezimmee@gmail.com',
			url: 'https://github.com/thezimmee/archie'
		},
		repo: {
			location: 'github',
			id: 'thezimmee',
			protocol: 'ssh'
		},
		license: 'MIT',
		githubId: 'thezimmee',
		homepage: 'https://github.com/thezimmee/archie',
		keywords: 'static, site, generator, front, end, css, framework',
		private: true
	},
	dirs: {
		src: 'src',
		dest: 'dest'
	},
	globs: {
		data: '**/*.data.json',
		pages: '**/*.html.pug'
	},
	all: {
		options: {
			data: true,
			lodash: true,
			yaml: true
		}
	},
	html: {
		engine: 'pug|markdown|html',
		options: {
			minify: true,
			lint: true,
		}
	},
	css: {
		engine: 'stylus|sass|less|css',
		options: {
			minify: true,
			lint: true,
			autoprefix: true,
			sourcemaps: true,
			format: false,
			uncss: false,
		}
	},
	js: {
		engine: 'babel|js',
		bundler: 'browserify|webpack|none',
		options: {
			minify: true,
			lint: true,
			format: false,
		}
	}
};
