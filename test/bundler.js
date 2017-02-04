/**
 * bundler.js
 * ---------
 * test archie bundler functions
 */

var test = require('blue-tape');
var archie = require('../lib/archie.js')._init();
var promise = require('bluebird');


/**
 * test `archie build` functionality
 */
test('Test archie._collection() and archie._bundler() functions', {skip: false}, function (t) {
	t.plan(2);

	// run tests
	// run data first
	archie._collection('data')
		.then(function (results) {
			t.ok(results.data, 'archie._collection(\'data\') should return a truthy value');
			// then run all other bundles
			return archie._bundler('all', {exclude: ['data']});
		}).then(function (results) {
			t.ok(results.html && results.css && results.js && results.custom, 'archie._bundler() should return a truthy value');
		});
});


/**
 * test archie_.bundle() syncronous script
 */
test('Test archie._bundle() with a custom, syncronous script', {skip: false}, function (t) {
	t.plan(1);

	// add test bundle
	archie._config.test = {
		_main: {
			options: {
				script: function () {
					return {
						test: 'it worked!!!'
					};
				}
			}
		}
	};

	// run tests
	return archie._bundle('test', '_main')
		.then(function (result) {
			t.ok(result.test._main.test === 'it worked!!!', 'Return value for test._main.test should be \'it worked!!!\'');
		});
});


/**
 * test archie_.bundle() asyncronous script
 */
test('Test archie._bundle() with a custom, asyncronous script', {skip: false}, function (t) {
	t.plan(1);

	// add test bundle
	archie._config.test = {
		_main: {
			options: {
				script: function () {
					return new promise(function (resolve) {
						setTimeout(function () {
							return resolve({message: 'it worked!!!'});
						}, 600);
					});
				}
			}
		}
	};

	// run tests
	return archie._bundle('test', '_main')
		.then(function (result) {
			t.ok(result.test._main.message === 'it worked!!!', 'Return value for test._main.test.message should be \'it worked!!!\'');
		});
});


/**
 * test archie_.bundle() syncronous script
 */
test('Test archie._bundle() syncronously with a falsy return value', {skip: false}, function (t) {
	t.plan(1);

	// add test bundle
	archie._config.test = {
		_main: {
			options: {
				script: function () {
					return false;
				}
			}
		}
	};

	// run tests
	return archie._bundle('test', '_main')
		.then(function (result) {
			t.fail('Return value should be false');
		}).catch(function (error) {
			t.ok(error.msg === 'Return value is falsy.', 'Return value should be false');
		});
});


/**
 * test archie_.bundle() asyncronous script
 */
test('Test archie._bundle() asyncronously with a falsy return value', {skip: false}, function (t) {
	t.plan(1);

	// add test bundle
	archie._config.test = {
		_main: {
			options: {
				script: function () {
					return new promise(function (resolve, reject) {
						setTimeout(function () {
							return reject({msg: 'Custom error message... it did not work. :('});
						}, 600);
					});
				}
			}
		}
	};

	// run tests
	return archie._bundle('test', '_main')
		.then(function (result) {
			t.fail('Return value should be a custom error / reject message');
		}).catch(function (error) {
			t.ok(error.msg === 'Custom error message... it did not work. :(', 'Return value should be a custom error / reject message');
		});
});
