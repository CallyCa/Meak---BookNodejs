const fortune = require('../lib/fortune.js');
const expect = require('chai').expect;

// run command
// mocha -u tdd -R spec qa/tests-unit.js 

suite('Fortune cookie tests', () => {
    test('getFortune() should return a fortune', () => {
        expect(typeof fortune.getFortune() === 'string');
    });
});