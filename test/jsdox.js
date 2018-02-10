/**
 * Hyperpedantic unit tests for the main module. Basically just making
 * sure that everything is wired up correctly.
 */
const proxy = require("proxyquire");
const path = require("path");
const sinon = require("sinon");
const jsdpStub = require("./stubs/jsdoc3-parser.stub");
const jsdoxStubs = require("./stubs/jsdox.stubs");
const fsStubs = require("./stubs/fs.stubs");
const cliStubs = require("./stubs/cliUtil.stubs");
const testOutputDirectory = "./test/output";
const recursive = require("recursive-readdir");
require("should");
require("should-sinon");

describe("cliStubs", () => {
  it("should export stub functions", () => {
    cliStubs.printHelp.should.be.a.Function();
    cliStubs.printVersion.should.be.a.Function();
    cliStubs.loadConfigFile.should.be.a.Function();
  });
});

const jsdoxModule = proxy("../jsdox", {
  "jsdoc3-parser": jsdpStub,
  "./lib/analyze": jsdoxStubs.analyze,
  "./lib/generateMD": jsdoxStubs.generateMD,
  "./lib/cliUtil": cliStubs,
  fs: fsStubs
});

const {createDirectoryRecursive, generateForDir, analyze, generateMD, jsdox} = jsdoxModule;

describe("jsdox", () => {
  function cwdWrap(dir) {
    return path.join(process.cwd(), dir);
  }
  describe("createDirectoryRecursive", () => {
    it("should check whether a directory exists", async () => {
      await createDirectoryRecursive(testOutputDirectory);
      fsStubs.stat.should.be.calledWith(cwdWrap(testOutputDirectory));
    });
    it("should try to create parent directories recursively", async () => {
      fsStubs.stat.reset();
      fsStubs.stat.onFirstCall().callsArgWith(1, {code: "ENOENT"});
      fsStubs.stat.onSecondCall().callsArgWith(1, null, true);
      sinon.spy(jsdoxModule, "createDirectoryRecursive");
      await createDirectoryRecursive(testOutputDirectory);
      fsStubs.stat.should.be.calledWith(cwdWrap(testOutputDirectory));
      fsStubs.stat.should.be.calledWith(cwdWrap(path.dirname(testOutputDirectory)));
      fsStubs.mkdir.should.be.calledWith(cwdWrap(path.dirname(testOutputDirectory)));
      fsStubs.mkdir.should.be.calledWith(cwdWrap(testOutputDirectory));
      fsStubs.stat.resetBehavior();
      jsdoxModule.createDirectoryRecursive.restore();
    });
    it("should not complain if the directory already exists", async () => {
      fsStubs.mkdir.callsArgWith(1, {code: "EEXIST"});
      createDirectoryRecursive("./test").should.not.be.rejected();
    });
    it("should complain on filesystem errors", async () => {
      fsStubs.stat.callsArgWith(1, {code: "SUPERFAIL"});
      createDirectoryRecursive("./test").should.be.rejected();
      fsStubs.stat.resetBehavior();
      fsStubs.mkdir.callsArgWith(1, {code: "SUPERFAIL"});
      createDirectoryRecursive("./test").should.be.rejected();
      fsStubs.mkdir.resetBehavior();
    });
  });

  describe("generateFoDir", () => {
    it("should handle a single file", async () => {
      const opts = {input: "fake.js", output: "./test/output", templateDir: "templates"};
      const source = path.join(path.dirname("fake.js"), path.basename("fake.js"));
      const expectedGenCall = {
        source: source,
        dirname: path.dirname(source),
        basename: path.basename(source),
        destination: path.join(opts.output, source).replace(/\.js$/, '.md')
      }

      let generated = await generateForDir(opts);
      jsdpStub.should.be.calledWith(source);
      jsdoxStubs.analyze.should.be.calledWith({}, opts);
      jsdoxStubs.generateMD.should.be.calledWith(
        sinon.match(expectedGenCall), opts.templateDir, true);
      generated.length.should.eql(1);
      generated[0].should.deepEqual({
        source: source,
        destination: expectedGenCall.destination,
        markdown: true
      });
    });
    it("should handle a directory", async () => {
      jsdpStub.resetHistory();
      jsdoxStubs.analyze.resetHistory();
      jsdoxStubs.generateMD.resetHistory();
      fsStubs.stat.resetHistory();
      fsStubs.stat.onFirstCall().callsArgWith(1, null, {isDirectory: () => true});
      let fixtureList = await recursive("./fixtures");
      const opts = {
        input: "./fixtures",
        output: "./test/output",
        templateDir: "templates"
      };
      let generated = await generateForDir(opts);
      jsdpStub.callCount.should.eql(fixtureList.length);
      jsdoxStubs.analyze.callCount.should.eql(fixtureList.length);
      jsdoxStubs.generateMD.callCount.should.eql(fixtureList.length);
      generated.length.should.eql(fixtureList.length);
      generated.forEach((entry, i) => {
        entry.source.should.eql(fixtureList[i]);
        entry.destination.should.eql(
          path.join(opts.output, entry.source).replace(/\.js$/, '.md'));
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
    });

    afterEach(() => {
      process.exit = _exit;
      console.error = _consoleError;
      console.log.restore();
    });

    it("should print help for opts.help then exit", async () => {
      jsdox({help: true});
      cliStubs.printHelp.should.be.called();
      console.error.should.not.be.called();
      process.exit.should.be.called();
    });

    it("should print help if called with no options or input", async () => {
      jsdox();
      cliStubs.printHelp.should.be.called();
      console.error.should.not.be.called();
      process.exit.should.be.called();
    });

    it("should print version number for opts.version then exit", async () => {
      jsdox({version: true});
      cliStubs.printVersion.should.be.called();
      console.error.should.not.be.called();
      process.exit.should.be.called();
    });

    it("should complain when given options but no input file", async () => {
      jsdox({recursive: true});
      console.error.should.be.calledWith("Error:", "no input supplied");
    });

    it("should load a config file when asked", async () => {
      const stubGen = sinon.stub().resolves();
      const _gen = jsdoxModule.generateForDir;
      jsdoxModule.generateForDir = stubGen;
      let opts = {config: "./test/stubs/jsdox.config.stub.json"};
      await jsdox(opts);
      cliStubs.loadConfigFile.should.be.calledWith(opts.config);
      stubGen.should.be.calledWith(sinon.match({input: "fake.js"}));
      jsdoxModule.generateForDir = _gen;
    });
  });
});
