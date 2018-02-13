const sinon = require("sinon");
exports.readFile = sinon.stub().callsArgWith(1, null, true);
exports.writeFile = sinon.stub().callsArgWith(2, null, true);
exports.mkdir = sinon.stub().callsArgWith(1, null, true);
exports.stat = sinon.stub().callsArgWith(1, null, true);
exports.exists = sinon.stub().callsArgWith(1, null, true);
