/**
 * stylus.js
 * -------
 * process the stylus bundle.
 */
var _ = require('lazy-cache')(require);

// export the bundler
var stylus = module.exports = processCss;

/**
 * process all stylus files
 * @param {filepaths} filepaths : array of source file paths
 * @param {object} bundle : bundle configuration
 * @param {object} archie : archie object
 * @return {object}
 */
function processStylus (filepaths, bundle, archie) {
	bundle = bundle || {};

	_.log.info('stylus:', filepaths, bundle);

	return;
}
