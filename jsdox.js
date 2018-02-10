/*
   Copyright (c) 2012-2016 Sutoiku

   Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
   documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
   rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
   persons to whom the Software is furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
   Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
   WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
   COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
   OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
   */
const util = require('util');
const promisify = util.promisify;
const fs = require('fs');
const path = require('path');
const jsdocParser = require('jsdoc3-parser');
const analyze = require('./lib/analyze');
const generateMD = require('./lib/generateMD');
const recursive = require("recursive-readdir");
const {printHelp, printVersion, loadConfigFile} = require("./lib/cliUtil");
const promisedParser = promisify(jsdocParser);
const promisedWriteFile = promisify(fs.writeFile);
const promisedMkdir = promisify(fs.mkdir);
const promisedStat = promisify(fs.stat);
/* eslint no-unused-vars:2 */

/**
 * Collects items that should end up in the file index from a single file's analyzed data.
 * Meant to be used with Array.reduce.
 * @param {Object} accumulator object for collecting accumulated data across multiple files
 * @param {Array} accumulator.functions functions that should appear in the index
 * @param {Array} accumulator.classes classes that should appear in the index
 * @param {Object} data analyzed data
 * @param {Object} opts options passed to the [jsdox](#jsdox) function
 * @return {Object} accumulator
 */
exports.collectIndexData = function collectIndexData(accumulator, data, opts) {
  data.analyzed.functions.forEach(func => {
    if (func.className === undefined) {
      var toAddFct = func;
      toAddFct.source = path.relative(opts.output, path.join(data.dirname, data.basename));
      accumulator.functions.push(toAddFct);
    }
  });
  data.analyzed.classes.forEach((klass) => {
    var toAddClass = klass;
    toAddClass.source = path.relative(opts.output, path.join(data.dirname, data.basename));
    accumulator.classes.push(toAddClass);
  });
  return accumulator;
}

/**
 * Generate markdown for given configuration details.
 *
 * @param  {String}   filename
 * @param  {String}   destination
 * @param  {String}   templateDir
 * @param  {Function} cb
 * @param  {Function} fileCb
 */
exports.generateForDir = async function generateForDir(opts) {
  let files;
  let filename = opts.input;

  if (filename.match(/\.js$/)) {
    files = [filename];
  } else {
    let stat = await promisedStat(filename);
    if (stat.isDirectory()) {
      files = await recursive(filename);
      files.sort();
    } else {
      throw Error("input file is not a .js or directory");
    }
  }

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
      out.destination = path.join(opts.output, out.source);
    }
    out.destination = out.destination.replace(/\.js$/, '.md');
    out.parsed = await promisedParser(path.join(out.dirname, out.basename));
    out.analyzed = analyze(out.parsed, opts);
    out.markdown = generateMD(out.analyzed, opts.templateDir, true);
    return out;
  }));
  output.sort((a, b) => a.source > b.source);

  if (opts.index) {
    // if we're generating indexes, do that with the analyzed data
    let indexData = {functions: [], classes: []};
    output.reduce((p, c) => exports.collectIndexData(p, c, opts), indexData);
    indexData.source = filename;
    indexData.dirname = path.dirname(filename);
    indexData.basename = path.basename("index.md");
    indexData.destination = path.join(opts.output, "index.md");
    indexData.markdown = generateMD(indexData, opts.templateDir, true, opts["index-sort"]);
    output.push(indexData);
  }

  return output;
}

/**
 * Recursively creates directories for an output file.
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
 * Main function handles parsed CLI input from bin/jsdox or a passed
 * options object.
 * @param {Object} opts may include [command line options](lib/#printHelp)
 * @param {String} opts.config path to a configuration file
 * @param {String} opts.input input file or directory
 * @param {String} opts.output output directory
 * @param {String} [opts.templateDir] directory for custom mustache templates
 * @param {String} [opts.index-sort=standard] sort index entries by name ("standard"), namespace ("namespace"), or not at all ("none")
 * @param {Boolean} [opts.recursive=false] generate documentation for subdirectories
 * @param {Boolean} [opts.respect-recursive=false] generate documentation for subdirectories, keeping directory structure in output files
 * @param {Boolean} [opts.index=false] generate an index file
 * @return {Promise}
 */
async function main(opts = {}) {
  if (Object.keys(opts).length === 0 || opts.help) {
    printHelp();
    return process.exit();
  } else if (opts.version) {
    printVersion();
    return process.exit();
  } else {
    try {
      if (opts.config) {
        let config = await loadConfigFile(opts.config);
        for (var key in config) {
          opts[key] = config[key];
        }
      }
      if (!opts.input) {
        throw new Error("no input supplied");
      }
      let generated = await exports.generateForDir(opts);
      await Promise.all(generated.map(entry => {
        return exports.createDirectoryRecursive(path.dirname(entry.destination));
      }));
      await Promise.all(generated.map(entry => {
        return promisedWriteFile(entry.destination, entry.markdown);
      }));
      return process.exit();
    } catch (err) {
      console.error("Error:", err.message);
      return process.exit();
    }
  }
}

exports.analyze = analyze;
exports.generateMD = generateMD;
exports.jsdox = main;
