/**
 * logger.js
 * ---------
 * @description replacement for console.log with colors, object logging, and timer logging.
 */

var _ = require('lazy-cache')(require);
_('util');
_('lodash');
_('chalk', 'c');

var logger = module.exports = {
	msg: message,
	detail: log,
	highlight: highlight,
	group: group,
	info: info,
	success: success,
	warning: warning,
	error: error,
	style: {
		info: _.c.blue,
		success: _.c.green,
		warning: _.c.yellow,
		error: _.c.bold.red,
		prompt: _.c.gray,
		soft: _.c.cyan,
		paths: _.c.magenta,
		green: _.c.green,
		blue: _.c.blue,
		red: _.c.red,
		cyan: _.c.cyan,
		yellow: _.c.yellow,
		magenta: _.c.magenta,
		bold: _.c.bold,
		dim: _.c.dim,
		number: _.c.magenta,
		boolean: _.c.yellow,
		string: _.c.cyan,
		date: _.c.blue,
		regexp: _.c.red,
		null: _.c.grey,
		undefined: _.c.grey,
		special: _.c.green,
		reset: _.c.reset,
	}
};
var style = logger.style;


function log (options) {
	// get args
	var args = Array.prototype.slice.call(arguments, 1);
	// default options
	options = _.lodash.assign({
		prefix: false,
		style: false
	}, options);
	// add prefix
	if (options.prefix) {
		args.unshift(options.prefix);
	}
	// make objects pretty
	args = prettyPrintObjects(args);
	args = args.join('');
	// apply style
	if (options.style) {
		args = style[options.style](args);
	}
	// log it
	console.log(args);
}
function message () {
	var args = Array.prototype.slice.call(arguments, 0);
	args.unshift({});
	log.apply(this, args);
}
function info () {
	var args = Array.prototype.slice.call(arguments, 0);
	args.unshift({prefix: '[ℹ] ', style: 'info'});
	log.apply(this, args);
}
function success () {
	var args = Array.prototype.slice.call(arguments, 0);
	args.unshift({prefix: '[✔] ', style: 'success'});
	log.apply(this, args);
}
function warning () {
	var args = Array.prototype.slice.call(arguments, 0);
	args.unshift({prefix: '[!] ', style: 'warning'});
	log.apply(this, args);
}
function error () {
	var args = Array.prototype.slice.call(arguments, 0);
	args.unshift({prefix: '[✖] ', style: 'error'});
	log.apply(this, args);
}
function highlight () {
	var args = Array.prototype.slice.call(arguments, 0);
	var result = [];
	var types = ['boolean', 'number', 'string', 'undefined', 'null', 'date'];

	_.lodash.each(args, function (item, i) {
		var type;
		if (item === 'true' || item === 'false') {
			type = 'boolean';
		} else if (!isNaN(item)) {
			type = 'number';
		} else if (item === 'undefined') {
			type = 'undefined';
		} else if (item === 'null') {
			type = 'null';
		} else {
			type = typeof item;
		}
		if (!style[type]) {
			type = 'reset';
		}
		message(style[type](item));
	});
}
function group () {
	var args = Array.prototype.slice.call(arguments, 0);
	args.unshift({prefix: '--- \n'});
	args.push('\n--- \n');
	log.apply(this, args);
}


/**
 * inspect arguments for objects
 * @param {object array} array : arguments passed from a console log
 */
function prettyPrintObjects (array, options = {colors: true, depth: 3, maxArrayLength: 10}) {
	// if (!_.lodash.isArray(array) &&) {
	// 	return prettyPrintObject(array);
	// }

	// set util.inspect color theme
	_.util.inspect.styles.number = 'magenta';
	_.util.inspect.styles.boolean = 'yellow';
	_.util.inspect.styles.string = 'cyan';
	_.util.inspect.styles.date = 'blue';
	_.util.inspect.styles.regexp = 'red';
	_.util.inspect.styles.null = 'grey';
	_.util.inspect.styles.undefined = 'grey';
	_.util.inspect.styles.special = 'green';

	return _.lodash.each(array, function (item, i) {
		var type = typeof item;
		if (type === 'object') {
			return array[i] = _.util.inspect(item, options);
		}
	});
}
