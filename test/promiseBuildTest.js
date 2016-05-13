var runTests = require('./tests.js');

var PromiseLiteBuild = require('../dist/promiselite.js');
runTests(PromiseLiteBuild, 'build');
