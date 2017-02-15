/**
 * install.js
 * ----------
 * test the install of the /sample archie buildling block (run with archie test to test Archie the Runner).
 */


var test = require('blue-tape');


test('Install sample block', function (t) {
	var shell = require('shelljs');
	var path = require('path');
	var fs = require('fs-extra');

	t.plan(1);

	// run dependent actions
	var testPath = path.join(process.cwd(), '.test');
	shell.exec('archie i sample ' + testPath);

	// expected
	var expectedPackageJson = fs.readFileSync(path.join(process.cwd(), 'tests/fixtures/sample/package.json')).toString();
	// actual
	var actualPackageJson = fs.readFileSync(testPath + '/package.json').toString();

	// run test
	t.equal(actualPackageJson, expectedPackageJson, 'Install /sample block successfully.');

	// clean up
	shell.rm('-rf', testPath);
})
