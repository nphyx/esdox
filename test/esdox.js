/**
 * Hyperpedantic unit tests for the main module. Basically just making
 * sure that everything is wired up correctly.
 */
const proxy = require("proxyquire");
const promisify = require("util").promisify;
const path = require("path");
const sinon = require("sinon");
const jsdpStub = require("./stubs/jsdoc3-parser.stub");
const esdoxStubs = require("./stubs/esdox.stubs");
const fsStubs = require("./stubs/fs.stubs");
const cliStubs = require("./stubs/cliUtil.stubs");
const testOutputDirectory = "./test/output";
const recursive = require("recursive-readdir");
const fs = require("fs");
require("should");
const fsp = {};
["stat", "readFile", "readdir", "rmdir", "unlink"].forEach(fn => {
  fsp[fn] = promisify(fs[fn]);
});

require("should");
require("should-sinon");

describe("cliStubs", () => {
  it("should export stub functions", () => {
    cliStubs.printHelp.should.be.a.Function();
    cliStubs.printVersion.should.be.a.Function();
    cliStubs.loadConfigFile.should.be.a.Function();
  });
});

const esdoxModule = proxy("../esdox", {
  "jsdoc3-parser": jsdpStub,
  "./lib/analyze": esdoxStubs.analyze,
  "./lib/generateMD": esdoxStubs.generateMD,
  "./lib/cliUtil": cliStubs,
  fs: fsStubs
});

const {collectIndexData, createDirectoryRecursive, generate, analyze,
  generateMD, esdox} = esdoxModule;

describe("esdox", () => {
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
      esdoxStubs.indexTestData.reduce((p, c) =>
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
      sinon.spy(esdoxModule, "createDirectoryRecursive");
      await createDirectoryRecursive(testOutputDirectory);
      fsStubs.stat.should.be.calledWith(cwdWrap(testOutputDirectory));
      fsStubs.stat.should.be.calledWith(cwdWrap(path.dirname(testOutputDirectory)));
      fsStubs.mkdir.should.be.calledWith(cwdWrap(path.dirname(testOutputDirectory)));
      fsStubs.mkdir.should.be.calledWith(cwdWrap(testOutputDirectory));
      fsStubs.stat.callsArgWith(1, null, true);
      esdoxModule.createDirectoryRecursive.restore();
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

  describe("generate", () => {
    beforeEach(() => {
      jsdpStub.resetHistory();
      esdoxStubs.analyze.resetHistory();
      esdoxStubs.generateMD.resetHistory();
      fsStubs.stat.resetHistory();
    });
    it("should complain if given a non-javascript file", async () => {
      fsStubs.stat.onFirstCall().callsArgWith(1, null, {isDirectory: () => false});
      generate({input: ["notascript.css"]})
        .should.be.rejectedWith("no javascript files in input path");
      fsStubs.stat.resetBehavior();
    });
    it("should complain if a file does not exist", async () => {
      fsStubs.stat.onFirstCall().callsArgWith(1, {code: "ENOENT"});
      generate({input: ["doesntexist.js"]})
        .should.be.rejectedWith("file does not exist: doesntexist.js");
    });
    it("should bubble other filesystem errors", async () => {
      fsStubs.stat.onFirstCall().callsArgWith(1, {code: "ESOMEERROR"});
      generate({input: ["doesntexist.js"]})
        .should.be.rejectedWith({code: "ESOMEERROR"});
    });
    it("should handle a single file", async () => {
      fsStubs.stat.onFirstCall().callsArgWith(1, null, {isDirectory: () => false});
      const opts = {input: ["fake.js"], output: "./test/output",
        templateDir: "templates"};
      const source = path.join(path.dirname("fake.js"), path.basename("fake.js"));
      let generated = await generate(opts);
      jsdpStub.should.be.calledWith(source);
      esdoxStubs.analyze.should.be.calledWith({}, opts);
      esdoxStubs.generateMD.should.be.calledWith(
        {basename: "fake.js", source: "fake.js"}, opts.templateDir, false);
      generated.length.should.eql(1);
      generated[0].should.deepEqual({
        source: source,
        dirname: path.dirname(source),
        basename: path.basename(source),
        destination: path.join(opts.output, source).replace(/\.js$/, ".md"),
        parsed: {},
        analyzed: {basename: "fake.js", source: "fake.js"},
        markdown: true
      });
    });
    it("should handle a directory", async () => {
      fsStubs.stat.onFirstCall().callsArgWith(1, null, {isDirectory: () => true});
      const opts = {
        input: ["./fixtures"],
        output: "./test/output",
        templateDir: "templates"
      };
      let fixtureList = await fsp.readdir(opts.input[0])
      fixtureList = fixtureList
        .filter(file => file.match(/\.js$/))
        .map(file => path.join(opts.input[0], file));
      fixtureList.sort();
      let generated = await generate(opts);
      jsdpStub.callCount.should.eql(fixtureList.length);
      esdoxStubs.analyze.callCount.should.eql(fixtureList.length);
      esdoxStubs.generateMD.callCount.should.eql(fixtureList.length);
      generated.length.should.eql(fixtureList.length);
      generated.forEach((entry, i) => {
        entry.source.should.eql(fixtureList[i]);
        entry.destination.should.eql(
          path.join(opts.output, entry.basename).replace(/\.js$/, '.md'));
      });
    });
    it("should recurse subdirectories with opts.r", async () => {
      const opts = {
        r: true,
        input: ["./fixtures"],
        output: "./test/output",
        templateDir: "templates"
      };
      let fixtureList = await recursive(opts.input[0])
      fixtureList.sort();
      let generated = await generate(opts);
      generated.length.should.eql(fixtureList.length);
    });
    it("should keep directory structure in output with opts.rr", async () => {
      fsStubs.stat.onFirstCall().callsArgWith(1, null, {isDirectory: () => true});
      const opts = {
        input: ["./fixtures"],
        output: "./test/output",
        templateDir: "templates",
        rr: true
      };
      let fixtureList = await recursive(opts.input[0]);
      fixtureList.sort();
      let generated = await generate(opts);
      jsdpStub.callCount.should.eql(fixtureList.length);
      esdoxStubs.analyze.callCount.should.eql(fixtureList.length);
      esdoxStubs.generateMD.callCount.should.eql(fixtureList.length);
      generated.length.should.eql(fixtureList.length);
      generated.forEach((entry, i) => {
        entry.source.should.eql(fixtureList[i]);
        entry.destination.should.eql(
          path.join(opts.output, entry.dirname, entry.basename).replace(/\.js$/, '.md'));
      });
    });
    it("should generate an index file for opts.index", async () => {
      const opts = {
        input: ["./fixtures"],
        output: "./test/output",
        index: true,
        indexName: "index.md", // default would be supplied by main()
        templateDir: "templates"
      }
      fsStubs.stat.onFirstCall().callsArgWith(1, null, {isDirectory: () => true});
      // collectIndexData needs analyzed to have some stuff in it
      esdoxStubs.analyze.returns({
        functions: [],
        classes: []
      });
      let fixtureList = await fsp.readdir(opts.input[0])
      fixtureList = fixtureList
        .filter(file => file.match(/\.js$/))
        .map(file => path.join(opts.input[0], file));
      fixtureList.sort();
      let generated = await generate(opts);
      generated.length.should.eql(fixtureList.length + 1);
      let index = generated.pop();
      index.source.should.eql("");
      index.dirname.should.eql(path.dirname(opts.input[0]));
      index.destination.should.eql(path.join(opts.output, "index.md"));
      index.markdown.should.be.True();
      esdoxStubs.analyze.returns({});
    });
    it("should support a custom index name with opts.indexName", async () => {
      const opts = {
        input: ["./fixtures"],
        output: "./test/output",
        index: true,
        indexName: "customIndex.md",
        templateDir: "templates"
      };
      fsStubs.stat.onFirstCall().callsArgWith(1, null, {isDirectory: () => true});
      // collectIndexData needs analyzed to have some stuff in it
      esdoxStubs.analyze.returns({
        functions: [],
        classes: []
      });
      let generated = await generate(opts);
      let index = generated.pop();
      index.destination.should.eql(path.join(opts.output, "customIndex.md"));
      esdoxStubs.analyze.returns({});
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
      esdoxStubs.analyze.returns({
        functions: [],
        classes: []
      });
      sinon.spy(esdoxModule, "createDirectoryRecursive");
      fsStubs.writeFile.resetHistory();
      fsStubs.stat.resetHistory();
      console.error.resetHistory();
      fsStubs.stat.callsArgWith(1, null, {isDirectory: () => true});
    });

    afterEach(() => {
      process.exit = _exit;
      console.error = _consoleError;
      console.log.restore();
      esdoxStubs.analyze.returns({});
      esdoxModule.createDirectoryRecursive.restore();
    });

    it("should process options, wrapping input as an array and providing defaults", async () => {
      sinon.spy(esdoxModule, "generate");
      console.error.resetHistory();
      const opts = {
        input: "./fixtures",
        output: "./test/test_output"
      }
      esdoxStubs.analyze.returns({
        functions: [],
        classes: []
      });
      await esdox(opts);
      console.error.should.not.be.called();
      esdoxModule.generate.should.be.calledWith({
        input: ["./fixtures"],
        output: "./test/test_output",
        indexName: "index.md"
      });
      esdoxModule.generate.restore();
    });

    it("should create files", async () => {
      // collectIndexData needs analyzed to have some stuff in it
      const opts = {
        input: "./fixtures",
        output: "./test/output",
        index: true,
        rr: true,
        templateDir: "templates"
      };
      let fixtureList = await recursive(opts.input);
      await esdox(opts);
      console.error.should.not.be.called();
      esdoxModule.createDirectoryRecursive.callCount.should.eql(fixtureList.length + 1);
      fsStubs.writeFile.callCount.should.eql(fixtureList.length + 1);
    });
  });
});
