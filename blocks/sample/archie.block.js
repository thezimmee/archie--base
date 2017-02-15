/**
 * archie.block.js
 * ---------------
 * Provides dynamic data for a building block, and tells archie how it should be installed.
 *
 * question object syntax:
 * @type {string} (input|confirm|list|rawlist|password)
 * @name {string|function} name in answers hash
 * @message {string|function} message / question to print
 * @default {string|number|array|function} default value
 * @choices {array|function} list of options (array can be object with name and value)
 * @validate {function} return true if value is valid or error message string otherwise
 * @filter {function} receive user input and return filtered value to be used inside program. value returned is added to the answers hash.
 * @when {function|boolean} receive current user answers hash and return true or false if it should be asked.
 */

var block = module.exports = {};

/**
 * Array of questions Archie will ask if he doesn't already know the answers from archie.config.js.
 */
block.questions = [{
		type: 'confirm',
		when: function (answers) {
			var keys = ['repo', 'bugs', 'name'];
			keys.some(function (key) {
				if (!block.config.project || block.config.project.hasOwnProperty(key)) {
					console.log('');
					console.log('-----------------------------');
					console.log('[i] Enter repository details.');
					console.log('-----------------------------');
					return true;
				}
			});
			return false;
		}
	}, {
		type: 'list',
		name: 'project.repo.location',
		message: 'Where is the project repo?',
		default: 'github',
		choices: ['github', 'bitbucket']
	}, {
		type: 'input',
		name: 'project.name',
		message: function (answers) {
			return 'What is the name of the ' + answers.project.repo.location + ' project?';
		},
		filter: function (input) {
			return input.toLowerCase();
		}
	}, {
		type: 'input',
		name: 'project.repo.username',
		when: function (answers) {
			// If `when` property does not exist, Archie will not ask a question if the answer already exists in `archie.config.js` from the installation's root folder. This example is strictly to show that `block.config` can be used in `archie.block.js` to view any existing configuration from `archie.config.js`.
			return !block.config.project || !block.config.project.repo || !block.config.project.repo.username;
		},
		message: function (answers) {
			return 'What is user name of the ' + answers.project.repo.location + ' repo?'
		},
		filter: function (input) {
			return input.toLowerCase();
		}
	}, {
		type: 'list',
		name: 'project.repo.protocol',
		message: function (answers) {
			return 'How do you want to access the ' + answers.project.repo.location + ' repo?'
		},
		default: 'ssh',
		choices: ['ssh', 'https']
	}, {
		type: 'input',
		name: 'project.repo.url',
		default: function (answers) {
			var url = [
				(answers.project.repo.protocol === 'https') ? 'https://' : 'git@',
				(answers.project.repo.location === 'bitbucket' && answers.project.repo.protocol === 'https') ? answers.project.repo.username + '@' : '',
				answers.project.repo.location,
				(answers.project.repo.location === 'bitbucket') ? '.org' : '.com',
				(answers.project.repo.protocol === 'https') ? '/' : ':',
				answers.project.repo.username, '/' +
				answers.project.name + '.git'
			];
			return url.join('');
		},
		message: function (answers) {
			return 'What is the URL for the ' + answers.project.repo.location + ' repo?';
		}
	}, {
		type: 'input',
		name: 'project.bugs',
		message: 'What is the URL for bug submissions?',
		default: function (answers) {
			return 'https://' + answers.project.repo.location + '.com/' + answers.project.repo.username + '/' + answers.project.name + '/issues';
		}
	}, {
		type: 'confirm',
		when: function (answers) {
			var keys = ['author', 'description', 'version', 'license', 'keywords', 'private'];
			keys.some(function (key) {
				if (!block.config.project || !block.config.project.hasOwnProperty(key)) {
					console.log('WHEN', key, block.config.project[key]);
					console.log('');
					console.log('-----------------------------------');
					console.log('[i] Enter details for package.json.');
					console.log('-----------------------------------');
					return true;
				}
			})
			return false;
		}
	}, {
		type: 'input',
		name: 'project.author.name',
		message: 'What is the author\'s name?',
		default: function (answers) {
			return answers.project.repo.username;
		}
	}, {
		type: 'input',
		name: 'project.author.email',
		message: 'What is the author\'s email?'
	}, {
		type: 'input',
		name: 'project.author.url',
		message: 'What is the author\'s website url?',
		default: function (answers) {
			return answers.project.repo.url;
		}
	}, {
		type: 'input',
		name: 'project.description',
		message: 'What is the description of this project?'
	}, {
		type: 'input',
		name: 'project.version',
		message: 'What is the current version of this project?',
		default: '0.0.1',
	}, {
		type: 'list',
		name: 'project.license',
		message: 'What is the project\'s license (see https://choosealicense.com/)?',
		default: 'MIT',
		choices: ['MIT', 'Apache License 2.0', 'GNU GPLv3', 'UNLICENSED']
	}, {
		type: 'input',
		name: 'project.keywords',
		message: 'What are related keywords for this project (comma-separated list)?'
	}, {
		type: 'confirm',
		name: 'project.private',
		message: 'Should this project be private?',
		default: false
	}, {
		type: 'confirm',
		when: function (answers) {
			var keys = ['dirs', 'globs'];
			keys.some(function (key) {
				if (!block.config.hasOwnProperty(key)) {
					console.log('');
					console.log('--------------------------------------');
					console.log('[i] Enter globs / paths for the build.');
					console.log('--------------------------------------');
					return true;
				}
			});
			return false;
		}
	}, {
		type: 'input',
		name: 'dirs.src',
		message: function (answers) {
			return 'What is the project\'s source directory, relative to ' + process.cwd() + '?';
		}
	}, {
		type: 'input',
		name: 'dirs.dest',
		message: function (answers) {
			return 'What is the project\'s build / destination directory, relative to ' + process.cwd() + '?';
		}
	}, {
		type: 'input',
		name: 'globs.pages',
		message: function (answers) {
			return 'What is the glob for the pug files (to be compiled to html pages), relative to ' + require('path').join(process.cwd(), answers.dirs.src) + '?';
		}
	}];


/**
 * Hooks allow you to run functions at certain phases of archie's workflow.
 */
block.hooks = {
	parseAnswers: function (answers) {
		var path = require('path');
		// Convert keywords to an array.
		if (answers.project && answers.project.keywords && !Array.isArray(answers.project.keywords)) {
			answers.project.keywords = answers.project.keywords.split(/[\s,]+/);
		}
		// Add dirs to globs.
		if (answers.globs && answers.globs.data) answers.globs.data = path.join(answers.dirs.src, answers.globs.data);
		if (answers.glob && answers.globs.pages) answers.globs.pages = path.join(answers.dirs.src, answers.globs.pages);
		// Add pug options.
		answers.pug = {
			options: {
				data: answers.globs ? answers.globs.data || {} : {},
			}
		};
	},
	postInstall: function (shell) {
		shell.echo('');
		shell.echo('postInstall hook complete.');
	}
};
