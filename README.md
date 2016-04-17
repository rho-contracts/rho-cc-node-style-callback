rho-cc-node-style-callback
==========================

Create [rho-contracts][] for Node-style callbacks.

[rho-contracts]: https://github.com/bodylabs/rho-contracts.js


Usage
-----

```js

var c = require('rho-contracts'),
    nodeStyleCallback = require('rho-cc-node-style-callback');

var cc = {};

cc.countCallback = nodeStyleCallback(null, { result: c.number })
    .rename('countCallback');
```

When a function wrapped in this contract is invoked:

- If an error is present it must satisfy `c.error`.
- If a result is present, it must satisfy `c.number`.
- No additional arguments are allowed.

The caller can optionally specify a contract for the error:

```js
cc.countCallback = nodeStyleCallback(c.array(c.error), { result: c.number })
    .rename('countCallback');
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
