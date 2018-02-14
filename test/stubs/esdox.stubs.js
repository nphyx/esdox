const sinon = require("sinon");
exports.analyze = sinon.stub().returns({modules: [],functions: [],classes: []});
exports.generateMD = sinon.stub().returns(true);
exports.recursive = sinon.stub().resolves([]);
exports.indexTestData = [
  {
    destination: "./test/output/",
    dirname: "./src/",
    basename: "file1.js",
    analyzed: {
      modules: [
        {name: "quux"}
      ],
      functions: [
        {className: undefined,name: "foo"},
        {className: "bar",name: "bar"},
        {moduleName: "quuz", name: "corge"}
      ],
      classes: [
        {name: "bar"}
      ]
    }
  },
  {
    destination: "./test/output/",
    dirname: "./src/",
    basename: "file2.js",
    analyzed: {
      modules: [],
      functions: [
        {className: "baz", name: "baz"},
        {className: undefined, name: "qux"}
      ],
      classes: [
        {name: "baz"},
        {name: "corge", moduleName: "quuz"}
      ]
    }
  }
];
