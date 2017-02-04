/**
 * js.js
 * -------
 * process the js bundle.
 */
var _ = require('lazy-cache')(require);
_('bluebird', 'promise');

// export the bundler
var js = module.exports = processJs;

/**
 * process all js files
 * @param {filepaths} filepaths : array of source file paths
 * @param {object} bundle : bundle configuration
 * @param {object} archie : archie object
 * @return {object}
 */
function processJs (filepaths, bundle, archie) {
	bundle = bundle || {};

	console.log('------\nrunning ' + bundle.type + ':' + bundle.name);

	// can return a promise
	return {testJs: 'I am js.'};
}
