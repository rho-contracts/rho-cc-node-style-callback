// jscs:disable disallowNamedUnassignedFunctions

var c = require('rho-contracts'),
    util = require('util'),
    cc = require('./common-contracts'),
    _ = require('underscore');

// Creates a contract for a Node-style callback. The returned contract
// accepts functions whose first argument is `c.any`, and the other
// arguments are specified the same way as `c.fun`.
//
// In the Node-style callback convension, any non-null non-undefined
// value for the first argument indicates an error. When an error is
// indicated, the other arguments must not be present, else a contract
// is raise.
//
// As a special case, invoking a callback with no arguments indicates
// a success. If the success arguments' contract allows it, the
// wrapped function will receive one argument set to `undefined`.
//
// Calling `withError` on the returned contract changes the type of
// the expected error from `c.any` to the contract specified.
//
// Invoking a Node-style callback with both an error and success
// values will raise a `ContractError`.
//
// Finally, the `callback` function itself has a method
// `withDefaultError` which returns a new `callback` function. Using
// this newly created callback function will create contracts whose
// default error contract is the one given to `withDefaultError`.
//
var _makeFailureFnContract = function (errorContract) {
    return c.fun({ error: errorContract }).extraArgs(c.any).rename('callback');
};

var _makeSuccessFnContract = function (contracts) {
    return c.fun.apply(null, [{ error: c.oneOf(null, undefined) }].concat(contracts))
        .rename('callback');
};

var _makeCallback =
    function (defaultError) {
        var result =
            c.fun().extraArgs([cc.oneKeyHash(c.contract)]).returns(c.functionContract)
            .wrap(
                function callback(/*...*/) {
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

                        return oldWrapper.call(self, function (err /*...*/) {

                            if (arguments.length === 0) {
                                // Special case for a zero-argument success; provide a `undefined` first argument.
                                var args = [undefined].concat(_.toArray(arguments));
                                return fnWrappedForSuccess.apply(this, args);

                            } else if (err === null || err === undefined) {
                                // Received no error, check against the normal contract.
                                return fnWrappedForSuccess.apply(this, arguments);

                            } else if (arguments.length !== 1) {
                                // Received both an error and normal arguments, this is always wrong.
                                var msg = util.format(
                                    "Node-style callback invoked with both an error and %s success argument%s",
                                    arguments.length === 2 ? 'a' : arguments.length - 1,
                                    arguments.length > 2 ? 's' : '');
                                context.fail(new c.ContractError(context, msg).fullContract());

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
                }
            );

        result.withDefaultError =
            c.fun({ defaultErrorContract: c.contract })
            .wrap(function (defaultErrorContract) {
                return _makeCallback(defaultErrorContract);
            });

        return result;

    };

var callback = _makeCallback(c.any);

module.exports = { callback: callback };
