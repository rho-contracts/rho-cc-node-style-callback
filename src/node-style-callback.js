var c = require('rho-contracts'),
    cc = require('./common-contracts'),
    _ = require('underscore');

// Create a contract for a Node-style callback. Pass in an optional contract
// for the `err` argument. (If `null` or `undefined` is specified, the error
// must satisfy `c.error`.) Follow with rho-contracts-style argument specs for
// the remaining arguments, e.g. `{ results: c.array(c.number) }`.
//
var nodeStyleCallback = module.exports = c.fun({ errorContract: c.optional(c.contract) })
    .extraArgs(c.array(cc.oneKeyHash(c.contract)))
    .wrap(function (errorContract) {
        var errorArgSpec = { err: c.optional(errorContract || c.error) };

        var rawResultArgSpecs = Array.prototype.slice.call(arguments, 1);
        var resultArgSpecs = _(rawResultArgSpecs).map(function (argSpec) {
            return _(argSpec).mapObject(function (contract) {
                // Seems like an unnecessary lambda, but it's not. We need to
                // discard remaining arguments to mapObject.
                return c.optional(contract);
            });
        });

        var argSpecs = [errorArgSpec].concat(resultArgSpecs);

        return c.fun.apply(null, argSpecs);
    });

module.exports = nodeStyleCallback;
