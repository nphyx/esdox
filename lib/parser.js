/**
 * Re-exports JSDoc as a promise.
 */
const promisify = require("util").promisify;
const jsdocParser = require('jsdoc3-parser');
module.exports = promisify(jsdocParser);
