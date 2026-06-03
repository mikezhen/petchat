// Pure-JS stub for lightningcss-darwin-arm64.
// Used in dev on macOS when the native binary isn't loadable.
// Passes CSS through unchanged — modern browsers support nesting natively.
'use strict';

function passthrough({ code }) {
  return {
    code: Buffer.isBuffer(code) ? code : Buffer.from(code),
    map: null,
    warnings: [],
    dependencies: [],
  };
}

module.exports = {
  transform: passthrough,
  transformStyleAttribute: passthrough,
  bundle: passthrough,
  bundleAsync: (opts) => Promise.resolve(passthrough(opts)),
};
