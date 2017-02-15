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
		type: 'input',
		name: 'project.name',
		message: 'What is the project repo name?'
	}, {
		type: 'input',
		name: 'project.description',
		message: 'What is the description of this project?'
	}, {
		type: 'input',
		name: 'project.version',
		message: 'What is the project\'s current version?',
		default: '0.0.1',
	}, {
		type: 'input',
		name: 'project.author.name',
		message: 'What is the project author\'s name?'
	}, {
		type: 'input',
		name: 'project.author.email',
		message: 'What is the project author\'s email?'
	}, {
		type: 'input',
		name: 'project.author.url',
		message: 'What is the project author\'s website url?'
	}, {
		type: 'list',
		name: 'project.repo.location',
		message: 'Where is the project repo located?',
		default: 'github',
		choices: ['github', 'bitbucket']
	}, {
		type: 'input',
		name: 'project.repo.id',
		when: function (answers) {
			// If `when` property does not exist, Archie will not ask a question if the answer already exists in `archie.config.js` from the installation's root folder. This example is strictly to show that `block.config` can be used in `archie.block.js` to view any existing configuration from `archie.config.js`.
			return !block.config.project || !block.config.project.repo || !block.config.project.repo.id;
		},
		message: function (answers) {
			return 'What is the ' + answers.project.repo.location + ' user ID for the project repo?'
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
		type: 'list',
		name: 'project.license',
		message: 'What is the project\'s license (see https://choosealicense.com/)?',
		default: 'MIT',
		choices: ['MIT', 'Apache License 2.0', 'GNU GPLv3']
	}, {
		type: 'input',
		name: 'project.homepage',
		message: 'What is the project\'s home page?'
	}, {
		type: 'input',
		name: 'project.keywords',
		message: 'What are related keywords for this project (comma-separated list)?'
	}, {
		type: 'confirm',
		name: 'project.private',
		message: 'Should this project be kept private?',
		default: false
	}, {
		type: 'input',
		name: 'dirs.src',
		message: 'Where is the source files directory (relative to current working directory)?'
	}, {
		type: 'input',
		name: 'dirs.dest',
		message: 'Where is the destination files directory (relative to current working directory)?'
	}, {
		type: 'input',
		name: 'globs.data',
		message: 'Where are the global data files (relative to source directory)?'
	}, {
		type: 'input',
		name: 'globs.pages',
		message: 'Where are the pug files to be compiled to html pages (relative to source directory)?'
	}];


/**
 * Hooks allow you to run functions at certain phases of archie's workflow.
 */
block.hooks = {
	parseAnswers: function (answers) {
		var path = require('path');
		// keywords to array
		if (answers.project.keywords) {
			answers.project.keywords = answers.project.keywords.split(/[\s,]+/);
		}
		// add dirs to globs
		if (answers.globs.data) answers.globs.data = path.join(answers.dirs.src, answers.globs.data);
		if (answers.globs.pages) answers.globs.pages = path.join(answers.dirs.src, answers.globs.pages);
		// add pug options
		answers.pug = {
			options: {
				data: answers.globs.data,
			}
		};
	},
	postInstall: function (shell) {
		shell.echo('postInstall hook complete.');
	}
};
