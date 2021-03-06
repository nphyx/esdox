/**
 * Contains the main esdox module.
 *
 * @module main
 */
const util = require('util');
const promisify = util.promisify;
const fs = require('fs');
const path = require('path');
const jsdocParser = require('jsdoc3-parser');
const analyze = require('./lib/analyze');
const generateMD = require('./lib/generateMD');
const recursive = require("recursive-readdir");
const packageJson = require("./package.json");
const promisedParser = promisify(jsdocParser);
const promisedWriteFile = promisify(fs.writeFile);
const promisedMkdir = promisify(fs.mkdir);
const promisedStat = promisify(fs.stat);
const promisedReaddir = promisify(fs.readdir);
/* eslint no-unused-vars:2 */

/**
 * Collects items that should end up in the file index from a single file's analyzed data.
 * Meant to be used with Array.reduce.
 * @private
 * @param {Object} accumulator object for collecting accumulated data across multiple files
 * @param {Array} accumulator.modules modules that should appear in the index
 * @param {Array} accumulator.functions functions that should appear in the index
 * @param {Array} accumulator.classes classes that should appear in the index
 * @param {Object} data analyzed data
 * @param {Object} opts options passed to the [esdox](#esdox) function
 * @return {Object} accumulator
 */
exports.collectIndexData = function collectIndexData(accumulator, data, opts) {
  data.analyzed.modules.forEach(module => {
    if (module.name !== "Global") { // don't list global modules
      var toAddModule = module;
      toAddModule.destination = path.relative(opts.output, data.destination);
      toAddModule.source = path.relative(opts.output, path.join(data.dirname, data.basename));
      accumulator.modules.push(toAddModule);
    }
  });
  data.analyzed.functions.forEach(func => {
    if ((!func.moduleName) && (func.className === undefined)) {
      var toAddFct = func;
      toAddFct.destination = path.relative(opts.output, data.destination);
      toAddFct.source = path.relative(opts.output, path.join(data.dirname, data.basename));
      accumulator.functions.push(toAddFct);
    }
  });
  data.analyzed.classes.forEach((klass) => {
    if (!klass.moduleName) {
      var toAddClass = klass;
      toAddClass.destination = path.relative(opts.output, data.destination);
      toAddClass.source = path.relative(opts.output, path.join(data.dirname, data.basename));
      accumulator.classes.push(toAddClass);
    }
  });
  return accumulator;
}

/**
 * Process files in opts according to specified options.
 *
 * @param  {Object} opts [see main opts](#main)
 * @private
 * @return {Promise}
 */
exports.generate = async function generate(opts) {
  let stats;
  let files = opts.input;
  let recursedFiles = [];

  stats = await Promise.all(files.map(async file => {
    try {
      let stat = await promisedStat(file);
      return stat;
    } catch (err) {
      switch (err.code) {
        case "ENOENT":
          throw Error("file does not exist: " + file);
        default:
          throw err;
      }
    }
  }));
  await Promise.all(stats.map(async (stat, i) => {
    if (stat.isDirectory()) {
      let ret = [];
      if (opts.r || opts.rr) {
        ret = await recursive(files[i]);
      } else {
        ret = await promisedReaddir(files[i]);
        ret = ret.map(file => path.join(files[i], file));
      }
      recursedFiles = recursedFiles.concat(ret);
    }
  }));

  files = files.concat(recursedFiles);
  files = files.filter(file => file.match(/\.js$/));
  if (files.length === 0) {
    throw new Error("no javascript files in input path");
  }
  files.sort();

  // create an output object with analyzed information
  let output = await Promise.all(files.map(async (file) => {
    // this is sort of a fix for tests :/
    let out = {};
    out.source = file;
    out.dirname = path.dirname(out.source);
    out.basename = path.basename(out.source);
    if (opts.rr) {
      out.destination = path.join(opts.output, out.dirname, out.basename);
    } else {
      out.destination = path.join(opts.output, out.basename);
    }
    out.destination = out.destination.replace(/\.js$/, '.md');
    out.parsed = await promisedParser(path.join(out.dirname, out.basename));
    out.analyzed = analyze(out.parsed, opts);
    out.analyzed.source = out.source;
    out.analyzed.basename = out.basename;
    out.markdown = await generateMD(out.analyzed, opts.templateDir, false);
    return out;
  }));
  output.sort((a, b) => a.source > b.source);

  if (opts.index) {
    // if we're generating indexes, do that with the analyzed data
    let indexData = {modules: [], functions: [], classes: []};
    output.reduce((p, c) => exports.collectIndexData(p, c, opts), indexData);
    indexData.source = "";
    indexData.dirname = ".";
    indexData.basename = opts.indexName;
    indexData.name = packageJson.name;
    indexData.author = packageJson.author;
    indexData.description = packageJson.description;
    indexData.license = packageJson.license;
    indexData.version = packageJson.version;
    indexData.destination = path.join(opts.output, opts.indexName);
    indexData.markdown = await generateMD(indexData, opts.templateDir, true, opts["index-sort"]);
    output.push(indexData);
  }

  return output;
}

/**
 * Recursively creates directories for an output file.
 * @private
 * @param {String} dir directory to create
 */
exports.createDirectoryRecursive = async function createDirectoryRecursive(dir) {
  try {
    await promisedStat(path.join(process.cwd(), dir));
  } catch (err) {
    let parent;
    switch (err.code) {
      case "ENOENT":
        parent = path.dirname(dir);
        if (parent) {
          await createDirectoryRecursive(parent);
        }
        break;
      // maybe handle other errors elegantly here
      default:
        throw err;
    }
  }
  try {
    await promisedMkdir(path.join(process.cwd(), dir));
  } catch (err) {
    if (err.code !== "EEXIST") {
      throw err;
    }
  }
  return;
}

/**
 * Main function handles parsed CLI input from bin/esdox or a passed
 * options object.
 * @param {Object} opts configuration object
 * @param {String|Array} opts.input input file or directory
 * @param {String} opts.output output directory
 * @param {String} [opts.templateDir] directory for custom mustache templates
 * @param {String} [opts.index-sort=standard] sort index entries by name ("standard"), namespace ("namespace"), or not at all ("none")
 * @param {String} [opts.indexName=index.md] name for generated index file
 * @param {Boolean} [opts.recursive=false] generate documentation for subdirectories
 * @param {Boolean} [opts.respect-recursive=false] generate documentation for subdirectories, keeping directory structure in output files
 * @param {Boolean} [opts.index=false] generate an index file
 * @return {Promise}
 */
async function main(opts = {}) {
  const defaults = {
    indexName: "index.md"
  }
  opts = {...defaults, ...opts};
  if (typeof(opts.input) === "string") {
    opts.input = [opts.input];
  }
  let generated = await exports.generate(opts);
  await Promise.all(generated.map(entry => {
    return exports.createDirectoryRecursive(path.dirname(entry.destination));
  }));
  await Promise.all(generated.map(entry => {
    return promisedWriteFile(entry.destination, entry.markdown);
  }));
  return process.exit();
}

exports.analyze = analyze;
exports.generateMD = generateMD;
exports.esdox = main;
