#!/usr/bin/env node

var cli = require('commander', 'cli');


/**
 * Show archie's current version.
 */
cli
	.version(require('../package.json').version)
	.description(require('../package.json').description)
	.parse(process.argv);


/**
 * Install a building block from [src] to [dest].
 */
cli
	.command('install <src> [dest]')
	.alias('i')
	.description('Install a building block into your current project.')
	.action(function (src, dest = '.') {
		var fs = require('fs-extra');
		var path = require('path');
		var Promise = require('bluebird');

		console.log('');
		console.log('Archie is installing the [%s] building block into [%s]...', src, (dest === './' || dest === '.' || dest === '') ? path.basename(process.cwd()) : dest);

		// If src doesn't exist as relative path, resolve the path relative to archie.
		if (!fs.existsSync(src)) {
			if (fs.existsSync(path.resolve(module.filename, '../../blocks', src))) {
				src = path.resolve(module.filename, '../../blocks', src);
			} else {
				console.error('[!] Uh oh... could not find [%s].', src);
				process.exit(1);
			}
		}

		// Process archie block config.
		var inquirer = require('inquirer');
		var block = require(path.join(src + '/archie.block.js'));

		// Attach config to the block for use inside of inquirer.
		block.config = fs.existsSync('./archie.config.js') ? require(path.join(process.cwd(), 'archie.config.js')) : {};
		block.hooks = block.hooks || {};

		// Only ask questions that aren't already answered in config.
		if (block.config) {
			block.questions.forEach(function (question, i) {
				if (question.name) {
					// First check if property exists in config.
					var configValue = lookupPropertyByString(block.config, question.name);
					// If it does, copy it to the answers object.
					if (configValue !== undefined) {
						var whenFn = question.when;
						question.when = function (answers) {
							var key = question.name.split('.')[0];
							answers[key] = block.config[key];
							if (typeof whenFn === 'function') {
								return whenFn(answers);
							}
						}
					}
				}
			});
		}

		// Ask questions.
		inquirer.prompt(block.questions).then(function (answers) {
			var merge = require('lodash/merge');
			if (typeof block.hooks.parseAnswers === 'function') {
				block.hooks.parseAnswers(answers);
			}
			block.config = merge(block.config, answers);
			compileBlock();
			console.log('');
		}).catch(function (error) {
			console.log(error);
		});

		// Deep property lookup from string.
		function lookupPropertyByString (obj, stringPath) {
			for (var i = 0, stringPath = stringPath.split('.'), len = stringPath.length; i < len; i++) {
				obj = obj[stringPath[i]];
				if (obj === undefined) break;
			}
			return obj;
		}

		// Iterate over all template files in source directory.
		function compileBlock () {
			var glob = require('glob');
			glob(path.join(src, '**/*'), {nodir: true, ignore: path.join(src, 'archie.block.js')}, function (error, filepaths) {
				if (error) throw error;
				// Compile each file, then run postInstall hook
				Promise.each(filepaths, compileFile).finally(function () {
					if (typeof block.hooks.postInstall === 'function') {
						block.hooks.postInstall(require('shelljs'));
					}
				}).catch(function (error) {
					console.error(error.stack);
					console.log('');
				});
			});
		}

		// Process lodash template.
		function compileFile (filepath) {
			return fs.readFile(filepath, 'utf8', function (error, content) {
				if (error) {
					return console.error(error);
				}
				var _ = require('lodash');
				var to = path.join(dest, path.relative(src, filepath));
				var compiled = _.template(content.toString())(block.config);
				return fs.outputFile(to, compiled, function (error) {
					if (error) {
						return console.error(error);
					}
					console.log('Saved [%s] to [%s].', filepath, to);
					return true;
				});
			});
		}
	});


/**
 * Any other command runs the corresponding bundle.
 * ---
 * 	- Is essentially an alias for npm run.
 */
cli
	.command('*')
	.usage('[options]')
	.description('Run a task.')
	.parse(process.argv)
	.action(function (command, options) {
		var path = require('path');
		var pkg = require(path.join(process.cwd(), 'package.json'));

		// make sure command exists
		if (!pkg.scripts[command]) {
			console.error('Archie could not find the [%s] command. Are you sure it exists?', command);
		}

		// grab dependencies
		var shell = require('shelljs');
		var args = process.argv;

		// make sure command is first argument (strips node and archie commands)
		while (args[0] !== command) {
			args.shift();
		}

		// pass along arguments
		if (args.length > 1) {
			args.splice(1, 0, '--');
		}

		// run the task
		shell.exec('npm run ' + args.join(' ') + ' --color=always');
	});


/**
 * Show help.
 */
cli.parse(process.argv);
if (cli.args.length < 1) {
	cli.help();
}
