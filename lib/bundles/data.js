/**
 * data.js
 * -------
 * process the data bundle.
 */
var _ = require('lazy-cache')(require);
_('bluebird', 'promise');
_('lodash');
_('path');
_('../utils/files.js', 'files');

var data = module.exports = processData;

/**
 * process all data files
 * @param {filepaths} filepaths : array of source file paths
 * @param {object} bundle : bundle configuration
 * @param {object} archie : archie object
 * @return {object}
 */
function processData (filepaths, bundle, archie) {
	bundle = bundle || {};
	var data = {};

	// iterate over filepaths
	_.lodash.each(filepaths, function eachFilepath (filepath) {
		var property = _.path.basename(filepath).split('.')[0];
		data[property] = _.files.readDataFile(filepath);
	});

	// attach data to archie
	if (bundle.property) {
		archie[bundle.property] = data;
	} else {
		archie = _.lodash.merge(archie, data);
	}

	// return data object
	return data;
	// return new _.promise(function (resolve) {
	// 	setTimeout(function () {
	// 		return resolve(data);
	// 	}, 1000);
	// });
}
