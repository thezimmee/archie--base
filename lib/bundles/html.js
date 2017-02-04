var _ = require('lazy-cache')(require);
_('pug');
_('bluebird', 'promise');
_('fs-extra', 'fse');
_('path');
_('lodash');
_('../utils/logger', 'log');

module.exports = function compileToHtml (filepaths, bundle, archie) {
	// return _.lodash.each(filepaths, function eachFile (filepath) {
	// 	compileFileToHtml(filepath, bundle, archie);
	// });
	return new _.promise(function (resolve) {
		var allFiles = [];
		_.lodash.each(filepaths, function eachFile (filepath) {
			allFiles.push(compileFileToHtml(filepath, bundle, archie));
		});
		_.promise.all(allFiles).then(function () {
			resolve(archie);
		});
	});
};


function compileFileToHtml (filepath, bundle, archie) {
	var contents;
	var html;

	// set file meta
	bundle.filename = filepath;
	bundle.basedir = process.cwd();

	// read file
	contents = _.fse.readFileSync(filepath);

	// compile pug
	if (bundle.client) {
		// compile to js
		html = _.pug.compileClient(contents, bundle);
	} else {
		// compile to html
		html = _.pug.compile(contents, bundle)(bundle.data);
	}

	// rename file extension
	filepath = _.path.format({
		dir: _.path.dirname(filepath),
		name: _.path.basename(filepath).split('.')[0],
		ext: bundle.client ? '.js' : '.html'
	});

	// save file
	var destPath = _.path.format({
		dir: bundle.dest,
		name: _.path.basename(filepath).split('.')[0],
		ext: bundle.client ? '.js' : '.html'
	});
	_.fse.outputFile(destPath, html, function error(error) {
		if (error) {
			_.log.error(error);
		}
	});

	// log to cli
	_.log.success('Created:', _.path.relative(process.cwd(), _.path.resolve(destPath)));

	// return filepath;
	return filepath;
}

// module.exports = function compileHtmlBundle(src, dest, options) {
// 	var srcFiles = src;

// 	// glob src to dest (53-75ms)
// 	if (_.globby.hasMagic(src)) {
// 		srcFiles = _.globby.sync(src);
// 	}

// 	// compile each file
// 	_.lodash.each(srcFiles, _.compileHtml);

// 	/**
// 	 * compile file to html
// 	 * @param {string} filepath file path
// 	 */
// 	function compileFileToHtml (filepath) {
// 		var contents;
// 		var html;
// 		options.filename = filepath;
// 		// read file
// 		contents = _.fse.readFileSync(filepath);
// 		// compile pug
// 		if (options.client) {
// 			// compile to js
// 			html = _.pug.compileClient(contents, options);
// 		} else {
// 			// compile to html
// 			html = _.pug.compile(contents, options)(data);
// 		}
// 		// rename file extension
// 		filepath = _.path.format({
// 			dir: _.path.dirname(filepath),
// 			name: _.path.basename(filepath).split('.')[0],
// 			ext: options.client ? '.js' : '.html'
// 		});
// 		// output to destination
// 		var destPath = _.path.format({
// 				dir: dest,
// 				name: _.path.basename(filepath).split('.')[0],
// 				ext: options.client ? '.js' : '.html'
// 			});
// 		_.fse.outputFile(destPath, html, function error(error) {
// 			if (error) {
// 				_.log.error(error);
// 			}
// 		});
// 		// log to cli
// 		_.log.success('Created:', _.path.relative(process.cwd(), _.path.resolve(destPath)));
// 	}

// 	// // glob src to dest (85-90ms)
// 	// var pugStream = _.fsv.src(src)
// 	// 	.pipe(compilePug(options))
// 	// 	.pipe(_.fsv.dest(dest))
// 	// 	.pipe(logFile())
// 	// 	.on('finish', function () {
// 	// 		_.log.stopTimer('HTML');
// 	// 		console.log('Done!');
// 	// 	});


// 	// // compile pug with data (either to html or js files)
// 	// function compilePug(options) {
// 	// 	options = options || {};
// 	// 	var data = options.data || {page: {name: 'home'}};

// 	// 	return _.through.obj(function compile(file, enc, cb) {
// 	// 		// set pug options.filename to path so it can process extends & includes
// 	// 		options.filename = file.path;

// 	// 		// rename file extension
// 	// 		file.path = _.path.format({
// 	// 			dir: _.path.dirname(file.path),
// 	// 			name: _.path.basename(file.path).split('.')[0],
// 	// 			ext: options.client ? '.js' : '.html'
// 	// 		});

// 	// 		// make sure file is not a stream
// 	// 		if (file.isStream()) {
// 	// 			return cb(console.error('Streaming not supported.'));
// 	// 		}

// 	// 		// compile pug
// 	// 		if (file.isBuffer()) {
// 	// 			try {
// 	// 				var compiled;
// 	// 				var contents = String(file.contents);
// 	// 				if (options.client) {
// 	// 					// compiles to js
// 	// 					compiled = _.pug.compileClient(contents, options);
// 	// 				} else {
// 	// 					// compiles to html
// 	// 					compiled = _.pug.compile(contents, options)(data);
// 	// 				}
// 	// 				file.contents = new Buffer(compiled);
// 	// 				// _.log.success('Created:', _.path.relative('/', _.path.resolve(_.path.relative(_.path.dirname(src), dest), _.path.basename(file.path))));
// 	// 			} catch (error) {
// 	// 				return cb(console.error(error));
// 	// 			}
// 	// 		}

// 	// 		cb(null, file);
// 	// 	});
// 	// }

// 	// function logFile() {
// 	// 	return _.through.obj(function logFile(file, enc, cb) {
// 	// 		_.log.info('file:', file.path);
// 	// 		cb(null, file);
// 	// 	});
// 	// }
// };
