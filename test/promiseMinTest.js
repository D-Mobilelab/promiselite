var runTests = require('./tests.js');

var PromiseLiteMin = require('../dist/promiselite.min.js');
runTests(PromiseLiteMin, 'min');

