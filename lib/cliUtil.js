const packageJson = require("../package.json");
const path = require("path");
const fs = require("fs");
const promisify = require("util").promisify;
const promisedExists = promisify(fs.exists);
const promisedReadFile = promisify(fs.readFile);

/**
 * Prints console help text.
 */
function printHelp() {
  console.log('Usage:\tjsdox [options] <file | directory>');
  console.log('\tjsdox --All --output docs folder\n');
  console.log('Options:');
  console.log('  -c,\t--config \t<file>\t Configuration JSON file.');
  console.log('  -A,\t--All\t\t\t Generates documentation for all available elements including internal methods.');
  console.log('  -d,\t--debug\t\t\t Prints debugging information to the console.');
  console.log('  -H,\t--help\t\t\t Prints this message and quits.');
  console.log('  -v,\t--version\t\t Prints the current version and quits.');
  console.log('  -o,\t--output\t\t Output directory.');
  console.log('  -t,\t--templateDir\t\t Template directory to use instead of built-in ones.');
  console.log('  -i,\t--index\t\t\t Generates an index with the documentation. A file name can be provided in argument.');
  console.log('  -r,\t--recursive\t\t Generates documentation in all subdirectories of the directory given as argument.');
  console.log('  --rr,\t--respect-recursive\t Will generate subdirectories and copy the original organization of the sources.');
}

/**
 * Prints version number.
 */
function printVersion() {
  console.log('Version: ' + packageJson.version);
}

/**
 * Loads config options from config file. Mutates the passed opts.
 * @param {String} file config file path relative to cwd
 * @return Promise<Object> parsed options file
 */
async function loadConfigFile(filename) {
  // Check to see if file exists
  let file = path.resolve(process.cwd(), filename);
  try {
    let exists = await promisedExists(file);
    if (exists) {
      let json = await promisedReadFile(file);
      return JSON.parse(json);
    }
  } catch (err) {
    throw new Error("config file not found");
  }
}

exports.printHelp = printHelp;
exports.printVersion = printVersion;
exports.loadConfigFile = loadConfigFile;
