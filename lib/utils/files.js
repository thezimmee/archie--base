/**
 * files.js
 * @description utility to work with files and globs
 */
var _ = require('lazy-cache')(require);
_('path');
_('js-yaml', 'yaml');
_('fs-extra', 'fse');


var data = module.exports = {
	readDataFile: readDataFile
};


/**
 * read contents from a js, json, or yaml file
 * @param {string} filepath path of file to read
 * @return {object} filedata file contents
 */
function readDataFile (filepath) {
	var fileext = _.path.extname(filepath);
	var filedata = {};
	var filename;
	var resolve;
	var reject;
	if (fileext === '.yaml' || fileext === '.yml') {
		filedata = _.yaml.safeLoad(_.fse.readFileSync(filepath));
	} else if (fileext === '.json') {
		filedata = _.fse.readJsonSync(filepath, resolve);
	} else if (fileext === '.js') {
		filedata = require(_.path.resolve(process.cwd(), filepath));
	}
	return filedata;
}
