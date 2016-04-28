rho-cc-node-style-callback
==========================

Create [rho-contracts][] for Node-style callbacks.

[rho-contracts]: https://github.com/bodylabs/rho-contracts.js


Usage
-----

Use this module to create contracts for a Node-style callbacks. The returned contracts
accept functions whose first argument satisfies some error contract, and the other
arguments are specified the same way as `c.fun`.

In the Node-style callback convention, any non-null non-undefined
value for the first argument indicates an error. When an error is
indicated, the other arguments must not be present, else a contract
error is raised.

As a special case, invoking a callback with no arguments will invoke
the wrapped function with one argument set to `undefined`.

Calling `withError` on the returned contract changes the type of
the error argument to the contract specified.

The main entry point of this module is `withDefaultError`, which sets
the expected error contract, like this:

```js

var c = require('rho-contracts');

var cc = {};

cc.callback = require('rho-cc-node-style-callback').withDefaultError(c.error)
cc.countCallback = cc.callback({ result: c.number })
```


Installation
------------

```sh
npm install rho-contracts rho-cc-node-style-callback
```


Contribute
----------

- Issue Tracker: https://github.com/bodylabs/rho-cc-node-style-callback/issues
- Source Code: https://github.com/bodylabs/rho-cc-node-style-callback

Pull requests welcome!


Support
-------

If you are having issues, please let us know.


License
-------

The project is licensed under the Mozilla Public License Version 2.0.
