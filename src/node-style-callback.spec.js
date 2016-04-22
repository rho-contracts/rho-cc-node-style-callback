var c = require('rho-contracts'),
    should = require('should'),
    _ = require('underscore');

_.extend(c, require('./node-style-callback'));


// For convenience and conciseness.
var good = should.doesNotThrow;
var bad = function (block) { should.throws(block, c.ContractError); };


describe('c.callback with a number result', function () {

    var numberCallback = c.callback({ result: c.number });
    var wrappedCallback = numberCallback.wrap(function () {});

    context('invoked with an error', function () {
        it('does not raise a contract error', function () {
            good(function () { wrappedCallback(Error()); });
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

    context('invoked with no arguments', function () {
        it('raises a contract error', function () {
            bad(function () { wrappedCallback(); });
            bad(function () { wrappedCallback(null); });
            bad(function () { wrappedCallback(null, null); });
            bad(function () { wrappedCallback(null, undefined); });
            bad(function () { wrappedCallback(undefined); });
            bad(function () { wrappedCallback(undefined, null); });
            bad(function () { wrappedCallback(undefined, undefined); });
        });
    });

    context('invoked with both an error and a value', function () {
        it('raises a contract error', function () {
            bad(function () { wrappedCallback(Error(), 0); });
            bad(function () { wrappedCallback(Error(), null); });
            bad(function () { wrappedCallback(Error(), undefined); });
        });
    });
});

describe('c.callback with multiple results', function () {

    var numberCallback = c.callback(
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

    context('invoked with an error', function () {
        it('does not raise a contract error', function () {
            good(function () { wrappedCallback(Error()); });
        });
    });

    context('invoked with an invalid argument', function () {
        it('raise a contract error', function () {
            bad(function () { wrappedCallback(null, 1, '1', 'true'); });
        });
    });
});

describe('c.callback with no result', function () {

    var emptyCallback = c.callback();
    var wrappedCallback = emptyCallback.wrap(function () {});

    it('is invoked normally with no arguments', function () {
        good(function () { wrappedCallback(); });
    });

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

describe('c.callback with optional results', function () {
    var optionCallback = c.callback({ result: c.optional(c.number) }).withError(c.string);
    var wrapped = optionCallback.wrap(function () {});

    it('is invoked normally with no arguments', function () {
        good(function () { wrapped(); });
    });

    context('invoked with an incorrect error', function () {
        it('raise a contract error', function () {
            bad(function () { wrapped(Error()); });
        });
    });

    context('invoked with a result', function () {
        it('does not a contract error', function () {
            good(function () { wrapped(null, 1); });
            good(function () { wrapped(undefined, 1); });
        });
    });

    context('invoked with an extra result', function () {
        it('does not a contract error', function () {
            bad(function () { wrapped(null, 1, 2); });
            bad(function () { wrapped(undefined, 1, 3); });
        });
    });
});

describe('c.callback with a custom error contract', function () {

    var errorContract = c.array(c.error);
    var numberCallback = c.callback().withError(errorContract);
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

describe('c.callback with a `returns` contract', function () {
    var returnsContract = c.callback({ result: c.bool }).withError(c.error).returns(c.number);
    var goodCallback = returnsContract.wrap(function () { return 12; });
    var badCallback = returnsContract.wrap(function () { return false; });

    it('displays a good description', function () {
        returnsContract.toString().should.eql('c.callback(c.error, c.bool -> c.number)');
    });

    context('when wrapping a good function', function () {
        it('does not raise an error', function () {
            good(function () { goodCallback(null, true); });
            goodCallback(null, true).should.be.eql(12);
        });
    });
    context('when wrapping a broken function', function () {
        it('raise an error', function () {
            bad(function () { badCallback(null, true); });
        });
    });
});
