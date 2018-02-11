const sinon = require("sinon");
exports.analyze = sinon.stub().returns({});
exports.generateMD = sinon.stub().returns(true);
exports.indexTestData = [
  {
    destination: "./test/output/",
    dirname: "./src/",
    basename: "file1.js",
    analyzed: {
      functions: [
        {className: undefined,name: "foo"},
        {className: "bar",name: "bar"}
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
      functions: [
        {className: "baz", name: "baz"},
        {className: undefined, name: "qux"}
      ],
      classes: [
        {name: "baz"}
      ]
    }
  }
];
