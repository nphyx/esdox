/* global xit */
require("should");
require("should-sinon");
const sinon = require("sinon");
const proxy = require("proxyquire");
const fsm = require("fs-magic");
const path = require("path");
const jsdpStub = require("../stubs/jsdoc3-parser.stub");
const esdoxStubs = require("../stubs/esdox.stubs");
const fsStubs = require("../stubs/fs.stubs");
const mustacheStubs = require("../stubs/mustache.stubs");
const defaultOpts = require("../../esdox").defaultOpts;
const generate = proxy("../../lib/generate", {
  mustache: mustacheStubs,
  "fs-magic": fsStubs
});

describe("generate", async () => {

  afterEach(() => {
    fsStubs.scandir.resetHistory();
  });

  describe("generate", () => {
    it("defaults to the library's template directory if a custom one is not supplied", async () => {
      await generate([], defaultOpts);
      fsStubs.scandir.should.be.calledWith(path.join(__dirname, "../../templates"));
    });

    it("accepts a custom template directory", async () => {
      var opts = {...defaultOpts, ...{templates: "test/templateOverrides"}};
      await generate([], opts);
      fsStubs.scandir.should.be.calledWith(opts.templates);
    });

    it("renders a given ast with Mustache", async () => {
      await generate([], defaultOpts);
      mustacheStubs.render.should.be.called();
    });

    it("returns a string representing the generated markdown for a given ast", async () => {
      const fake = "## FAKE TEMPLATE";
      mustacheStubs.render.returns(fake);
      const analyzed = {
        functions: [],
        methods: [],
        classes: [],
        modules: [],
        members: [],
        globalModule: null,
        globalVariables: [],
        description: "",
        overview: "What's up?",
        copyright: "(c) 2012 Blah Blah Blah",
        license: "MIT",
        author: ["Joe Schmo"],
        version: "1.0.1",
        hasMembers: false,
        deprecated: true
      }
      const generated = await generate(analyzed, defaultOpts);
      generated.should.eql(fake);
    });

    it("throws an error if an ast is not supplied", (done) => {
      generate().should.be.rejected().then(() => done());
    });

  });
  /*
  describe("generate", () => {
    beforeEach(() => {
      jsdpStub.resetHistory();
      esdoxStubs.analyze.resetHistory();
      esdoxStubs.generate.resetHistory();
      fsStubs.stat.resetHistory();
    });
    xit("should complain if given a non-javascript file", async () => {
      // TODO: move to esdox.js test since this happens there now
      fsStubs.stat.onFirstCall().resolves({isDirectory: () => false});
      generate(["notascript.css"], defaultOpts)
        .should.be.rejectedWith("no javascript files in input path");
      fsStubs.stat.resetBehavior();
    });
    it("should handle a single file", async () => {
      const opts = {input: ["fake.js"], output: "./test/output",
        templates: "templates"};
      const source = path.join(path.dirname("fake.js"), path.basename("fake.js"));
      const generated = await generate(
        [{analyzed: {modules: [], functions: [], classes: [], basename: "fake.js", source}}],
        opts
      );
      generated.length.should.eql(1);
      generated[0].should.deepEqual({
        analyzed: {
          modules: [],
          functions: [],
          classes: [],
          dirname: path.dirname(source),
          basename: path.basename(source),
          destination: path.join(opts.output, source).replace(/\.js$/, ".md"),
          source
        },
        parsed: {},
        markdown: true
      });
    });
    it("should generate an index file for opts.index", async () => {
      const opts = {
        input: ["./fixtures"],
        output: "./test/output",
        index: true,
        indexName: "index.md", // default would be supplied by main()
        templates: "templates"
      }
      fsStubs.stat.onFirstCall().resolves({isDirectory: () => true});
      // collectIndexData needs analyzed to have some stuff in it
      let fixtureList = await fsm.readdir(opts.input[0])
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
    });
    it("should support a custom index name with opts.indexName", async () => {
      const opts = {
        input: ["./fixtures"],
        output: "./test/output",
        index: true,
        indexName: "customIndex.md",
        templates: "templates"
      };
      fsStubs.stat.onFirstCall().resolves({isDirectory: () => true});
      let generated = await generate(opts);
      let index = generated.pop();
      index.destination.should.eql(path.join(opts.output, "customIndex.md"));
    });
  });
  */
});
