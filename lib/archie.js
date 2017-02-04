/**
 * archie.js
 * @description global data object for archie
 */

var _ = require('lazy-cache')(require);
var Emitter = require('events');
_('lodash');
_('globby');
_('moment');
_('pretty-ms', 'prettyMs');
_('./utils/logger.js', 'log');
_('./utils/files.js', 'files');
_('./bundler.js', 'bundler');
_('./utils/repeat-string.js', 'repeatString');


// export archie (empty until archie._init())
var defaultConfig = {
	src: 'src',
	dest: 'build',
	options: {
		verbose: true,
		debug: false
	}
};
var archie = module.exports = archie || {
	_config: resetConfig(),
	_cache: resetCache(),
	_init: init,
	_bundler: _.bundler.all,
	_collection: _.bundler.collection,
	_bundle: _.bundler.bundle,
	_error: logError,
	_events: new Emitter()
};


// attach events
archie._events.on('task.start', startTask);
archie._events.on('task.complete', stopTask);
archie._events.on('error', logError);
// bundle events
archie._events.on('bundle.start', startBundle);
archie._events.on('bundle.complete', stopBundle);


/**
 * initialize archie
 * @param {object} options
 * @return {object} archie : global config object
 */
function init(options) {
	options = options || {};

	// return if already initialized
	if (archie._cache.initialized && !options.reset) {
		return archie;
	}

	// reset if told to do so
	if (options.reset) {
		archie._config = resetConfig();
		archie._cache = resetCache();
	}

	// cache cli options
	archie._cache.configPath = options.configPath || options.config || _.globby.sync('./archie.{json,js,yaml}').sort()[0];
	archie._cache.isProd = options.isProd || options.prod || false;

	// build user config
	var userConfig = buildConfig(_.files.readDataFile(archie._cache.configPath));
	archie._config = _.lodash.merge(
		archie._config,
		userConfig
	);

	// set to initialized
	archie._cache.initialized = true;

	return archie;
}


function resetCache () {
	var cache = {
		// configPath: './archie.js',
		isProd: false,
		root: process.cwd(),
		// for some reason, having a default bundles array doesn't property merge down later on, so commenting out for now
		// bundlesList: ['data', 'html', 'css', 'js', 'images', 'fonts', 'svg'],
		bundles: {},
		task: {
			errors: [],
			warnings: [],
			bundlesStarted: [],
			bundlesCompleted: []
		},
		debug: [],
		reservedKeys: ['src', 'dest', 'options'],
		initialized: false
	};
	if (archie && archie._cache) {
		archie._cache = cache;
	}
	return cache;
}

function resetConfig () {
	var defaultConfig = {
		src: 'src',
		dest: 'build',
		options: {
			verbose: true,
			debug: false
		}
	};
	if (archie && archie._config) {
		archie._config = defaultConfig;
	}
	return defaultConfig;
}


/**
 * build config
 * @param {object} config : user's config
 * @return {object} config
 */
function buildConfig(userConfig) {
	if (!userConfig) {
		return _.log.error('No userConfig file found. ', userConfig);
	}

	// reset _cache.bundlesList
	archie._cache.bundlesList = [];

	// parse userConfig.bundles
	_.lodash.each(userConfig, function eachBundleType(bundle, type) {
		// skip if this is a reserved key
		if (type[0] === '_' || archie._cache.reservedKeys.indexOf(type) > -1) {
			return;
		}
		// add to _cache.bundlesList
		archie._cache.bundlesList.push(type);
		// expand bundles to uniform format
		userConfig[type] = buildCollection(userConfig[type], type);
	});

	return userConfig;
}


/**
 * build collection into a uniform, readable format
 * @param {object} collection : collection from user config
 * @return {object} collection
 */
function buildCollection(collection, collectionName) {
	// if collection has src property, create collection._main
	if (collection.src) {
		collection._main = collection.src;
		delete collection.src;
	}
	// if collection is glob, create collection._main
	if (_.lodash.isArray(collection) || typeof collection === 'string') {
		collection = { _main: { src: collection } };
	}
	// expand each bundle in this collection
	_.lodash.each(collection, function eachChunk(bundle, bundleName) {
		if (archie._cache.reservedKeys.indexOf(bundleName) === -1) {
			// build bundle
			collection[bundleName] = buildBundle(collection[bundleName]);
		}
	});

	return collection;
}


/**
 * build bundle into uniform format
 * @param {object} bundle : bundle object
 * @return {object} bundle
 */
function buildBundle(bundle) {
	// if bundle is glob, move glob value to src property
	if (_.lodash.isArray(bundle) || typeof bundle === 'string') {
		bundle = { src: bundle };
	}

	return bundle;
}


/**
 * throw error
 */
function logError (error) {
	// error type
	error.type = error.type || 'error';
	// error id = bundleId or collection name(s)
	error.id = error.bundleId || error.collections || archie._cache.task.id;
	// build message
	error.msg = error.msg || 'Unknown ' + error.type;
	// stop bundle if it hasn't been stopped already
	if (error.bundleId && !archie._cache.bundles[error.bundleId].completed) {
		stopBundle(error.bundleId, {log: false});
	}
	// cache error
	if (archie._cache.bundles[error.id]) {
		archie._cache.bundles[error.id][error.type + 's'].push(error);
	} else {
		archie._cache.task[error.type + 's'].push(error);
	}
	// log error
	_.log[error.type]('[' + error.id + '] ', error.msg);
	if (error.error) {
		_.log.msg({style: error.type}, error.error)
	};
	// if error, throw
	if (error.type === 'error') {
		throw error;
	}
}


/**
 * start task
 */
function startTask (options) {
	if (typeof options === 'string') {
		options = {id: options};
	}
	// run init
	if (options.init) {
		init(options.init);
	}
	// id task
	archie._cache.task.id = (options.id || 'BUILD').toUpperCase();
	// start timer
	archie._cache.task.started = _.moment();
	// log start message
	_.log.info('[' + archie._cache.task.id + '] started...');
}
/**
 * stop task
 */
function stopTask (id, options) {
	var task = archie._cache.task;
	if (typeof id === 'object') {
		options = id;
	}
	// default options
	options = _.lodash.assign({
		message: '[' + task.id + '] finished!',
		force: true,
		error: false,
		style: 'info', // set false to not log a message
		summary: true
	}, options);
	// update stop time only if not already stopped or options.force
	if (options.force || !task.completed) {
		// calculate duration
		task.completed = _.moment();
		task.duration = task.completed.diff(task.started);
		task.durationPretty = _.prettyMs(task.duration);
	}
	// log error if options.error
	if (options.error) {
		if (options.style && options.style !== 'warning') options.style = 'error';
		options.message = (options.style === 'warning' ? 'WARNING' : 'ERROR') + ' in ' + options.error.id;
		task.error = options.error;
		if (typeof options.error === 'boolean') {
			_.log[options.style](options.error);
		}
		logError(options.error);
	}
	// log task status
	if (options.style) {
		_.log[options.style](options.message);
	}
	// log task summary
	if (options.summary) {
		taskSummary();
	}
}
/**
 * start bundle
 * @param {string} id : timer id
 */
function startBundle (id) {
	// reset bundle status
	archie._cache.bundles[id] = archie._cache.bundles[id] || {};
	// start timer
	archie._cache.bundles[id].started = _.moment();
	// reset warnings an errors
	archie._cache.bundles[id].warnings = [];
	archie._cache.bundles[id].errors = [];
	// add count to cache
	archie._cache.task.bundlesStarted.push(id);
	// log start message
	_.log.info('[' + id + '] started...');
}
/**
 * stop bundle
 * @param {string} id : timer id
 * @param {object} options
 */
function stopBundle (id, options) {
	// default options
	options = _.lodash.assign({
		type: 'info',
		message: '[' + id + '] finished!',
		force: true,
		error: false,
		log: true
	}, options);
	// update stop time only if not already stopped or options.force
	if (options.force || !archie._cache.bundles[id].completed) {
		// calculate duration
		archie._cache.bundles[id].completed = _.moment();
		archie._cache.bundles[id].duration = archie._cache.bundles[id].completed.diff(archie._cache.bundles[id].started);
		archie._cache.bundles[id].durationPretty = _.prettyMs(archie._cache.bundles[id].duration);
	}
	// add count to cache
	archie._cache.task.bundlesCompleted.push(id);
	// error message
	if (options.error) {
		if (options.type === 'info') options.type = 'error';
		options.message = (options.type === 'warning' ? 'WARNING' : 'ERROR') + ' in ' + id;
		archie._cache.bundles[id].error = options.error;
	}
	// log duration
	if (options.log) {
		_.log[options.type](options.message);
		if (typeof options.error !== 'boolean') {
			_.log[options.type](options.error);
		}
	}
}


/**
 * generate summary of all timers
 * @param {object} options
 */
function taskSummary () {
	var summary = {};
		summary.sortedBundleKeys = Object.keys(archie._cache.bundles).sort();
		summary.title = archie._cache.task.id + ' SUMMARY';
		summary.task = archie._cache.task.id;
		summary.closing = 'THE END';
		summary.lineLength = 40;
		summary.incompleteBundles = [];
		summary.errors = [];
		summary.warnings = [];
		summary.durations = [];
		summary.durationsTitle = 'STOP WATCH';


	// iterate through each bundle to save needed info
	_.lodash.each(summary.sortedBundleKeys, function (id) {
		var bundle = archie._cache.bundles[id];
		// set default style
		bundle.style = 'success';
		// add incomplete bundles to summary
		if (!bundle.completed) {
			bundle.style = 'error';
			summary.incompleteBundles.push(id);
			// add error if no error exists and bundle did not complete
			if (!bundle.errors.length && !bundle.warnings.length) {
				bundle.errors.push({type: 'error', msg: 'Bundle did not complete.'});
			}
		}
		// add errors to summary
		if (bundle.errors.length) {
			bundle.style = 'error';
			summary.errors = summary.errors.concat(bundle.errors);
		}
		if (bundle.warnings.length) {
			bundle.style = 'warning';
			summary.warnings = summary.warnings.concat(bundle.warnings);
		}
		// add timers to summary
		summary.durations.push({
			id: id,
			duration: bundle.duration || '??',
			durationPretty: bundle.durationPretty || '??',
			style: bundle.style
		})
	});

	// sort timers by duration
	summary.durations = _.lodash.orderBy(summary.durations, 'duration', 'desc');


	// GENERATE REPORT
	// log bundle durations
	console.log('');
	_.log.detail({style: 'soft'},
		_.repeatString(Math.ceil((summary.lineLength - summary.durationsTitle.length) / 2), '-') +
		' ' + summary.durationsTitle + ' ' +
		_.repeatString(Math.floor((summary.lineLength - summary.durationsTitle.length) / 2), '-')
	);
	console.log('');
	_.lodash.each(summary.durations, function (line) {
		_.log[line.style](
			line.id,
			_.repeatString(summary.lineLength - line.id.length - line.durationPretty.length - 2) +
			line.durationPretty
		);
	});

	// log task duration
	console.log('');
	summary.type = 'success';
	if (summary.errors.length) {
		summary.type = 'error';
	} else if (summary.warnings.length) {
		summary.type = 'warning';
	}
	_.log[summary.type](_.log.style.bold(
		summary.task,
		_.repeatString(summary.lineLength  - summary.task.length - archie._cache.task.durationPretty.length - 4),
		archie._cache.task.durationPretty
	));

	// statistics summary
	console.log('');
	_.log.detail({style: 'soft'},
		_.repeatString(Math.ceil((summary.lineLength - summary.title.length) / 2), '-') +
		' ' + summary.title + ' ' +
		_.repeatString(Math.floor((summary.lineLength - summary.title.length) / 2), '-')
	);
	console.log('');

	// log bundles completed statistics
	if (summary.incompleteBundles.length) {
		_.log.error(summary.incompleteBundles.length, ' of ', summary.sortedBundleKeys.length, ' bundles did not complete:\n', '    ', '- ' + summary.incompleteBundles.join('\n    - '));
	} else {
		_.log.success(summary.sortedBundleKeys.length, ' bundles completed.');
	}

	// log error / warning statistics
	if (summary.errors.length || summary.warnings.length) {
		if (summary.errors.length) {
			_.log.error(summary.errors.length, ' error(s) found' + (archie._config.options.verbose ? ':' : ' :('));
			if (archie._config.options.verbose) {
				_.lodash.each(summary.errors, function (error) {
					_.log.detail({style: 'error'}, '    - ', '[' + error.id + '] ', error.msg);
				});
			}
		}
		if (summary.warnings.length) {
			_.log.warning(summary.warnings.length, ' warning(s) found' + (archie._config.options.verbose ? ':' : '.'));
			if (archie._config.options.verbose) {
				_.lodash.each(summary.warnings, function (warning) {
					_.log.detail({style: 'warning'}, '    - ', '[' + warning.id + '] ', warning.msg);
				});
			}
		}
	} else {
		_.log.success(_.log.style.bold('No errors.'));
	}

	// if no issues, log success message
	if (!summary.incompleteBundles.length && !summary.errors.length && !summary.warnings.length) {
		_.log.success(_.log.style.bold('All systems go... woot woot!!!'));
	}

	// log debug data
	console.log('');
	if (archie._config.options.debug) {
		if (archie._cache.debug.length) {
			_.log.detail({style: 'error'}, 'Debug turned on:');
			_.log.msg.apply(this, archie._cache.debug);
		} else {
			_.log.detail({style: 'info'}, 'Debug turned on.');
		}
	}

	// close summary
	console.log('');
	_.log.detail({style: 'soft'},
		_.repeatString(Math.ceil((summary.lineLength - summary.closing.length) / 2), '-') +
		' ' + summary.closing + ' ' +
		_.repeatString(Math.floor((summary.lineLength - summary.closing.length) / 2), '-')
	);
	console.log('\n');
}
