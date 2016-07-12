/* eslint-disable func-names */

var c = require('rho-contracts-fork'),
    errors = require('rho-contracts-fork/src/contract-errors'),
    util = require('util'),
    _ = require('underscore');

var _makeFailureFnContract = function (errorContract) {
    return c.fun({ error: errorContract }).extraArgs(c.any).rename('callback');
};

var _makeSuccessFnContract = function (contracts) {
    return c.fun.apply(null, [{ error: c.oneOf(null, undefined) }].concat(contracts))
        .rename('callback');
};

var makeCallback =
    function (defaultError) {
        var result =
            function callback(/* ... */) {
                var result = c.fun().extraArgs(c.any);

                result._successContract = _makeSuccessFnContract(_.toArray(arguments));

                result._failureContract = _makeFailureFnContract(defaultError);

                result.withError = c.fun({ newErrorContract: c.contract }).wrap(
                    function withError(newErrorContract) {
                        var self = this;
                        return _.extend(
                            {}, self,
                            { _failureContract: _makeFailureFnContract(newErrorContract) });
                    });

                var oldWrapper = result.wrapper;
                result.wrapper = function (fn, next, context) {
                    var self = this;

                    var fnWrappedForErr = self._failureContract.wrapper(fn, next, context);
                    var fnWrappedForSuccess = self._successContract.wrapper(fn, next, context);

                    return oldWrapper.call(self, function (/* ... */) {
                        var err = arguments[0];

                        if (arguments.length === 0) {
                            // Special case for a zero-argument success; provide an `undefined` first argument.
                            return fnWrappedForSuccess.apply(this, [undefined]);

                        } else if (err === null || err === undefined) {
                            // Received no error, check against the normal contract.
                            return fnWrappedForSuccess.apply(this, arguments);

                        } else if (arguments.length !== 1) {
                            // Received both an error and normal arguments, this is always wrong.
                            var msg = util.format(
                                "Node-style callback invoked with both an error and %s success argument%s",
                                arguments.length === 2 ? 'a' : arguments.length - 1,
                                arguments.length > 2 ? 's' : '');
                            context.fail(new errors.ContractError(context, msg).fullContract());

                        } else {
                            // Received an error, check it.
                            return fnWrappedForErr.apply(this, arguments);
                        }
                    }, next, context);
                };

                result.contractName = 'callback';

                result.toString = function () {
                    var self = this;
                    var fC = self._failureContract;
                    var sC = self._successContract;

                    return "c." + self.contractName + "(" +
                        (self.thisContract !== c.any ? "this: " + self.thisContract + ", " : "") +
                        fC.argumentContracts[0].toString() + ", " +
                        sC.argumentContracts.slice(1).join(", ") +
                        (sC.extraArgumentContract ? "..." + sC.extraArgumentContract : "") +
                        " -> " + self.resultContract + ")";
                };

                return result;
            };

        return result;

    };

exports.callback = makeCallback(c.any);
exports.withDefaultError = makeCallback;
