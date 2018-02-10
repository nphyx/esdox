const os = require("os");
const exec = require("child_process").exec;
const path = require("path");
const expect = require("expect.js");
const promisify = require("util").promisify;
const recursive = require("recursive-readdir");
const fs = require("fs");
require("should");
const fsp = {};
["stat", "readFile", "readdir", "rmdir", "unlink"].forEach(fn => {
  fsp[fn] = promisify(fs[fn]);
});

const bin = "bin/jsdox";

const inpath = "./fixtures/";
const outpath = "./test/test_output/";

const execp = function(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      resolve({err, stdout, stderr});
    });
  });
}

/**
 * Helper for asserting that the output from running jsdox from the cli
 * contains a given string
 * @param  {String}   cmd    - The command to execute
 * @param  {String}   output - The string that should be in the output
 * @param  {Function} done   - Executed when the exec is finished
 * @param  {Boolean} isError - Whether or not to check stderr instead
 */
function expectOutputFromCommand(cmd, output, done, isError) {
  exec(cmd, function(err, stdout, stderr) {
    var stream = isError ? stderr : stdout;
    expect(stream.indexOf(output) !== -1).to.be(true);
    done();
  });
}

describe('jsdox', function() {
  let cleanup;
  if (os.platform() === "win32") {
    cleanup = async function() {
      try {
        const files = await recursive(outpath);
        await Promise.all(files.map(file => fsp.unlink(file)));
      } catch (err) {}
      try {
        await fsp.rmdir(outpath + "under_grandparent/under_parent");
      } catch (err) {}
      try {
        await fsp.rmdir(outpath + "under_grandparent");
      } catch (err) {}
      try {
        await fsp.rmdir(outpath + "under");
      } catch (err) {}
      try {
        await fsp.rmdir(outpath);
      } catch (err) {}
    }
  } else {
    // probably has rm -rf
    cleanup = async function() {
      // but let's not -f
      try {
        const files = await recursive(outpath);
        await Promise.all(files.map(file => fsp.unlink(file)));
      } catch (err) {}
      await execp("rm -r " + outpath);
    }
  }

  async function checkFiles(files) {
    files = await Promise.all(
      files.map(async file => {
        let stat = await fsp.stat(file);
        return stat.isDirectory() ? undefined : file;
      })
    );
    return Promise.all(
      files.filter((file) => file).map(async file => {
        let content = await fsp.readFile(file);
        content.toString().should.not.be.empty();
        return file;
      })
    );
  }

  before(cleanup);
  afterEach(cleanup);

  it('prints an error if an input file or directory is not supplied', function(done) {
    expectOutputFromCommand(bin, 'Error', done, true);
  });

  it('generates non-empty output markdown files from the fixtures/ files', async () => {
    const cmd = bin + " -o " + outpath + " " + inpath + "**.js";
    const {err, stdout, stderr} = await execp(cmd);
    expect(stderr).to.be.empty();

    let inputs = await fsp.readdir(inpath);
    let files = await recursive(outpath);
    let found = await checkFiles(files);
    found.length.should.eql(inputs.length - 2); // 2 subdirectories
  });

  it('generates non-empty output markdown files from the fixtures/ and the fixtures/under files', async () => {
    const cmd = bin + " -r -o " + outpath + " " + inpath;
    const {err, stdout, stderr} = await execp(cmd);
    expect(stderr).to.be.empty();

    let inputs = await recursive(inpath);
    let files = await recursive(outpath);
    files.length.should.eql(inputs.length);
    let found = await checkFiles(files);
    found.length.should.eql(files.length);
  });

  it('generates non-empty output markdown files from the fixtures/ and the fixtures/under and' +
      ' the fixtures/under_grandparent/under_parent files and an under and an under_grandparent/under_parent directory in outputs', async () => {
    const cmd = bin + " -rr -i -o " + outpath + " " + inpath;
    const {err, stdout, stderr} = await execp(cmd);
    console.log(stdout);
    expect(stderr).to.be.empty();

    let inputs = await recursive(inpath);
    let files = await recursive(outpath);
    files.length.should.eql(inputs.length + 1); // +1 for index
    let found = await checkFiles(files);
    found.length.should.eql(files.length);

    // top level directory structure is correct
    files = await fsp.readdir(outpath + "/fixtures");
    files.length.should.eql(found.length - 2);

    // second level directory structure is correct
    files = await fsp.readdir(outpath + "/fixtures/under");
    files.length.should.eql(2);

    // third level structure correct
    files = await fsp.readdir(outpath + "/fixtures/under_grandparent/under_parent");
    files.length.should.eql(1);
  });

  it('generates non-empty output markdown files from the fixtures/ and the fixtures/under files and index.md', function(done) {
    this.timeout(5000);

    var cmd = bin + ' fixtures/ -o sample_output -r -i';

    exec(cmd, function(err, stdout, stderr) {
      expect(stderr).to.be.empty();

      var nbFiles = 0;
      var hasIndex = false;
      fs.readdirSync('sample_output').forEach(function(outputFile) {
        if (fs.lstatSync('sample_output/' + outputFile).isFile()) {
          var content = fs.readFileSync('sample_output/' + outputFile).toString();
          expect(content).not.to.be.empty();
          nbFiles += 1;
          hasIndex = hasIndex || (outputFile === 'index.md');
        }
      });
      expect(nbFiles).to.be(10);
      expect(hasIndex).to.be(true);
      //clean index for other tests
      fs.unlinkSync('sample_output/index.md');

      done();
    });
  });

  describe('cli options', function() {
    it('prints the help menu with the -H option', function(done) {
      expectOutputFromCommand(bin + ' -H', 'Usage:', done);
    });

    it('prints the version with the -v option', function(done) {
      expectOutputFromCommand(bin + ' -v', require('../package.json').version, done);
    });

    it('accepts a custom template directory with the -t option');

    describe('-o option', function() {
      it('converts an input file to an output markdown file');
      it('converts an input directory of files to an output directory of markdown files');
    });
  });
});

