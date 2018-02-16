/**
 * Hyperpedantic unit tests for the main module. Basically just making
 * sure that everything is wired up correctly.
 */
const proxy = require("proxyquire");
const promisify = require("util").promisify;
const path = require("path");
const sinon = require("sinon");
const esdoxStubs = require("./stubs/esdox.stubs");
const fsStubs = require("./stubs/fs.stubs");
const cliStubs = require("./stubs/cliUtil.stubs");
const fsm = require("fs-magic");
const testOutputDirectory = "./test/output";
const {analysisResult} = require("../lib/analyze");
require("should");
require("should");
require("should-sinon");

const esdox = proxy("../esdox", {
  "./lib/parser": esdoxStubs.parser,
  "./lib/analyze": esdoxStubs.analyze,
  "./lib/generate": esdoxStubs.generate,
  "./lib/cliUtil": cliStubs,
  "fs-magic": fsStubs
});

const {collectIndexData, generate, analyze} = esdox;

describe("esdox", () => {
  function cwdWrap(dir) {
    return path.join(process.cwd(), dir);
  }

  describe("createDirectoryRecursive", () => {
    it("should check whether a directory exists", async () => {
      await esdox.createDirectoryRecursive(testOutputDirectory);
      fsStubs.stat.should.be.calledWith(cwdWrap(testOutputDirectory));
    });
    it("should try to create parent directories recursively", async () => {
      fsStubs.stat.resetHistory();
      fsStubs.stat.onFirstCall().rejects({code: "ENOENT"});
      fsStubs.stat.onSecondCall().resolves(true);
      sinon.spy(esdox, "createDirectoryRecursive");
      await esdox.createDirectoryRecursive(testOutputDirectory);
      fsStubs.stat.should.be.calledWith(cwdWrap(testOutputDirectory));
      fsStubs.stat.should.be.calledWith(cwdWrap(path.dirname(testOutputDirectory)));
      fsStubs.mkdir.should.be.calledWith(cwdWrap(path.dirname(testOutputDirectory)));
      fsStubs.mkdir.should.be.calledWith(cwdWrap(testOutputDirectory));
      fsStubs.stat.resolves(true);
      esdox.createDirectoryRecursive.restore();
    });
    it("should not complain if the directory already exists", (done) => {
      fsStubs.mkdir.reset();
      fsStubs.mkdir.rejects({code: "EEXIST"});
      esdox.createDirectoryRecursive("./test").should.be.resolved()
        .then(() => {
          fsStubs.mkdir.resolves(true);
          done();
        });
    });
    it("should complain on filesystem errors", (done) => {
      fsStubs.stat.rejects({code: "SUPERFAIL"});
      // would prefer async/await but it's easier to check rejects this way
      esdox.createDirectoryRecursive("./test").should.be.rejected()
        .then(() => {
          fsStubs.stat.resolves(true);
          fsStubs.mkdir.rejects({code: "SUPERFAIL"});
          return esdox.createDirectoryRecursive("./test").should.be.rejected()
        })
        .then(() => {
          fsStubs.mkdir.resolves(true);
          done();
        });
    });
  });

  describe("main", () => {
    var _exit, _consoleLog, _consoleError;
    const stubLog = sinon.stub();
    const stubError = sinon.stub();
    beforeEach(() => {
      _exit = process.exit;
      _consoleError = console.error;
      process.exit = sinon.stub();
      console.error = sinon.stub();
      sinon.spy(console, "log");
      sinon.spy(esdox, "createDirectoryRecursive");
      fsStubs.writeFile.resetHistory();
      fsStubs.stat.resetHistory();
      console.error.resetHistory();
      fsStubs.stat.resolves({isDirectory: () => true});
      esdoxStubs.parser.resetHistory();
      esdoxStubs.analyze.resetHistory();
      esdoxStubs.generate.resetHistory();
    });

    afterEach(() => {
      process.exit = _exit;
      console.error = _consoleError;
      console.log.restore();
      esdox.createDirectoryRecursive.restore();
    });

    it("should complain if a file does not exist", async () => {
      fsStubs.stat.onFirstCall().rejects({code: "ENOENT"});
      try {
        await esdox({input: ["doesntexist.js"]})
      } catch (err) {
        err.message.should.eql("file does not exist: doesntexist.js");
      }
    });
    it("should complain if it didn't receive any javascript files", async () => {
      fsStubs.stat.resetBehavior();
      fsStubs.stat.resolves({isDirectory: () => false});
      fsStubs.scandir.resolves([[], []]);
      try {
        await esdox({input: ["./foo.css", "./bar.php"]})
      } catch (err) {
        err.message.should.eql("no javascript files in input path");
      }
      fsStubs.scandir.resolves([[],[]]);
    });
    it("should bubble other filesystem errors", async () => {
      fsStubs.stat.onFirstCall().rejects({code: "ESOMEERROR"});
      try {
        await esdox({input: ["doesntexist.js"]})
      } catch (err) {
        err.code.should.eql("ESOMEERROR");
      }
    });
    it("should handle a single file", async () => {
      fsStubs.stat.onFirstCall().resolves({isDirectory: () => false});
      const opts = {input: ["fake.js"], output: "./test/output", indexName: "index.md",
        templates: "templates"};
      const source = path.join(path.dirname("fake.js"), path.basename("fake.js"));
      let generated = await esdox(opts);
      esdoxStubs.parser.should.be.calledWith(source);
      esdoxStubs.analyze.should.be.calledWith([], opts);
      esdoxStubs.generate.should.be.calledWith(
        {...analysisResult(), ...{source: "fake.js", basename: "fake.js"}},
        opts
      );
    });
    it("should handle a directory", async () => {
      fsStubs.stat.onFirstCall().resolves({isDirectory: () => true});
      const opts = {
        input: ["./fixtures"],
        output: "./test/output",
        templates: "templates"
      };
      let [fixtureList, dirs] = await fsm.scandir(opts.input[0], false);
      fsStubs.scandir.resolves([fixtureList, dirs]);
      fixtureList = fixtureList
        .filter(file => file.match(/\.js$/))
        .map(file => path.join(opts.input[0], file));
      await esdox(opts);
      console.error.should.not.be.called();
      esdoxStubs.parser.callCount.should.eql(fixtureList.length);
      esdoxStubs.analyze.callCount.should.eql(fixtureList.length);
      esdoxStubs.generate.callCount.should.eql(fixtureList.length);
      fsStubs.scandir.resolves([[],[]]);
    });
    it("should recurse subdirectories with opts.recursive", async () => {
      const opts = {
        recursive: true,
        input: ["./fixtures"],
        output: "./test/output",
        templates: "templates"
      };
      let [fixtureList, dirs] = await fsm.scandir(opts.input[0]);
      fsStubs.scandir.resolves([fixtureList, dirs]);
      await esdox(opts);
      console.error.should.not.be.called();
      esdoxStubs.parser.callCount.should.eql(fixtureList.length);
      esdoxStubs.analyze.callCount.should.eql(fixtureList.length);
      esdoxStubs.generate.callCount.should.eql(fixtureList.length);
      fsStubs.scandir.resolves([[],[]]);
    });
    it("should keep directory structure in output with opts.keepFs", async () => {
      fsStubs.stat.onFirstCall().resolves({isDirectory: () => true});
      const opts = {
        input: ["./fixtures"],
        output: "./test/output",
        templates: "templates",
        keepFs: true
      };
      let [fixtureList, dirs] = await fsm.scandir(opts.input[0]);
      fsStubs.scandir.resolves([fixtureList, dirs]);
      await esdox(opts);
      console.error.should.not.be.called();
      esdoxStubs.parser.callCount.should.eql(fixtureList.length);
      esdoxStubs.analyze.callCount.should.eql(fixtureList.length);
      esdoxStubs.generate.callCount.should.eql(fixtureList.length);
      fsStubs.scandir.resolves([[],[]]);
    });
    it("should process options, wrapping input as an array and providing defaults", async () => {
      const opts = {
        input: "./fixtures",
        output: "./test/test_output"
      }
      let [fixtureList, dirs] = await fsm.scandir(opts.input, false);
      fsStubs.scandir.resolves([fixtureList, dirs]);
      await esdox(opts);
      console.error.should.not.be.called();
      esdoxStubs.parser.callCount.should.eql(fixtureList.length);
      esdoxStubs.analyze.callCount.should.eql(fixtureList.length);
      esdoxStubs.generate.callCount.should.eql(fixtureList.length);
      fsStubs.scandir.resolves([[],[]]);
    });
    it("should create files", async () => {
      const opts = {
        input: "./fixtures",
        output: "./test/output",
        index: true,
        keepFs: true,
        templates: "templates"
      };
      let [fixtureList, dirs] = await fsm.scandir(opts.input);
      fsStubs.scandir.resolves([fixtureList, dirs]);
      await esdox(opts);
      console.error.should.not.be.called();
      esdox.createDirectoryRecursive.callCount.should.eql(fixtureList.length + 1);
      fsStubs.writeFile.callCount.should.eql(fixtureList.length + 1);
      fsStubs.scandir.resolves([[],[]]);
    });
  });
});
