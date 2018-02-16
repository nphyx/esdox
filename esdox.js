/**
 * Contains the main esdox module.
 *
 * @module main
 */
const path = require("path");
const analyze = require("./lib/analyze");
const generate = require("./lib/generate");
const parser = require("./lib/parser");
const fsm = require("fs-magic");
const clone = require("clone");
const defaultOpts = {
  indexName: "index.md",
  output: "esdox_output"
}

/* eslint no-unused-vars:2 */

/**
 * Recursively creates directories for an output file.
 * @private
 * @param {String} dir directory to create
 */
async function createDirectoryRecursive(dir) {
  try {
    await fsm.stat(path.join(process.cwd(), dir));
  } catch (err) {
    switch (err.code) {
      case "ENOENT":
        await createDirectoryRecursive(path.dirname(dir));
        break;
      // maybe handle other errors elegantly here
      default:
        throw err;
    }
  }
  try {
    await fsm.mkdir(path.join(process.cwd(), dir));
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
 * @async
 * @param {Object}       opts configuration object
 * @param {String|Array} opts.input input file or directory
 * @param {Boolean}      [opts.index=false] generate an index file
 * @param {String}       [opts.indexName=index.md] name for generated index file
 * @param {String}       [opts.indexSort=standard] sort index entries by name ("standard"), namespace ("namespace"), or not at all ("none")
 * @param {Boolean}      [opts.keepFs=false] generate documentation for subdirectories of opts.input, keeping directory structure in output files
 * @param {String}       [opts.output=esdox_output] output directory
 * @param {String}       [opts.private=false] include @private/@internal in docs
 * @param {Boolean}      [opts.recursive=false] include subdirectories of opts.input
 * @param {String}       [opts.templates] directory for custom mustache templates
 * @return {Promise}
 */
async function main(opts) {
  opts = {...defaultOpts, ...opts};
  if (typeof(opts.input) === "string") {
    opts.input = [opts.input];
  }
  let stats;

  stats = await Promise.all(opts.input.map(async file => {
    try {
      let stat = await fsm.stat(file);
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

  let files = clone(opts.input);

  await Promise.all(stats.map(async (stat, i) => {
    if (stat.isDirectory()) {
      let [f] = await fsm.scandir(opts.input[i], opts.recursive || opts.keepFs);
      files = files.concat(f);
    }
  }));
  files = files.filter(file => file.match(/\.js$/));
  if (files.length === 0) {
    throw new Error("no javascript files in input path");
  }
  files.sort();

  let processed = await Promise.all(files.map(async (file) => {
    // this is sort of a fix for tests :/
    let out = {};
    // TODO: make analyze handle path stuff
    out.source = file;
    out.dirname = path.dirname(out.source);
    out.basename = path.basename(out.source);
    if (opts.keepFs) {
      out.destination = path.join(opts.output, out.dirname, out.basename);
    } else {
      out.destination = path.join(opts.output, out.basename);
    }
    out.destination = out.destination.replace(/\.js$/, '.md');
    out.parsed = await parser(path.join(out.dirname, out.basename));
    out.analyzed = analyze(out.parsed, opts);
    out.analyzed.source = out.source;
    out.analyzed.basename = out.basename;
    out.markdown = await generate(out.analyzed, opts);
    return out;
  }));

  if (opts.index) {
    let out = analyze.index(processed, opts);
    out.markdown = await(out, opts);
    processed.push(out);
  }

  // only call module.exports.createDirectoryRecursive (not directly) so it can be measured by the tests :/
  await Promise.all(processed.map(entry => module.exports.createDirectoryRecursive(path.dirname(entry.destination))));
  await Promise.all(processed.map(entry => fsm.writeFile(entry.destination, entry.markdown)));
  return process.exit();
}
module.exports = main;
module.exports.defaultOpts = defaultOpts;
module.exports.createDirectoryRecursive = createDirectoryRecursive;
module.exports.analyze = analyze;
module.exports.generate = generate;
