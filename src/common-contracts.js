var c = require('rho-contracts'),
    _ = require('underscore');

var cc = module.exports = {};

cc.oneKeyHash = c.fun({ valueContract: c.contract })
    .wrap(function (valueContract) {
        return c.and(
            c.hash(valueContract),
            c.pred(function (hash) { return _(hash).keys().length === 1; })
        ).rename('a hash containing exactly one key, with a value satisfying ' + valueContract.toString());
    });
