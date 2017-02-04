var tapOut = require('tap-out');
var through = require('through2');
var duplexer = require('duplexer');
var _ = require('lodash');
var log = require('./logger.js');
var repeatString = require('./repeat-string.js');

module.exports = function() {
	var output = through();
	var parser = tapOut();
	var stream = duplexer(parser, output);
	var options = {
		lineLength: 60,
		comments: false,
		debug: false
	};
	var optionsMap = {
		D: 'debug',
		debug: 'debug',
		C: 'comments',
		comments: 'comments',
	};

	// process arguments
	process.argv.forEach(function (arg) {
		arg = arg.replace(/-/g, '');
		if (optionsMap[arg]) {
			options[arg] = true;
		}
	});
	if (options.debug) {
		options.comments = true;
	}

	// parsed test object with details
	parser.on('test', function(test) {
		if (test.number > 1) {
			output.push('\n\n');
		}
		output.push(log.style.info(test.number + ':', test.name, '\n'));
		if (options.comments) {
			output.push('\n');
		}
	});

	// // assertions
	// parser.on('assert', function (assertion) {
	// 	// output.push('\n', log.msg(assertion));
	// });

	// version data
	// parser.on('version', function (version) {
		// output.push('\nVERSION: ', version);
	// });

	// // test result data for tests, pass, fail
	// parser.on('result', function (result) {
	// 	var type = result.name.replace('fail', 'errors').replace('pass', 'passes');
	// 	// output.push('\n', log.msg(result));
	// 	options[type] = options[type] || {};
	// 	options[type].name = type;
	// 	options[type].count = result.count;
	// });

	// Passing assertions
	parser.on('pass', function(assertion) {
		output.push(log.style.green('    [✔] PASSED:', assertion.name, '\n'));
	});

	// Failing assertions
	parser.on('fail', function(assertion) {
		output.push(log.style.red.bold('    [✖] FAILED:', assertion.name, '\n'));
		if (assertion.error.at) {
			output.push(log.style.dim('        at '));
			output.push(log.msg(log.style.paths(assertion.error.at.file, '(' + assertion.error.at.line + ':' + assertion.error.at.character + ')')));
		}
		output.push(log.style.dim('        expected: '));
		output.push(log.highlight(assertion.error.expected));
		output.push(log.style.dim('        actual: '));
		output.push(log.highlight(assertion.error.actual));

		stream.failed = true;
	});

	if (options.comments) {
		parser.on('comment', function(comment) {
			if (comment.raw && comment.raw !== ' ') {
				output.push(log.msg('    ', comment.raw));
			}
		});
	}

	// all output after all tap data is parsed
	parser.on('output', function(results) {
		output.push('\n\n');

		output.push(
			'\n',
			log.detail({style: 'soft'},
			repeatString(Math.ceil(((options.lineLength - (' SUMMARY ').length)) / 2), '-') +
			' SUMMARY ' +
			repeatString(Math.floor(((options.lineLength - (' SUMMARY ').length)) / 2), '-')
		));

		if (!results.results[0]) {
			results.results[0] = {count: '0'};
		}
		if (!results.results[1]) {
			results.results[1] = {count: '0'};
		}
		if (!results.results[2]) {
			results.results[2] = {count: '0'};
		}

		output.push(log.style.info(
			'  - TESTS: ' +
			repeatString(20 - '  - TESTS: '.length - 4 - results.results[0].count.length),
			results.results[0].count,
			'\n'
		));
		output.push(log.style.green(
			'  - PASSED: ' +
			repeatString(20 - '  - PASSED: '.length - 4 - results.results[1].count.length),
			results.results[1].count,
			'\n'
		));
		output.push(log.style.red(
			'  - FAILED: ' +
			repeatString(20 - '  - FAILED: '.length - 4 - results.results[2].count.length),
			results.results[2].count,
			'\n'
		));

		output.push('\n');
		if (results.fail.length) {
			output.push(log.style.error('  Uh oh... Not all tests passed. :(', '\n\n'));
			_.each(results.fail, function (error, i) {
				output.push(log.style.red('    -', error.name));
				if (error.error.at) {
					output.push(log.style.dim('      at '));
					output.push(log.msg(log.style.paths(error.error.at.file, '(' + error.error.at.line + ':' + error.error.at.character + ')')));
					output.push('\n');
				}
				output.push('\n');
			});
		} else {
			output.push(log.style.success.bold('  All tests passed... yay!!! :)'));
			output.push('\n\n');
		}


		output.push(
			'\n',
			log.detail({style: 'soft'},
			repeatString(Math.ceil(((options.lineLength - (' THE END ').length)) / 2), '-') +
			' THE END ' +
			repeatString(Math.floor(((options.lineLength - (' THE END ').length)) / 2), '-'),
			'\n'
		));

		// // Most likely a failure upstream
		// if (results.plans.length < 1) {
		// 	process.exit(1);
		// }

		// if (results.fail.length > 0) {
		// 	output.push(formatErrors(results));
		// 	output.push('\n');
		// }

		// // Exit if no tests run. This is a result of 1 of 2 things:
		// //  1. No tests were written
		// //  2. There was some error before the TAP got to the parser
		// if (results.tests.length === 0) {
		// 	process.exit(1);
		// }
	});

	return stream;
};
