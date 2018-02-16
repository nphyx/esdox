const sinon = require("sinon");
const analysisResult = require("../../lib/analyze").analysisResult;
exports.analyze = sinon.stub().returns(analysisResult());
exports.parser = sinon.stub().resolves([]);
exports.generate = sinon.stub().returns([]);
exports.indexTestData = [
  {
    destination: "./test/output/",
    dirname: "./src/",
    basename: "file1.js",
    analyzed: analysisResult({
      classes: [{
        name: "bar",
        methods: [{name: "bar"}]
      }],
      functions: [{name: "foo"}],
      modules: [{
        name: "quux",
        functions: [
          {name: "corge"}
        ]
      }]
    })
  },
  {
    destination: "./test/output/",
    dirname: "./src/",
    basename: "file2.js",
    analyzed: analysisResult({
      modules: [{
        name: "corge",
        functions: [{name: "quux"}]
      }],
      functions: [{name: "qux"}],
      classes: [{
        name: "baz",
        functions: [{name: "baz"}]
      }]
    })
  }
];
exports.indexTestResult = analysisResult({
  classes: [
    {
      destination: "",
      source: "../../src/file1.js",
      name: "bar",
      methods: [{
        destination: "",
        source: "../../src/file1.js",
        name: "bar"
      }]
    },
    {
      destination: "",
      source: "../../src/file2.js",
      name: "baz",
      functions: [{
        destination: "",
        source: "../../src/file2.js",
        name: "baz"
      }]
    }
  ],
  functions: [
    {
      destination: "",
      source: "../../src/file1.js",
      name: "foo"
    },
    {
      destination: "",
      source: "../../src/file2.js",
      name: "qux"
    }
  ],
  modules: [
    {
      destination: "",
      source: "../../src/file1.js",
      name: "quux",
      functions: [{
        destination: "",
        source: "../../src/file1.js",
        name: "corge"
      }]
    },
    {
      destination: "",
      source: "../../src/file2.js",
      name: "corge",
      functions: [{
        destination: "",
        source: "../../src/file2.js",
        name: "quux"
      }]
    }
  ]
});
