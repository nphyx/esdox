require("should");
require("should-sinon");
const sinon = require("sinon");
const proxy = require("proxyquire");
const fs = require("fs");
const path = require("path");
const esdoxStubs = require("../stubs/esdox.stubs");
const fsStubs = require("../stubs/fs.stubs");
const mustacheStubs = require("../stubs/mustache.stubs");
const generateMD = proxy("../../lib/generateMD", {
  "recursive-readdir": esdoxStubs.recursive,
  mustache: mustacheStubs,
  fs: fsStubs
});

describe("await generateMD", async () => {
  afterEach(() => {
    esdoxStubs.recursive.resetHistory();
  });

  it("defaults to the library's template directory if a custom one is not supplied", async () => {
    await generateMD([]);
    esdoxStubs.recursive.should.be.calledWith(path.join(__dirname, "../../templates"));
  });

  it("accepts a custom template directory", async () => {
    var custom = "test/templateOverrides";
    await generateMD([], custom);
    esdoxStubs.recursive.should.be.calledWith(custom);
  });

  it("renders a given ast with Mustache", async () => {
    await generateMD([]);
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
    const generated = await generateMD(analyzed);
    generated.should.eql(fake);
  });

  it("throws an error if an ast is not supplied", (done) => {
    generateMD().should.be.rejected().then(() => done());
  });

  it("sorts index classes and functions by name", async () => {
    var analyzed = {
      functions: [
        {name: "zero", longname: "zero" },
        {name: "one", longname: "foo.one" },
        {name: "two", longname: "bar.two" },
        {name: "three", longname: "bar.three" },
        {name: "four", longname: "foo.four" }
      ],
      classes: [
        {name: "Five", longname: "Five" },
        {name: "Six", longname: "bar.Six" }
      ]
    };

    await generateMD(analyzed, null, true, "standard");

    // FIXME: generateMD should not mutate analyzed
    // TODO: analyze should be responsible for sorting
    analyzed.functions.should.eql([
      {name: "four", longname: "foo.four", target: "#foo.four" },
      {name: "one", longname: "foo.one", target: "#foo.one" },
      {name: "three", longname: "bar.three", target: "#bar.three" },
      {name: "two", longname: "bar.two", target: "#bar.two" },
      {name: "zero", longname: "zero", target: "#zero" }
    ]);
    analyzed.classes.should.eql([
      {name: "Five", longname: "Five", target: "#five" },
      {name: "Six", longname: "bar.Six", target: "#bar.six" }
    ]);
  });

  it("sorts index classes and functions by namespace", async () => {
    var analyzed = {
      functions: [
        {name: "zero", longname: "zero" },
        {name: "one", longname: "foo.one" },
        {name: "two", longname: "bar.two" },
        {name: "three", longname: "bar.three" },
        {name: "four", longname: "foo.four" }
      ],
      classes: [
        {name: "Five", longname: "Five" },
        {name: "Six", longname: "bar.Six" }
      ]
    };

    await generateMD(analyzed, null, true, "namespace");

    // FIXME: generateMD should not mutate analyzed
    // TODO: analyze should be responsible for sorting
    analyzed.functions.should.eql([
      {name: "zero", longname: "zero", target: "#zero" },
      {name: "three", longname: "bar.three", target: "#bar.three" },
      {name: "two", longname: "bar.two", target: "#bar.two" },
      {name: "four", longname: "foo.four", target: "#foo.four" },
      {name: "one", longname: "foo.one", target: "#foo.one" }
    ]);
    analyzed.classes.should.eql([
      {name: "Five", longname: "Five", target: "#five" },
      {name: "Six", longname: "bar.Six", target: "#bar.six" }
    ]);
  });

  it("leaves index classes and functions unsorted", async () => {
    var analyzed = {
      functions: [
        {name: "zero", longname: "zero" },
        {name: "one", longname: "foo.one" },
        {name: "two", longname: "bar.two" },
        {name: "three", longname: "bar.three" },
        {name: "four", longname: "foo.four" }
      ],
      classes: [
        {name: "Five", longname: "Five" },
        {name: "Six", longname: "bar.Six" }
      ]
    }

    await generateMD(analyzed, null, true, "none");

    // FIXME: generateMD should not mutate analyzed
    // TODO: analyze should be responsible for sorting
    analyzed.functions.should.eql([
      {name: "zero", longname: "zero", target: "#zero" },
      {name: "one", longname: "foo.one", target: "#foo.one" },
      {name: "two", longname: "bar.two", target: "#bar.two" },
      {name: "three", longname: "bar.three", target: "#bar.three" },
      {name: "four", longname: "foo.four", target: "#foo.four" }
    ]);
    analyzed.classes.should.eql([
      {name: "Five", longname: "Five", target: "#five" },
      {name: "Six", longname: "bar.Six", target: "#bar.six" }
    ]);
  });
});
