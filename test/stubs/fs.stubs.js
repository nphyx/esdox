const sinon = require("sinon");
exports.readFile = sinon.stub().resolves(true);
exports.writeFile = sinon.stub().resolves(true);
exports.mkdir = sinon.stub().resolves(true);
exports.stat = sinon.stub().resolves(true);
exports.exists = sinon.stub().resolves(true);
exports.scandir = sinon.stub().resolves([[],[]]);
