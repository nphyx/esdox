const sinon = require("sinon");
exports.printHelp = sinon.stub();
exports.printVersion = sinon.stub();
exports.loadConfigFile = sinon.stub().resolves({
  input: "fake.js"
});
