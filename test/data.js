/**
 * data.js
 * -------
 * test the data bundle
 */

var test = require('blue-tape');
var deepDiff = require('../lib/utils/deep-compare.js');
var log = require('../lib/utils/logger.js');
var archie = require('../lib/archie.js')._init();

/**
 * attach data to archie
 */
test('Run data bundle', {skip: false}, function (t) {
	t.plan(6);

	// expected
	var expectedData = require('./expected/archie-test-data.json');

	// run test
	archie._collection('data')
		.then(function (results) {
			var diffs;
			// compare data
			diffs = deepDiff(expectedData.site, archie.site);
			t.ok(diffs.length === 0, 'archie.site should match expected/archie-test-data.json.site');
			if (diffs.length) {
				log.group(
					'DIFFERENCES (archie.site): \n',
					diffs
				);
			}
			diffs = deepDiff(expectedData.component1, archie.component1);
			t.ok(diffs.length === 0, 'archie.component1 should match expected/archie-test-data.json.component1');
			if (diffs.length) {
				log.group(
					'DIFFERENCES (archie.component1): \n',
					diffs
				);
			}
			diffs = deepDiff(expectedData.component2, archie.component2);
			t.ok(diffs.length === 0, 'archie.component2 should match expected/archie-test-data.json.component2');
			if (diffs.length) {
				log.group(
					'DIFFERENCES (archie.component2): \n',
					diffs
				);
			}
			diffs = deepDiff(expectedData.site, results.data._main.site);
			t.ok(diffs.length === 0, 'Data bundle should return data._main.site which should equal expected/archie-test-data.json.site');
			if (diffs.length) {
				log.group(
					'DIFFERENCES (results.data._main.site): \n',
					diffs
				);
			}
			diffs = deepDiff(expectedData.component1, results.data._main.component1);
			t.ok(diffs.length === 0, 'Data bundle should return data._main.component1 which should equal expected/archie-test-data.json.component1');
			if (diffs.length) {
				log.group(
					'DIFFERENCES (results.data._main.component1): \n',
					diffs
				);
			}
			diffs = deepDiff(expectedData.component2, results.data._main.component2);
			t.ok(diffs.length === 0, 'Data bundle should return data._main.component2 which should equal expected/archie-test-data.json.component2');
			if (diffs.length) {
				log.group(
					'DIFFERENCES (results.data._main.component2): \n',
					diffs
				);
			}
		});
});


/**
 * attach data to archie.data
 */
test('Run data bundle and attach to `archie.data`', {skip: false}, function (t) {
	t.plan(2);

	// expected
	var expectedData = require('./expected/archie-test-data.json');

	// run test
	archie._collection('data', {property: 'data'})
		.then(function (results) {
			var diffs;
			// compare data
			diffs = deepDiff(expectedData.site, archie.data.site);
			t.ok(diffs.length === 0, 'archie.data.site should match archie-test-data.json.site');
			if (diffs.length) {
				log.group(
					'DIFFERENCES (archie.data.site): \n',
					diffs
				);
			}
			diffs = deepDiff(expectedData.site, results.data._main.site);
			t.ok(diffs.length === 0, 'Data bundle should return data._main.site which should equal archie-test-data.json.site');
			if (diffs.length) {
				log.group(
					'DIFFERENCES (results.data._main.site): \n',
					diffs
				);
			}
		});
});
