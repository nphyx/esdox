const proxy = require("proxyquire");
const path = require("path");
const sinon = require("sinon");
const jsdpStub = require("./stubs/jsdoc3-parser.stub");
const jsdoxStubs = require("./stubs/jsdox.stubs");
const fsStubs = require("./stubs/fs.stubs");
const packageJson = require("../package.json");
const fakeConfig = require("./stubs/jsdox.config.stub.json");
require("should");
require("should-sinon");

const cliUtil = proxy("../lib/cliUtil", {
  fs: fsStubs
});

describe("cli utilities", () => {
  describe("printVersion", () => {
    it("should print the version number", () => {
      // trivial but what the heck
      const _log = console.log;
      const stubLog = sinon.stub();
      console.log = stubLog;
      cliUtil.printVersion();
      console.log = _log;
      stubLog.should.be.calledWith("Version: " + packageJson.version);
    });
  });
  describe("printHelp", () => {
    it("should print cli usage help", () => {
      const _log = console.log;
      const stubLog = sinon.stub();
      console.log = stubLog;
      cliUtil.printHelp();
      console.log = _log;
      stubLog.callCount.should.be.greaterThan(1);
    });
  });
  describe("loadConfigFile", () => {
    it("should load a config file", async () => {
      const _require = require;
      const fakeFilename = "./test/stubs/jsdox.config.stub.json";
      let config = await cliUtil.loadConfigFile(fakeFilename);
      config.should.eql(fakeConfig);
    });
    it("should complain if the config file doesn't exist", async () => {
      cliUtil.loadConfigFile("nope.json").should.be.rejectedWith(
        "config file not found");
    });
  });
});
