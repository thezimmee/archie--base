/**
 * bundler.js
 * @description bundler / compiler for archie.
 */

var _ = require('lazy-cache')(require);
_('lodash');
_('globby');
_('bluebird', 'promise');
_('./archie.js', 'archie');
_('./utils/logger.js', 'log');


var bundler = module.exports = {
	all: bundler,
	collection: compileCollection,
	bundle: compileBundle
};


/**
 * compile all collections, or pass a list of collections to compile
 * @param {array|string} bundles : which bundles to process ('all' or false process all)
 * @param {object} options : options
 */
function bundler (collections, options) {
	var allPromises = [];

	collections = (collections === 'all') ? _.archie._cache.bundlesList : (collections || _.archie._cache.collections);

	// if collections is a string, compile that collection
	if (typeof collections === 'string') {
		return compileCollection(collections);
	}

	// exclude collections
	if (_.lodash.isArray(options.exclude)) {
		collections = _.lodash.difference(collections, options.exclude);
	}

	// iterate over each collection
	_.lodash.each(collections, function (collectionName) {
		allPromises.push(compileCollection(collectionName));
	});

	// return all promises
	return _.promise.all(allPromises).spread(function () {
		return _.lodash.merge.apply({}, arguments);
	}).catch(function (error) {
		if (!error.bundleId && !error.collections) {
			error = {error: error};
			error.collections = collectionName.toUpperCase();
		}
		if (!error.msg) {
			error.msg = 'Collection(s) failed.';
		}
		_.archie._events.emit('error', error);
	});
}

/**
 * compile a single collection
 * @param {string} collectionName : bundle type or name
 * @param {object} options
 * @return {object} returns a promise
 */
function compileCollection (collectionName, options) {
	var allPromises = [];

	// iterate over each bundle
	_.lodash.each(_.archie._config[collectionName], function (bundle, bundleName) {
		if (_.archie._cache.reservedKeys.indexOf(bundleName) === -1) {
			allPromises.push(compileBundle(collectionName, bundleName, options));
		}
	});

	// return all promises
	return _.promise.all(allPromises).spread(function () {
		return _.lodash.merge.apply({}, arguments);
	}).catch(function (error) {
		if (!error.bundleId && !error.collections) {
			error = {error: error};
			error.collections = collectionName.toUpperCase();
		}
		if (!error.msg) {
			error.msg = 'Collection failed.';
		}
		_.archie._events.emit('error', error);
	});
}


/**
 * compile a bundle
 * @param {type} type : bundle type or collection name
 * @param {name} name : bundle name
 * @param {object} options
 * @return {object} returns a promise
 */
function compileBundle (type, name, options = {}) {
	var bundleId = type.toUpperCase() + ':' + name.replace('_main', 'main');

	// start bundle timer
	_.archie._events.emit('bundle.start', bundleId);
	// _.log.startTimer(bundleId);

	// create bundle object from options to pass to bundle script
	var config = _.archie._config;
	var bundle = _.lodash.merge({
			id: bundleId,
			name: name,
			type: type,
			script: options.script || './bundles/' + type + '.js',
			src: config[type][name].src || config[type].src || config.src,
			dest: config[type][name].dest || config[type].dest || config.dest
		},
		config[type].options,
		config[type][name].options,
		options
	);

	// parse bundle.script
	var script;
	if (typeof bundle.script === 'function') {
		script = bundle.script;
	} else if (typeof bundle.script === 'string') {
		script = require(bundle.script);
	} else {
		return _.archie._events.emit('error', {bundleId: bundleId, type: 'error', msg: '`options.script` must be a function or string.'});
	}

	// try to run script
	return _.promise.try(function () {
		return _.globby(bundle.src);
	}).then(function (filepaths) {
		// warn if no files exist for this glob
		if (!filepaths.length) {
			return _.archie._events.emit('error', {bundleId: bundleId, type: 'warning', msg: 'No files found for ' + _.log.style.paths(bundle.src) + '.'});
			// return new Error({bundleId: bundleId, type: 'warning', msg: 'No files found for ' + _.log.style.paths(bundle.src) + '.'});

			// _.archie._events.emit({type: 'warning', msg: 'No files found for ' + _.log.style.paths(bundle.src) + '.'});
			// return false;
		}
		return script(filepaths, bundle, _.archie);
	}).then(function (result) {
		// return error if result is falsy
		if (!result) {
			return _.archie._events.emit('error', {bundleId: bundleId, type: 'error', msg: 'Return value is falsy.'});
			// return new Error({bundleId: bundleId, type: 'error', msg: 'Return value is falsy.'});
			// throw 'Return value is falsy.';
		}
		// create result object
		var resultData = {};
		resultData[type] = {};
		resultData[type][name] = result;
		_.archie._events.emit('bundle.complete', bundleId);
		return resultData;
	}).catch(function (error) {
		if (typeof error === 'string') {
			error = {
				msg: error
			};
		}
		error.msg = error.msg || 'Bundle failed.';
		error.bundleId = error.bundleId || bundleId;
		error.type = error.type || 'error';
		_.archie._events.emit('error', error);
	});
}
