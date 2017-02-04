#! /usr/bin/env node

var tapmin = require('../lib/utils/tap-reporter.js');
var stream = tapmin();

process.stdin
	.pipe(stream)
	.pipe(process.stdout);

process.on('exit', function() {
	// if (stream.errors.length) process.exit(1);
});
