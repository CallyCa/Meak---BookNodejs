const Browser = require('zombie');
const { assert } = require('chai');

// run command 
// mocha -u tdd spec qa/tests-crosspage.js

let browser;

suite('Cross-Page Tests', () => {
    setup(() => {
        browser = new Browser();
    });

    test('requesting a group rate quote from the hood river tour page' + 
    'shouçd populate the referrer field', () => {
        let referrer = 'http://localhost:3000/tours/hood-river';
        browser.visit(referrer, () => {
            browser.clickLink('requestGroupRate', () => {
                assert(browser.field('referrer').value == referrer);
                done();
            });
        });
    });
});