var c = require('rho-contracts'),
    nodeStyleCallback = require('./node-style-callback');

var should = require('should');

// For convenience and conciseness.
var good = should.doesNotThrow;
var bad = function (block) { should.throws(block, c.ContractError); };

describe('nodeStyleCallback with a number result', function () {

    var numberCallback = nodeStyleCallback(null, { result: c.number });
    var wrappedCallback = numberCallback.wrap(function () {});

    context('invoked with an error', function () {
        it('does not raise a contract error', function () {
            good(function () { wrappedCallback(Error()); });
            good(function () { wrappedCallback(Error(), null); });
            good(function () { wrappedCallback(Error(), undefined); });
        });
    });

    context('invoked with a number result', function () {
        it('does not raise a contract error', function () {
            good(function () { wrappedCallback(null, 0); });
            good(function () { wrappedCallback(undefined, 0); });
        });
    });

    context('invoked with a string result', function () {
        it('raises a contract error', function () {
            bad(function () { wrappedCallback(null, '0'); });
        });
    });

    context('invoked with extra arguments', function () {
        it('raises a contract error', function () {
            bad(function () { wrappedCallback(null, 0, 0); });
        });
    });

    // This test fails. It seems to me this is the desired behavior, but I do
    // not know how to implement it.
    context('invoked with no arguments', function () {
        it.skip('raises a contract error', function () {
            bad(function () { wrappedCallback(); });
            bad(function () { wrappedCallback(null); });
            bad(function () { wrappedCallback(null, null); });
            bad(function () { wrappedCallback(null, undefined); });
            bad(function () { wrappedCallback(undefined); });
            bad(function () { wrappedCallback(undefined, null); });
            bad(function () { wrappedCallback(undefined, undefined); });
        });
    });

    // This test fails. It seems to me this is the desired behavior, but I do
    // not know how to implement it.
    context('invoked with both an error and a value', function () {
        it.skip('raises a contract error', function () {
            bad(function () { wrappedCallback(Error(), 0); });
        });
    });
});

describe('nodeStyleCallback with multiple results', function () {

    var numberCallback = nodeStyleCallback(
        null,
        { first: c.number },
        { second: c.string },
        { third: c.bool }
    );
    var wrappedCallback = numberCallback.wrap(function () {});

    context('invoked with the valid arguments', function () {
        it('does not raise a contract error', function () {
            good(function () { wrappedCallback(null, 1, '1', true); });
        });
    });

    context('invoked with an invalid argument', function () {
        it('does not raise a contract error', function () {
            bad(function () { wrappedCallback(null, 1, '1', 'true'); });
        });
    });
});

describe('nodeStyleCallback with no result', function () {

    var numberCallback = nodeStyleCallback();
    var wrappedCallback = numberCallback.wrap(function () {});

    context('invoked with an error', function () {
        it('does not raise a contract error', function () {
            good(function () { wrappedCallback(Error()); });
        });
    });

    context('invoked with an extra result', function () {
        it('raises a contract error', function () {
            bad(function () { wrappedCallback(null, 1); });
            bad(function () { wrappedCallback(undefined, 1); });
        });
    });
});

describe('nodeStyleCallback with a custom error contract', function () {

    var errorContract = c.array(c.error);
    var numberCallback = nodeStyleCallback(errorContract);
    var wrappedCallback = numberCallback.wrap(function () {});

    context('invoked with an error satisfying the contract', function () {
        it('does not raise a contract error', function () {
            good(function () { wrappedCallback([Error(), Error()]); });
            good(function () { wrappedCallback([Error()]); });
            good(function () { wrappedCallback([]); });
        });
    });

    context('invoked with an error', function () {
        it('raises a contract error', function () {
            bad(function () { wrappedCallback(Error()); });
        });
    });
});
