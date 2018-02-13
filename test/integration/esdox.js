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

/* global xit */

const bin = "bin/esdox";

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
 * Helper for asserting that the output from running esdox from the cli
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

describe('integration: esdox cli', function() {
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

  it('generates output in a flattened file structure', async () => {
    const cmd = bin + " -o " + outpath + " " + inpath + "**.js";
    const {err, stdout, stderr} = await execp(cmd);
    expect(stderr).to.be.empty();

    let inputs = await fsp.readdir(inpath);
    let files = await recursive(outpath);
    let found = await checkFiles(files);
    found.length.should.eql(inputs.length - 2); // 2 subdirectories
  }).timeout(10000);

  it('generates output files recursively with the -r option', async () => {
    const cmd = bin + " -r -o " + outpath + " " + inpath;
    const {err, stdout, stderr} = await execp(cmd);
    expect(stderr).to.be.empty();

    let inputs = await recursive(inpath);
    let files = await recursive(outpath);
    files.length.should.eql(inputs.length - 1); // one file with same name stomps another file
    let found = await checkFiles(files);
    found.length.should.eql(files.length);
  }).timeout(10000);

  it('generates output files recursively respecting original file structure with the --rr option', async () => {
    const cmd = bin + " --rr -o " + outpath + " " + inpath;
    const {err, stdout, stderr} = await execp(cmd);

    let inputs = await recursive(inpath);
    let files = await recursive(outpath);
    files.length.should.eql(inputs.length);
    let found = await checkFiles(files);
    found.length.should.eql(files.length);

    // top level directory structure is correct
    files = await fsp.readdir(path.join(outpath, "/fixtures"));
    files.length.should.eql(found.length - 1);

    // second level directory structure is correct
    files = await fsp.readdir(path.join(outpath, "/fixtures/under"));
    files.length.should.eql(2);

    // third level structure correct
    files = await fsp.readdir(path.join(outpath, "/fixtures/under_grandparent/under_parent"));
    files.length.should.eql(1);
  }).timeout(10000);

  it('generates an index file with the default name', async () => {
    const cmd = bin + " -i -o " + outpath + " " + inpath;
    const {err, stdout, stderr} = await execp(cmd);
    expect(stderr).to.be.empty();

    fsp.stat(outpath + "index.md")
      .should.not.be.rejected()
  }).timeout(10000);

  it('generates an index file with a custom name', async () => {
    const cmd = bin + " -i --in custom.md -o " + outpath + " " + inpath;
    const {err, stdout, stderr} = await execp(cmd);
    expect(stderr).to.be.empty();

    fsp.stat(outpath + "custom.md")
      .should.not.be.rejected()
  }).timeout(10000);

  it("generates recusively, creating a custom index file", async () => {
    var cmd = bin + " -o " + outpath + " -r -i --in custom.md " + inpath;
    const {err, stdout, stderr} = await execp(cmd);
    expect(stderr).to.be.empty();

    let inputs = await recursive(inpath);
    let files = await recursive(outpath);
    files.length.should.eql(inputs.length); // -1 for stomping +1 for index
    let found = await checkFiles(files);
    found.length.should.eql(files.length);

    fsp.stat(outpath + "custom.md")
      .should.not.be.rejected()

  }).timeout(10000);

  describe('cli options', function() {
    xit('prints the help menu with the -H option', function(done) {
      expectOutputFromCommand(bin + ' -H', 'Usage:', done);
    });

    xit('prints the version with the -v option', function(done) {
      expectOutputFromCommand(bin + ' -v', require('../../package.json').version, done);
    });

    it('accepts a custom template directory with the -t option', async () => {
      var cmd = bin + " -o " + outpath + " -r --templateDir ./test/templateOverrides " + inpath;
      const overridden = await fsp.readFile("./test/templateOverrides/file.mustache");
      const {err, stdout, stderr} = await execp(cmd);
      expect(stderr).to.be.empty();

      const files = await recursive(outpath);
      const probe = await fsp.readFile(files[0]);
      probe.toString().should.eql(overridden.toString());
    });

    describe('-o option', function() {
      xit('converts an input file to an output markdown file');
      xit('converts an input directory of files to an output directory of markdown files');
    });
  });
});
