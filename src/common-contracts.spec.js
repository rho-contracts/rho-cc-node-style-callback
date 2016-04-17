var c = require('rho-contracts'),
    cc = require('./common-contracts');

var should = require('should');

describe('oneKeyHash of numbers', function () {

    var oneKeyHashOfNumbers = cc.oneKeyHash(c.number);

    context('given a one-key hash of a number', function () {
        var value = { a: 1 };

        it('accepts it', function () {
            should.doesNotThrow(function () { oneKeyHashOfNumbers.check(value); });
        });
    });

    context('given an empty hash', function () {
        var value = {};

        it('rejects it', function () {
            should.throws(
                function () { oneKeyHashOfNumbers.check(value); },
                c.ContractError
            );
        });
    });

    context('given a two-key hash of numbers', function () {
        var value = { a: 1, b: 2 };

        it('rejects it', function () {
            should.throws(
                function () { oneKeyHashOfNumbers.check(value); },
                c.ContractError
            );
        });
    });

    context('given a one-key hash of a string', function () {
        var value = { a: '1' };

        it('rejects it', function () {
            should.throws(
                function () { oneKeyHashOfNumbers.check(value); },
                c.ContractError
            );
        });
    });

});
