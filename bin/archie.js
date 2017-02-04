#! /usr/bin/env node

var _ = require('lazy-cache')(require);
_('commander', 'cli');
_('lodash');
_('bluebird', 'promise');
_('../package.json', 'pkg');
_('../lib/utils/logger', 'log');
_('../lib/archie.js', 'archie');

_.cli
	.version(_.pkg.version)
	.description('Description: archie the architect builds beautiful things.')
	.usage('[command] [options]');

_.cli
	.command('build')
	.usage('[options]')
	.description('builds app')
	// .option('-s, --src [string]', 'path to source folder.')
	// .option('-d, --dest [string]', 'path to build folder.')
	.option('-C, --config [string]', 'path to config file (js|json|yaml).')
	.option('-P, --prod', 'build in production mode.')
	.parse(process.argv)
	.action(function (cli) {
		// start timer
		_.archie._events.emit('task.start', {id: 'build', init: cli});

		// run data first
		_.archie._collection('data')
			.then(function (data) {
				// debug data
				if (_.archie._config.options.debug) {
					_.archie._cache.debug.push('ARCHIE DATA: ', data, '\n\n');
				}
				// then run all other bundles
				return _.archie._bundler('all', {exclude: ['data']});
			}).then(function (data) {
				// debug data
				if (_.archie._config.options.debug) {
					_.archie._cache.debug.push('ARCHIE BUNDLES: ', data, '\n');
				}
			}).finally(function () {
				// stop timer
				_.archie._events.emit('task.complete', 'build');
			}).catch(function (error) {
				if (!error.error) {
					error = {error: error};
				}
				if (!error.msg) {
					error.msg = 'Build failed.';
				}
				_.archie._events.emit('error', error);
			});
	});

// _.cli.on('--help', function () {});

_.cli.parse(process.argv);

if (_.cli.args.length < 1) {
	_.cli.help();
}
