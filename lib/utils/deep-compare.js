/**
 * deep-compare.js
 * @description deep compare two objects and log any differences
 * @param {obj} objA object to compare to
 * @param {obj} objB object to compare with
 */
 var _ = require('lodash');
 var log = require('./logger.js');

 module.exports = function compareObjects (objA, objB, options = {}) {
 	var differences = deepCompare(objA, objB);

	// options is options.title if it's a string
	if (typeof options === 'string') {
		options = {title: options};
	}

	if (options.log && differences.length) {
		// log.msg(' \n');
		log.msg('------------ \n\n ');
		log.msg('DIFFERENCES' + (options.title ? ' (' + options.title + ')' : '') + ':\n ');
		_.eachRight(differences, function logDiffs (diff, i) {
			log.msg(diff);
			console.log('\n ');
		});
	}

	return differences || [];
}


/**
 * deep property lookup from a string or array
 * @param {obj} obj : source object
 * @param {array|string} array : array or string to lookup
 * @return {obj} returns property lookup value
 */
function deepLookup (obj, array) {
	if (typeof array === 'string') {
		array = array.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
		array = array.replace(/^\./, ''); // strip a leading dot
		array = array.split('.');
	}
	for (var i = 0, n = array.length; i < n; ++i) {
		var k = array[i];
		if (k in obj) {
			obj = obj[k];
		} else {
			return;
		}
	}
	return obj;
}


function deepCompare (objA, objB, cache) {
	var clone;
	// convert array to longest of the two
	if (_.isArray(objA)) {
		clone = objA.concat(objB).splice(0, Math.max(objA.length, objB.length));
	// merge object so it contains all properties
	} else {
		clone = _.merge({}, objA, objB);
	}
	cache = cache || {obj: clone, keys: []};
	return _.reduce(clone, function reduceObject (result, value, key) {
		// push key to object keys
		cache.keys.push(key);
		// calculate new keys, make sure it exists in original object
		while (!_.has(cache.obj, cache.keys)) {
			cache.keys.splice(-2, 1);
		}
		// if property doesn't exist on, skip it to prevent error
		if (typeof objB === 'undefined') {
			return pushDiff(result, objA[key], undefined, cache.keys, key);
		}
		if (typeof objA === 'undefined') {
			return pushDiff(result, undefined, objB[key], cache.keys, key);
		}
		// rerun compare if this objA[key] is an object
		if (typeof objA[key] === 'object' || typeof objB[key] === 'object') {
			return deepCompare(objA[key], objB[key], cache).concat(result);
		}
		// compare functions
		if ((typeof objA[key] === 'function' && typeof objB[key] === 'function')) {
			if (objA[key].toString() === objB[key].toString()) {
				return result;
			}
			return pushDiff(result, objA[key], objB[key], cache.keys, key);
		}
		// otherwise compare values & log differences
		if (objA[key] !== objB[key]) {
			return pushDiff(result, objA[key], objB[key], cache.keys, key);
		}
		return result;
	}, []);

	function pushDiff (result, a, b, path) {
		// var type;
		// if (typeof a !== 'undefined') {
		// 	type = typeof a;
		// } else if (typeof b !== 'undefined') {
		// 	type = typeof b;
		// }
		return result.concat({
			path: path.join('.'),
			// type: type,
			expected: a,
			actual: b,
		});
	}
}
