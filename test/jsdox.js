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

const {collectIndexData, createDirectoryRecursive, generateForDir, analyze,
  generateMD, jsdox} = jsdoxModule;

describe("jsdox", () => {
  function cwdWrap(dir) {
    return path.join(process.cwd(), dir);
  }

  describe("collectIndexData", () => {
    it("should collect functions and classes to place in the index", () => {
      const opts = {output: "./test/output"};
      const accumulator = {
        functions: [],
        classes: []
      }
      const expected = {
        functions: [
          {className: undefined, name: "foo", source: "../../src/file1.js"},
          {className: undefined, name: "qux", source: "../../src/file2.js"}
        ],
        classes: [
          {name: "bar", source: "../../src/file1.js"},
          {name: "baz", source: "../../src/file2.js"}
        ]
      }
      jsdoxStubs.indexTestData.reduce((p, c) =>
        collectIndexData(p, c, opts), accumulator);
      accumulator.should.deepEqual(expected);
    });
  });

  describe("createDirectoryRecursive", () => {
    it("should check whether a directory exists", async () => {
      await createDirectoryRecursive(testOutputDirectory);
      fsStubs.stat.should.be.calledWith(cwdWrap(testOutputDirectory));
    });
    it("should try to create parent directories recursively", async () => {
      fsStubs.stat.resetHistory();
      fsStubs.stat.onFirstCall().callsArgWith(1, {code: "ENOENT"});
      fsStubs.stat.onSecondCall().callsArgWith(1, null, true);
      sinon.spy(jsdoxModule, "createDirectoryRecursive");
      await createDirectoryRecursive(testOutputDirectory);
      fsStubs.stat.should.be.calledWith(cwdWrap(testOutputDirectory));
      fsStubs.stat.should.be.calledWith(cwdWrap(path.dirname(testOutputDirectory)));
      fsStubs.mkdir.should.be.calledWith(cwdWrap(path.dirname(testOutputDirectory)));
      fsStubs.mkdir.should.be.calledWith(cwdWrap(testOutputDirectory));
      fsStubs.stat.callsArgWith(1, null, true);
      jsdoxModule.createDirectoryRecursive.restore();
    });
    it("should not complain if the directory already exists", (done) => {
      fsStubs.mkdir.reset();
      fsStubs.mkdir.callsArgWith(1, {code: "EEXIST"});
      createDirectoryRecursive("./test").should.be.resolved()
        .then(() => {
          fsStubs.mkdir.callsArgWith(1, null, true);
          done();
        });
    });
    it("should complain on filesystem errors", (done) => {
      fsStubs.stat.callsArgWith(1, {code: "SUPERFAIL"});
      // would prefer async/await but it's easier to check rejects this way
      createDirectoryRecursive("./test").should.be.rejected()
        .then(() => {
          fsStubs.stat.callsArgWith(1, null, true);
          fsStubs.mkdir.callsArgWith(1, {code: "SUPERFAIL"});
          return createDirectoryRecursive("./test").should.be.rejected()
        })
        .then(() => {
          fsStubs.mkdir.callsArgWith(1, null, true);
          done();
        });
    });
  });

  describe("generateFoDir", () => {
    beforeEach(() => {
      jsdpStub.resetHistory();
      jsdoxStubs.analyze.resetHistory();
      jsdoxStubs.generateMD.resetHistory();
      fsStubs.stat.resetHistory();
    });
    it("should complain if given an unusable input", async () => {
      fsStubs.stat.resetHistory();
      fsStubs.stat.onFirstCall().callsArgWith(1, null, {isDirectory: () => false});
      generateForDir({input: "notascript.css"})
        .should.be.rejectedWith({message: "input file is not a .js or directory"});
    });
    it("should handle a single file", async () => {
      const opts = {input: "fake.js", output: "./test/output", templateDir: "templates"};
      const source = path.join(path.dirname("fake.js"), path.basename("fake.js"));
      let generated = await generateForDir(opts);
      jsdpStub.should.be.calledWith(source);
      jsdoxStubs.analyze.should.be.calledWith({}, opts);
      jsdoxStubs.generateMD.should.be.calledWith(
        {}, opts.templateDir, false);
      generated.length.should.eql(1);
      generated[0].should.deepEqual({
        source: source,
        dirname: path.dirname(source),
        basename: path.basename(source),
        destination: path.join(opts.output, source).replace(/\.js$/, ".md"),
        parsed: {},
        analyzed: {},
        markdown: true
      });
    });
    it("should handle a directory", async () => {
      fsStubs.stat.onFirstCall().callsArgWith(1, null, {isDirectory: () => true});
      const opts = {
        input: "./fixtures",
        output: "./test/output",
        templateDir: "templates"
      };
      let fixtureList = await recursive(opts.input)
      fixtureList.sort();
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
    it("should keep directory structure in output with opts.rr", async () => {
      fsStubs.stat.onFirstCall().callsArgWith(1, null, {isDirectory: () => true});
      const opts = {
        input: "./fixtures",
        output: "./test/output",
        templateDir: "templates",
        rr: true
      };
      let fixtureList = await recursive(opts.input);
      fixtureList.sort();
      let generated = await generateForDir(opts);
      jsdpStub.callCount.should.eql(fixtureList.length);
      jsdoxStubs.analyze.callCount.should.eql(fixtureList.length);
      jsdoxStubs.generateMD.callCount.should.eql(fixtureList.length);
      generated.length.should.eql(fixtureList.length);
      generated.forEach((entry, i) => {
        entry.source.should.eql(fixtureList[i]);
        entry.destination.should.eql(
          path.join(opts.output, entry.dirname, entry.basename).replace(/\.js$/, '.md'));
      });
    });
    it("should generate an index file for opts.index", async () => {
      const opts = {
        input: "./fixtures",
        output: "./test/output",
        index: true,
        templateDir: "templates"
      };
      fsStubs.stat.onFirstCall().callsArgWith(1, null, {isDirectory: () => true});
      // collectIndexData needs analyzed to have some stuff in it
      jsdoxStubs.analyze.returns({
        functions: [],
        classes: []
      });
      let fixtureList = await recursive(opts.input);
      let generated = await generateForDir(opts);
      generated.length.should.eql(fixtureList.length + 1);
      let index = generated.pop();
      index.source.should.eql(opts.input);
      index.dirname.should.eql(path.dirname(opts.input));
      index.destination.should.eql(path.join(opts.output, "index.md"));
      index.markdown.should.be.True();
      jsdoxStubs.analyze.returns({});
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
      console.error.resetHistory();
      sinon.spy(jsdoxModule, "generateForDir");
      let opts = {
        config: "./test/stubs/jsdox.config.stub.json",
        output: "./test/output"
      };
      await jsdox(opts);
      console.error.should.not.be.called();
      cliStubs.loadConfigFile.should.be.calledWith(opts.config);
      jsdoxModule.generateForDir.should.be.calledWith(sinon.match({input: "fake.js"}));
      jsdoxModule.generateForDir.restore();
    });
    it("should create files", async () => {
      sinon.spy(jsdoxModule, "createDirectoryRecursive");
      fsStubs.writeFile.resetHistory();
      fsStubs.stat.resetHistory();
      console.error.resetHistory();
      fsStubs.stat.onFirstCall().callsArgWith(1, null, {isDirectory: () => true});
      // collectIndexData needs analyzed to have some stuff in it
      jsdoxStubs.analyze.returns({
        functions: [],
        classes: []
      });
      const opts = {
        input: "./fixtures",
        output: "./test/output",
        index: true,
        templateDir: "templates"
      };
      let fixtureList = await recursive(opts.input);
      await jsdox(opts);
      console.error.should.not.be.called();
      jsdoxModule.createDirectoryRecursive.callCount.should.eql(fixtureList.length + 1);
      fsStubs.writeFile.callCount.should.eql(fixtureList.length + 1);
      jsdoxModule.createDirectoryRecursive.restore();
      jsdoxStubs.analyze.returns({});
    });
  });
});
