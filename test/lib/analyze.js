const sinon = require("sinon");
const analyze = require("../../lib/analyze");
const jsdoc = require("jsdoc3-parser");
const esdoxStubs = require("../stubs/esdox.stubs");
const parser = require("../../lib/parser");
const path = require("path");
require("should");

describe("analyze", function() {
  describe("analysisResult", () => {
    it("should set up an analysis result", () => {
      let arrays = ["modules", "members", "functions", "classes", "methods"];
      let strings = ["source", "dirname", "basename", "name", "author", "description", "license", "version", "destination", "overview", "copyright"];
      let result = analyze.analysisResult();
      arrays.forEach(item => result[item].should.be.an.Array());
      strings.forEach(item => result[item].should.be.an.String());
    });
    it("should accept overrides", () => {
      let modules = ["foo", "bar", "baz", "qux"];
      let data = {source: "source", dirname: "dirname", modules}
      let result = analyze.analysisResult(data);
      result.modules.should.eql(modules);
      result.source.should.eql(data.source);
      result.dirname.should.eql(data.dirname);
    });
  });

  describe("buildTypesString", () => {
    it("should build a safe-pipe-separated string", () => {
      analyze.buildTypesString({}).should.eql("");
      const test = {
        type: { names: ["foo","bar","baz"] }
      }
      analyze.buildTypesString(test).should.eql("foo \u2758 bar \u2758 baz");
    });
  });

  describe("isInternal", () => {
    it("recognizes @private", () => {
      let test = { access: "private" };
      analyze.isInternal(test).should.be.True();
    });
    it("pretends items starting with _ are private", () => {
      let test = { name: "_foo" };
      analyze.isInternal(test).should.be.True();
    });
  });

  describe("normNode", () => {
    it("norms functions", () => {
      let test = {
        kind: "function",
        memberof: undefined
      }
      const res = analyze.normNode(test);
      res.should.not.eql(test); // should be a deep clone
      test.membership = {modules: [], objects: []};
      test.description = undefined;
      test.version = undefined;
      test.deprecated = false;
      test.params = [];
      res.should.deepEqual(test);
    });
    it("norms modules", () => {
      let test = {
        kind: "module",
        memberof: undefined
      }
      const res = analyze.normNode(test);
      res.should.not.eql(test); // should be a deep clone
      test.membership = {modules: [], objects: []};
      test.functions = [];
      test.classes = [];
      test.description = undefined;
      test.version = undefined;
      test.deprecated = false;
      test.requires = [];
      test.members = [];
      res.should.deepEqual(test);
    });
    it("norms classes", () => {
      let test = {
        kind: "class",
        memberof: undefined
      }
      const res = analyze.normNode(test);
      res.should.not.eql(test); // should be a deep clone
      test.membership = {modules: [], objects: []};
      test.methods = [];
      test.members = [];
      test.description = undefined;
      test.version = undefined;
      test.deprecated = false;
      res.should.deepEqual(test);
    });
    it("norms object literals", () => {
      let test = {
        kind: "member",
        memberof: undefined
      }
      const res = analyze.normNode(test);
      res.should.not.eql(test); // should be a deep clone
      test.membership = {modules: [], objects: []};
      test.members = [];
      test.functions = [];
      test.description = undefined;
      test.version = undefined;
      test.deprecated = false;
      res.should.deepEqual(test);
    });
  });

  describe("cleanExamples", () => {
    it("should wrap examples in code blocks as needed", () => {
      let test = [
        "// this is a example\nconsole.log('hello, world!');",
        "```javascript\n// this is a example\nconsole.log('hello, world!');\n```",
        "```bash\n# this is a example\necho 'hello, world!';\n```"
      ];
      analyze.cleanExamples(test).should.eql([
        "```\n// this is a example\nconsole.log('hello, world!');\n```",
        "```javascript\n// this is a example\nconsole.log('hello, world!');\n```",
        "```bash\n# this is a example\necho 'hello, world!';\n```"
      ]);
    });
  });

  describe("cleanFires", () => {
    it("should transform fires/emits strings", () => {
      let test = ["module:foo#event:bar"];
      analyze.cleanFires(test).should.eql([{ref: "module:foo#event:bar", name: "foo#bar"}]);
    });
  });

  describe("cleanProps", () => {
    it("produces clean, normalized properties", () => {
      const test = [
        {
          description: "fussy\nmultiline\ndescription",
          name: "foo",
          type: {names: ["bar","baz","qux"], optional: true}
        },
        {
          optional: true,
          defaultvalue: "foo"
        }
      ];
      const res = analyze.cleanProps(test);
      res[0].should.not.eql(test[0]);
      test[0].description = "fussy multiline description";
      test[0].nested = false;
      test[0].optional = false;
      test[0].defaultvalue = undefined;
      test[0].typesString = analyze.buildTypesString(test[0]);
      res[0].should.deepEqual(test[0]);
      res[1].optional.should.eql(true);
      res[1].defaultvalue.should.eql("foo");
    });
  });

  describe("collectIndexData", () => {
    it("should collect functions and classes to place in the index", () => {
      const opts = {output: "./test/output", indexName: "index.md"};
      const accumulator = analyze.analysisResult();
      const stubData = esdoxStubs.indexTestData;
      const expected = esdoxStubs.indexTestResult;
      esdoxStubs.indexTestData.reduce((p, c) =>
        analyze.collectIndexData(p, c, opts), accumulator);
      accumulator.should.deepEqual(expected);
    });
  });

  describe("noLineBreaks", () => {
    it("strips linefeeds", () => {
      analyze.noLineBreaks("foo\nbar\nbaz").should.eql("foo bar baz");
    });
    it("strips carriage returns", () => {
      analyze.noLineBreaks("foo\rbar\rbaz").should.eql("foo bar baz");
    });
    it("strips CRLFs", () => {
      analyze.noLineBreaks("foo\r\nbar\r\nbaz").should.eql("foo bar baz");
    });
  });

  describe("parseMembership", () => {
    it("returns empty membership for empty strings", () => {
      analyze.parseMembership().should.deepEqual({modules: [], objects: []});
    });
    it("parses module membership", () => {
      analyze.parseMembership("module:foo").modules.should.eql(["foo"]);
      analyze.parseMembership("module:foo.bar").modules.should.eql(["foo", "bar"]);
    });
    it("parses object/class membership", () => {
      analyze.parseMembership("module:foo~bar").objects.should.eql(["bar"]);
      analyze.parseMembership("module:foo~bar~baz~qux").objects
        .should.eql(["bar","baz","qux"]);
    });
    it("parses membership in object literals", () => {
      analyze.parseMembership("Foo").objects.should.eql(["Foo"]);
      analyze.parseMembership("Foo~bar").objects.should.deepEqual(["Foo", "bar"]);
      analyze.parseMembership("Foo.bar").objects.should.deepEqual(["Foo", "bar"]);
    });
  });

  describe("collect", () => {
    const makeResultStub = () => ({modules: [], classes: [],
      functions: [], members: []});
    const makeMembershipStub = () => ({objects: [], modules: []});
    it("puts things in the right buckets", () => {
      const result = makeResultStub();
      const memStub = makeMembershipStub();
      const testFn = {kind: "function", membership: memStub, name: "foo"};
      const testClass = {kind: "class", membership: memStub, name: "bar"};
      const testModule = {kind: "module", membership: memStub, name: "baz"};
      const testMember = {kind: "member", membership: memStub, name: "qux"};
      analyze.collect(testFn, result);
      result.functions[0].name.should.eql("foo");
      analyze.collect(testClass, result);
      result.classes[0].name.should.eql("bar");
      analyze.collect(testModule, result);
      result.modules[0].name.should.eql("baz");
      analyze.collect(testMember, result);
      result.members[0].name.should.eql("qux");
    });
    it("places a module member as a child of its module", () => {
      const result = makeResultStub();
      const memStub = makeMembershipStub();
      const memFoo = {objects: [], modules: ["foo"]};
      const testModule = {kind: "module", membership: memStub, name: "foo",
        classes: [], functions: []};
      const testFn = {kind: "function", membership: memFoo, name: "bar"};
      const testClass = {kind: "class", membership: memFoo, name: "baz"};
      analyze.collect(testModule, result);
      analyze.collect(testFn, result);
      analyze.collect(testClass, result);
      result.functions.length.should.eql(0);
      result.classes.length.should.eql(0);
      result.modules[0].functions.length.should.eql(1);
      result.modules[0].classes.length.should.eql(1);
    });
    it("places a class method as a child of its class", () => {
      const result = makeResultStub();
      const memStub = makeMembershipStub();
      const memFoo = {...makeMembershipStub(), ...{objects: ["foo"]}};
      const testClass = {kind: "class", name: "foo", membership: memStub, methods: []};
      const testFn = {kind: "function", membership: memFoo};
      analyze.collect(testClass, result);
      analyze.collect(testFn, result);
      result.functions.length.should.eql(0);
      result.classes.length.should.eql(1);
      result.classes[0].methods.length.should.eql(1);
    });
    it("places a module's class's method as a child of its class", () => {
      const result = makeResultStub();
      const memStub = makeMembershipStub();
      const memFoo = {...makeMembershipStub(), ...{modules: ["foo"]}};
      const memBar = {...makeMembershipStub(), ...{objects: ["bar"], modules: ["foo"]}};
      const testModule = {kind: "module", membership: memStub, name: "foo",
        classes: [], functions: []};
      const testClass = {kind: "class", name: "bar", membership: memFoo, methods: []};
      const testFn = {kind: "function", membership: memBar};
      analyze.collect(testModule, result);
      analyze.collect(testClass, result);
      analyze.collect(testFn, result);
      result.functions.length.should.eql(0);
      result.classes.length.should.eql(0);
      result.modules[0].classes.length.should.eql(1);
      result.modules[0].classes[0].methods.length.should.eql(1);
    });
    it("places a member of an object literal as a child of that object", () => {
      const result = makeResultStub();
      const memStub = makeMembershipStub();
      const memFoo = {...makeMembershipStub(), ...{members: ["foo"]}};
      const testFn = {kind: "function", membership: memFoo};
      const testModule = {kind: "member", name: "foo", membership: memStub,
        members: []};
    });
  });

  describe("analysis", () => {
    var test2, test3, test4, test5, test6, test7, test8, under, fixtures;
    const opts = {private: true};
    // let's get ASTs for all the test fixtures
    // TODO: use a standardized stub jsdoc AST instead
    before(async () => {
      const testFiles = [
        path.join(__dirname, "../../fixtures/test2.js"),
        path.join(__dirname, "../../fixtures/test3.js"),
        path.join(__dirname, "../../fixtures/test4.js"),
        path.join(__dirname, "../../fixtures/test5.js"),
        path.join(__dirname, "../../fixtures/test6.js"),
        path.join(__dirname, "../../fixtures/test7.js"),
        path.join(__dirname, "../../fixtures/test8.js"),
        path.join(__dirname, "../../fixtures/under/test.js")
      ];
      const parsed = await Promise.all(testFiles.map(test => parser(test)));
      fixtures = parsed.map(p => analyze(p, opts));
      [test2, test3, test4, test5, test6, test7, test8, under] = fixtures;
    });

    it("complains when no AST is received", () => {
      (() => analyze(undefined, {})).should.throw();
    });

    it("returns an analyzed JSDoc AST", function() {
      fixtures.forEach(fixture => {
        // mandatory (?) fields
        fixture.should.be.an.Object().with.keys(
          "functions",
          "methods",
          "classes",
          "modules",
          "members",
          "description",
          "overview",
          "copyright",
          "license",
          "author",
          "hasMembers",
          "version"
        );
      });
    });

    describe('aggregation', () => {
      it('groups all functions under correct parents', () => {
        const expected = [4, 2, 3, 0, 0, 0, 1, 1];
        fixtures.map(fixture => fixture.functions.length).should.eql(expected);
      });
      it('groups all methods under correct parents', () => {
        const expected = [0, 0, 0, 0, 0, 0, 0, 0];
        fixtures.map(fixture => fixture.methods.length).should.eql(expected);
      });
      it('groups all classes under correct parents', () => {
        const expected = [0, 0, 0, 0, 0, 1, 0, 0];
        fixtures.map(fixture => fixture.classes.length).should.eql(expected);
        test6.modules.find(m => m.name === "main").classes.length.should.eql(2);
        test6.modules.find(m => m.name === "main")
          .members.find(m => m.name === "util").functions.length.should.eql(2);
      });
      it('groups all members under correct parents', () => {
        const expected = [0, 1, 0, 0, 0, 1, 0, 1];
        fixtures.map(fixture => fixture.members.length).should.eql(expected);
        test5.modules[0].members.length.should.eql(3);
        test7.classes[0].members.length.should.eql(2);
      });
    });

    describe('Supported JSDoc tags', () => {
      describe('file-level tags', () => {
        /* global xit */
        xit('captures @description', () => {
          // TODO: file level descriptions in block should be captured
        });
        it('captures @overview', () => {
          const expected = [
            "This is the overview with some `markdown` included, how nice!",
            "This is the overview with some `markdown` included, how nice!",
            "This is the overview with some `markdown` included, how nice!",
            "This sample will output module requires and members.",
            "This sample handles namespaces, interfaces, and links.",
            "Test classes without methods.",
            "",
            "What's up?"
          ];
          fixtures.map(fixture => fixture.overview).should.eql(expected);
        });
        it('captures @license', () => {
          const expected = [
            "MIT",
            "MIT",
            "MIT",
            "MIT",
            "MIT",
            "MIT",
            "",
            "MIT"
          ];
          fixtures.map(fixture => fixture.license).should.eql(expected);
        });
        it('captures @author', () => {
          const expected = [
            ["Joe Schmo"],
            ["Joe Schmo"],
            ["Joe Schmo"],
            ["lemori"],
            undefined,
            ["Gabor Sar"],
            '', // TODO: check if this should happen
            ["Joe Schmo"]
          ];
          fixtures.map(fixture => fixture.author).should.deepEqual(expected);
        });
        it('captures @copyright', () => {
          const expected = [
            "(c) 2012 Blah Blah Blah",
            "(c) 2012 Blah Blah Blah",
            "(c) 2012 Blah Blah Blah",
            undefined,
            undefined,
            undefined,
            '', // TODO: check if this should happen
            "(c) 2012 Blah Blah Blah"
          ];
          fixtures.map(fixture => fixture.copyright).should.deepEqual(expected);
        });
        it("wraps @example in code block backticks if necessary", () => {
          under.modules
            .find(mod => mod.name === "foo").classes
            .find(cl => cl.name === "SampleClass").methods
            .find(m => m.name === "func1").examples[0].should.eql("```\nfunc1(1, 2)\n```");
        });
      }); // end file-level tags
      describe('object-level tags', () => {
        it('captures @description', () => {
          const funcs = test2.functions;
          const expected = [
            undefined,
            "Function with no param types and a broken @return.",
            "exported with dot notation",
            "global function"
          ];
          funcs.map(func => func.description).should.eql(expected);
        });
        it('captures @param on functions', () => {
          const expected = [
            {
              name: "a",
              nested: false,
              optional: false,
              defaultvalue: undefined,
              description: "the first param",
              type: {names: ["String"]},
              typesString: "String"
            },
            {
              name: "b",
              description: "the second param",
              nested: false,
              defaultvalue: undefined,
              optional: false,
              type: {names: ["String"]},
              typesString: "String"
            }
          ];
          test2.functions[0].params.should.deepEqual(expected);
        });
        it("flags a function with parameter defaults", () => {
          test3.functions[0].params[0].optional.should.be.True();
          test3.functions[0].hasDefaultParams.should.be.True();
        });
        it('captures @return/@returns on functions', () => {
          const returns = test2.functions[0].returns;
          const expected = [{
            description: "the result",
            type: {names: ["String"]},
            typesString: "String",
            optional: false,
            defaultvalue: undefined,
            nested: false,
            name: undefined
          }];
          returns.should.deepEqual(expected);
        });
        it('captures @fires/@emits on functions', () => {
          const expected = [
            {ref: "module:foo#event:one_thing", name: "foo#one_thing"},
            {ref: "module:foo#event:another", name: "foo#another"},
            {ref: "module:foo#event:booyah", name: "foo#booyah"}
          ];
          under.functions[0].fires.should.deepEqual(expected);
        });
      }); // end object-level tags
      describe('module-level tags', () => {
        it('captures @namespace', () => {
          test6.modules[0].name.should.eql("main");
        });
        it("captures namespace members", () => {
          test6.modules[0].members[0].name.should.eql("util");
        });
        it('captures classes', () => {
          test6.modules[0].classes.map(c => c.name).should.eql([
            "Thing",
            "Worker"
          ]);
        });
      });
      describe('Constructor-style class-level tags', () => {
        var module3, class7;
        before(() => {
          class7 = test7.classes[0];
          // TODO: test3 should have a defined class with methods and members
        });
        it('captures @members', () => {
          class7.members.map(member => member.name).should.eql([
            "a",
            "c"
          ]);
        });
        it('captures @methods as functions', () => {
          test3.functions.length.should.eql(2);
          test3.functions.map(func => func.description).should.eql([
            "Create a record",
            "Remove a record"
          ]);
        });
        it('identifies membership of methods', () => {
          test3.functions.map(func => func.memberof).should.eql([
            "Object",
            "Object"
          ]);
        });
        it('captures constructor tags', () => {
          class7.description.should.eql("Test class.");
          class7.name.should.eql("Test");
          class7.params.map(param => param.name).should.eql([
            "a",
            "b"
          ]);
        });
      }); // end constructor-style class tags
      describe('ES6 Class class-level tags', () => {
        xit('captures @members');
        xit('captures @methods as functions');
        xit('identifies membership of methods');
        xit('captures constructor tags');
      });
    }); // end supported jsdoc tags
  });
});
