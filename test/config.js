/**
 * config.js
 * ---------
 * test config files
 */
var test = require('blue-tape');
var deepDiff = require('../lib/utils/deep-compare.js');
// delete require.cache[require.resolve('../lib/archie.js')];
var archie = require('../lib/archie.js')._init();
var log = require('../lib/utils/logger.js');


/**
 * parse archie.js config file
 */
test('Build config from archie.js', {skip: false}, function (t) {
	t.plan(2);

	// setup
	var diffs;

	// expected
	var expectedConfig = require('./expected/archie-parsed.js');
	var expectedSystemCache = {
		configPath: './archie.js',
		bundlesList: ['data', 'html', 'css', 'js', 'custom'],
		task: {
			errors: [],
			warnings: [],
			bundlesStarted: [],
			bundlesCompleted: []
		},
		debug: [],
		initialized: true,
		isProd: false,
		root: '/Volumes/Home/Projects/archie',
		reservedKeys: [ 'src', 'dest', 'options' ]
	};

	// run tests
	archie._init({reset: true});
	// compare config
	diffs = deepDiff(expectedConfig, archie._config, 'archie.js config');
	t.ok(diffs.length === 0, 'archie._config (from archie.js) should match expected/archie-parsed.js');
	if (diffs.length) {
		log.group(
			'DIFFERENCES (archie._config): \n',
			diffs
		);
	}
	// compare system cache
	diffs = deepDiff(expectedSystemCache, archie._cache, 'archie.js cache');
	t.ok(diffs.length === 0, 'archie._cache (from archie.js) should match expected/archie-parsed.js');
	if (diffs.length) {
		log.group(
			'DIFFERENCES (archie._cache): \n',
			diffs
		);
	}
});


/**
 * parse archie.json config file
 */
test('Build config from archie.json', {skip: false}, function (t) {
	t.plan(1);

	// expected
	delete require.cache[require.resolve('./expected/archie-parsed.js')];
	var expectedConfig = require('./expected/archie-parsed.js');
	// update expectedConfig to match expected outcome
	delete expectedConfig.custom;

	// actual
	archie._init({ configPath: 'src/archie.json', reset: true });

	// run tests
	var diffs = deepDiff(expectedConfig, archie._config);
	t.ok(diffs.length === 0, 'archie._config (from archie.json) should match expected/archie-parsed.js');
	if (diffs.length) {
		log.group(
			'DIFFERENCES (archie._config): \n',
			diffs
		);
	}
});


/**
 * parse archie.yaml config file
 */
test('Build config from archie.yaml', {skip: false}, function (t) {
	t.plan(2);

	// setup
	var options = { configPath: 'src/archie.yaml', prod: true, reset: true };
	var diffs;

	// expected
	var expectedConfig = require('./expected/archie-parsed.js');
	var expectedSystemCache = {
		configPath: options.configPath,
		bundlesList: ['data', 'html', 'css', 'js'],
		task: {
			errors: [],
			warnings: [],
			bundlesStarted: [],
			bundlesCompleted: []
		},
		debug: [],
		initialized: true,
		root: '/Volumes/Home/Projects/archie',
		reservedKeys: [ 'src', 'dest', 'options' ],
		isProd: options.prod,
	};
	// modify expected to match expected outcome
	delete expectedConfig.custom;

	// actual
	archie._init(options);

	// run tests
	// compare config
	diffs = deepDiff(expectedConfig, archie._config);
	t.ok(diffs.length === 0, 'archie._config (from archie.yaml) should match expected/archie-parsed.js');
	if (diffs.length) {
		log.group(
			'DIFFERENCES (archie._config): \n',
			diffs
		);
	}
	// compare system config
	diffs = deepDiff(expectedSystemCache, archie._cache);
	t.ok(diffs.length === 0, 'archie._cache (from archie.yaml) should match expected/archie-parsed.js');
	if (diffs.length) {
		log.group(
			'DIFFERENCES (archie._cache): \n',
			diffs
		);
	}
});
