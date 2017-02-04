/**
 * css.js
 * -------
 * process the css bundle.
 */
var _ = require('lazy-cache')(require);
_('bluebird', 'promise');

// export the bundler
var css = module.exports = processCss;

/**
 * process all css files
 * @param {filepaths} filepaths : array of source file paths
 * @param {object} bundle : bundle configuration
 * @param {object} archie : archie object
 * @return {object}
 */
function processCss (filepaths, bundle, archie) {
	bundle = bundle || {};

	console.log('------\nrunning ' + bundle.type + ':' + bundle.name);

	// can return a promise
	return {id: bundle.name, data: 'working!'};
	// return new _.promise(function (resolve, reject) {
	// 	reject('worky.');
	// 	// setTimeout(function () {
	// 	// 	// resolve({css: 'test'});
	// 	// }, 250);
	// });
}
