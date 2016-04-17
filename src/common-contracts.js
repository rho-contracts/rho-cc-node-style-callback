var c = require('rho-contracts'),
    _ = require('underscore');

var cc = module.exports = {};

cc.oneKeyHash = c.fun({ value: c.contract })
    .wrap(function (contract) {
        return c.and(
            c.hash(contract),
            c.pred(function (hash) { return _(hash).keys().length === 1; })
        ).rename('a hash containing exactly one key, with a value satisfying ' + contract.toString());
    });
