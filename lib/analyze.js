const packageJson = require("../package.json");
const clone = require("clone");
const path = require("path");

/**
 * Builds a standardized analysis result.
 *
 * @param {Object} [data={}] actual data to apply over defaults
 * @return {Object} standardized result
 */
function analysisResult(data = {}) {
  const result = {
    modules: [],
    members: [],
    functions: [],
    classes: [],
    methods: [],
    source: "",
    dirname: "",
    basename: "",
    name: "",
    author: "",
    description: "",
    license: "",
    version: "",
    destination: "",
    overview: "",
    copyright: ""
  }

  return {...result, ...data};
}

/**
 * Helper functions for analyzing JSDoc ASTs.
 *
 * Handles sorting, adding extra metadata, string escaping / cleanup, and other
 * transforms of raw AST data for use by the mustache templates. These are all
 * used internally and marked as private, but exported for unit testing
 * purposes.
 *
 * @module analyze
 * @requires clone
 */

/**
 * Attaches a 'typesString' pipe-separated attribute
 * containing the node's types
 * @private
 * @param {Object} node - AST node with a `types` attribute to process
 * @return {String}
 */
function buildTypesString(node) {
  if (!node.type) { return '' }
  return node.type.names.join(" \u2758 "); // safe unicode pipe character
}

const exampleRegExp = new RegExp(/^[\n\s]*```(.|\s)*```[\n\s]*$/);
/**
 * Intelligently wraps @examples in Github codeblock backticks.
 *
 * Ignores example blocks that already have a user-supplied backtick. It's
 * better to provide named code so the syntax highlighting looks nicer.
 * @private
 * @param {Array} list of examples
 * @returns {Array} examples wrapped in code blocks
 */
function cleanExamples(examples) {
  return examples.map(example => {
    if (!example.match(exampleRegExp)) {
      return "```\n" + example + "\n```";
    } else { return example }
  });
}

/**
 * Cleans up @fires properties for better display.
 * @private
 * @param {Array} fires collection of @fires strings
 * @return {Array} cleaned up fires strings
 */
function cleanFires(fires) {
  return fires.map(fire => ({
    ref: fire,
    name: fire.replace("module:", "").replace("event:", "")
  }));
}

/**
 * Cleans up property descriptors for params, returns, and properties.
 * @private
 * @param {Array} props array of appropriate properties
 * @return {Array} a cleaned up and standardized version
 */
function cleanProps(props) {
  return props.map(prop => ({
    description: noLineBreaks(prop.description) || undefined,
    name: prop.name || undefined,
    nested: prop.name ? (prop.name.indexOf('.') > -1) : false,
    optional: !!prop.optional,
    defaultvalue: prop.defaultvalue,
    type: prop.type ? clone(prop.type) : undefined,
    typesString: prop.type ? buildTypesString(prop) : ""
  }));
}

/**
 * Places the node in the correct place in the analysis results.
 * @private
 * @param {Object} node AST node
 * @param {Object} result the analysis results container
 */
function collect(node, result) {
  let target = result;
  const {modules, objects} = node.membership;
  let maybe;
  if (modules.length) {
    let module;
    modules.forEach(module => {
      target = target.modules
        .find(mod => mod.name && mod.name === module) || target;
    });
  }
  if (objects.length) {
    let obj;
    objects.forEach(obj => {
      maybe = target.classes // it may be a class
        .find(cl => cl.name && cl.name === obj);
      if (!maybe && target.members) {
        maybe = target.members // or it may be an object literal
          .find(mem => mem.name && mem.name === obj);
      }
      if (!maybe && target.modules) {
        maybe = target.modules // or maybe it's a namespace
          .find(mem => mem.name && mem.name === obj);
      }
      if (maybe) {
        target = maybe;
      }
    });
  }
  switch (node.kind) {
    case "function":
      if (target.kind === "class" || target.kind === "interface") {
        target.methods.push(node);
      } else {
        target.functions.push(node);
      }
      break;
    case "module":
    case "namespace":
      if (target.modules) { // global space
        target.modules.push(node);
      } else if (target.kind === "module" || target.kind === "namespace") {
        target.members.push(node);
      }
      break;
    case "class":
    case "interface":
      target.classes.push(node);
      break;
    case "member":
      target.members.push(node);
      break;
  }
}

/**
 * Recusively sets path data for items that end up in the index.
 * @param {AnalysisResult} data data to update paths on
 * @param {Object} opts application options
 */
function setIndexPaths(data, paths, opts) {
  ["modules", "functions", "classes", "members", "methods"].forEach(type => {
    if (data[type]) {
      data[type].forEach(item => {
        item.destination = path.relative(opts.output, paths.destination);
        item.source = path.relative(opts.output, path.join(paths.dirname, paths.basename));
        setIndexPaths(item, paths, opts);
      });
    }
  });
}

/**
 * Collects items that should end up in the file index from a single file's analyzed data.
 * Meant to be used with Array.reduce.
 * @private
 * @param {Object} accumulator object for collecting accumulated data across multiple files
 * @param {Array} accumulator.modules modules that should appear in the index
 * @param {Array} accumulator.functions functions that should appear in the index
 * @param {Array} accumulator.classes classes that should appear in the index
 * @param {AnalysisResult} data data to update paths on
 * @param {Object} opts application options
 * @return {Object} accumulator
 */
function collectIndexData(accumulator, data, opts) {
  data = clone(data);
  setIndexPaths(data.analyzed, data, opts);
  ["modules", "functions", "classes", "members"].forEach(type => {
    data.analyzed[type].forEach((item) => {
      accumulator[type].push(item);
    });
  });
  return accumulator;
}

/**
 * Checks whether an AST node is private.
 * @private
 * @param {Object} node the AST node to examine
 * @return {Boolean}
 */
function isInternal(node) {
  return node && ((node.name && node.name.lastIndexOf('_', 0) === 0) || node.access === 'private');
}

const memberRegExp = new RegExp(/^[a-z._0-9]+/gi); // global object membership
const moduleRegExp = new RegExp(/module:[a-z._0-9]+/gi); // module membership regexp
const objectRegExp = new RegExp(/~[a-z_0-9]*/gi); // class/member membership regexp

/**
 * Parses module & class membership from a memberof string.
 * @private
 * @param {String} input string
 * @returns {Object} {modules:[name|undefined], objects:[name|undefined]}
 */
function parseMembership(str) {
  // any old falsy value should just return empty
  if (!str) { return {modules: [], objects: []} }
  const modules = (str.match(moduleRegExp) || [])
    .map(mod => mod.split(":")[1].split("."))
    .reduce((acc, cur) => acc.concat(cur), []); // flatten the array
  const classish = (str.match(objectRegExp) || [])
    .map(obj => obj.slice(1));
  // may belong to some global member
  const objects = (str.match(memberRegExp) || [])
    .filter(name => name.indexOf("module") === -1) // the member reg will catch module:
    .map(mod => mod.split("."))
    .reduce((acc, cur) => acc.concat(cur), []) // flatten the array
    .concat(classish);
  return {modules, objects};
}

const lfRegExp = new RegExp(/\r\n|\r|\n/g); // matches line feeds
/**
 * Replaces line breaks with spaces in a string. Used in places where line breaks
 * would mess up Markdown output (like param and member descriptions).
 * @private
 * @param {String} str the string to transform
 * @return {String} the processed string
 */
function noLineBreaks(str) {
  return str && str.replace(lfRegExp, " ");
}

const standardNode = {
  description: undefined,
  version: undefined,
  deprecated: false
} // Standard node params assigned in normNode.

/**
 * Produce a normalized cloned node from a JSDoc AST entry.
 * @private
 * @param {Object} node AST node
 * @return {Object} normalized version of the node
 */
function normNode(node) {
  const copy = {...standardNode, ...clone(node)}; // let's not jank up the AST
  const membership = parseMembership(copy.memberof);
  copy.membership = membership;
  switch (copy.kind) {
    case "function":
      copy.params = copy.params || [];
      break;
    case "module":
    case "namespace":
      copy.classes = [];
      copy.functions = [];
      copy.requires = [];
      copy.members = [];
      break;
    case "class":
    case "interface":
      copy.members = copy.properties || [];
      copy.members.forEach(node => node.typesString = buildTypesString(node));
      copy.methods = [];
      break;
    case "member":
      copy.members = [];
      copy.functions = [];
      break;
  }
  return copy;
}

/**
 * Transforms the AST into a form that represents a single file with modules and their
 * functions.
 *
 * @private
 * @param {Object} ast
 * @param {Object} opts Command-line args
 * @returns {Object}
 */
function analyze(ast, opts) {
  if (!ast) { throw Error("didn't receive an AST") }
  var result = analysisResult();

  ast.forEach(function (node) {
    if (node.undocumented) { return }
    if (!opts.private && isInternal(node)) { return }
    node = normNode(node); // make a normalized copy
    collect(node, result); // put it in the proper bucket
    Object.keys(node).forEach(key => { // do cleanup on various properties
      switch (key) {
        case "properties":
        case "params":
        case "returns":
          node[key] = cleanProps(node[key]);
          break;
        case "fires":
          node[key] = cleanFires(node[key]);
          break;
        case "examples":
          node[key] = cleanExamples(node[key]);
          break;
      }
    });
    switch (node.kind) { // grab any extra metadata
      case "file":
        result.license   = node.license;
        result.author    = node.author;
        result.copyright = node.copyright;
        result.overview  = noLineBreaks(node.description);
        break;
      case "function":
        node.hasParams    = !!node.params.length;
        node.hasDefaultParams = node.params
          .reduce((acc, param) => acc || param.defaultvalue !== undefined, false);
        // For the function signature
        node.paramsString = node.params.filter(param => !param.nested)
          .map((p) => p.name)
          .join(", ");
        break;
      case "member":
        break;
      case "module":
      case "namespace":
        node.hasRequires = !!node.requires.length;
        break;
      case "class":
      case "interface":
        break;
    }
  });

  // some top level template metadata
  result.hasClasses = !!result.classes.length;
  result.hasFunctions = !!result.functions.length;
  result.hasMembers = !!result.members.length;
  result.hasMethods = result.methods && !!result.methods.length;
  result.hasModules = !!result.modules.length;
  result.hasMultipleModules = result.modules.length > 1;
  result.classes.forEach(cl => cl.hasMembers = !!cl.members.length);
  return result;
}

function index(files, opts) {
  const analyzed = analysisResult({
    source: "",
    dirname: ".",
    basename: opts.indexName,
    name: packageJson.name,
    author: packageJson.author,
    description: packageJson.description,
    license: packageJson.license,
    version: packageJson.version,
    destination: path.join(opts.output, opts.indexName)
  });
  files.reduce((p, c) => collectIndexData(p, c, opts), analyzed);
  return analyzed;
}

module.exports = analyze;
module.exports.index = index;
module.exports.analysisResult = analysisResult;
module.exports.buildTypesString = buildTypesString;
module.exports.cleanExamples = cleanExamples;
module.exports.cleanProps = cleanProps;
module.exports.cleanFires = cleanFires;
module.exports.collect = collect;
module.exports.collectIndexData = collectIndexData;
module.exports.isInternal = isInternal;
module.exports.normNode = normNode;
module.exports.noLineBreaks = noLineBreaks;
module.exports.parseMembership = parseMembership;
