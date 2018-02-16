const os = require("os");
const exec = require("child_process").exec;
const path = require("path");
const promisify = require("util").promisify;
const fsm = require("fs-magic");
require("should");
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
    (stream.indexOf(output) !== -1).should.be.True();
    done();
  });
}

describe('integration: esdox cli', function() {
  async function checkFiles(files) {
    files = await Promise.all(
      files.map(async file => {
        let stat = await fsm.stat(file);
        return stat.isDirectory() ? undefined : file;
      })
    );
    return Promise.all(
      files.filter((file) => file).map(async file => {
        let content = await fsm.readFile(file);
        content.toString().should.not.be.empty();
        return file;
      })
    );
  }

  async function cleanup() {
    try {
      await fsm.rmrf(outpath);
    } catch (err) {
      // probably just a didn't exist error, which is ok
    }
  }

  before(cleanup);
  afterEach(cleanup);

  describe('basic cli options', function() {
    it('prints the help menu with the -H option', async () => {
      var cmd = bin + " -H";
      const {err, stdout, stderr} = await execp(cmd);
      (stderr === "").should.be.True();
      stdout.length.should.be.greaterThan(0);
    });

    it('prints the version with the -v option', async () => {
      var cmd = bin + " -v";
      const {err, stdout, stderr} = await execp(cmd);
      (stderr === "").should.be.True();
      stdout.length.should.be.greaterThan(0);
    });
  });

  describe("documentation generation", () => {
    it('generates output in a flattened file structure', async () => {
      const cmd = bin + " -o " + outpath + " " + inpath + "**.js";
      const {err, stdout, stderr} = await execp(cmd);
      (stderr === "").should.be.True();

      let [inputs] = await fsm.scandir(inpath, false);
      inputs = inputs.filter(i => i.match(/js$/));
      let [files] = await fsm.scandir(outpath, false);
      files = files.filter(f => f.match(/md$/));
      let found = await checkFiles(files);
      found.length.should.eql(inputs.length);
    }).timeout(10000);

    it('generates output files recursively with the -r option', async () => {
      const cmd = bin + " -r -o " + outpath + " " + inpath;
      const {err, stdout, stderr} = await execp(cmd);
      (stderr === "").should.be.True();

      let [inputs] = await fsm.scandir(inpath);
      inputs = inputs.filter(i => i.match(/js$/));
      let [files] = await fsm.scandir(outpath);
      files = files.filter(f => f.match(/md$/));
      files.length.should.eql(inputs.length - 1); // one file with same name stomps another file
      let found = await checkFiles(files);
      found.length.should.eql(files.length);
    }).timeout(10000);

    it('generates output files recursively respecting original file structure with the --keep-fs option', async () => {
      const cmd = bin + " --keep-fs -o " + outpath + " " + inpath;
      const {err, stdout, stderr} = await execp(cmd);
      (stderr === "").should.be.True();

      let [inputs] = await fsm.scandir(inpath);
      inputs = inputs.filter(i => i.match(/js$/));
      let [files] = await fsm.scandir(outpath);
      files = files.filter(f => f.match(/md$/));
      files.length.should.eql(inputs.length);
      let found = await checkFiles(files);
      found.length.should.eql(files.length);

      // top level directory structure is correct
      files = await fsm.readdir(path.join(outpath, "/fixtures"));
      files.length.should.eql(found.length - 1);

      // second level directory structure is correct
      files = await fsm.readdir(path.join(outpath, "/fixtures/under"));
      files.length.should.eql(2);

      // third level structure correct
      files = await fsm.readdir(path.join(outpath, "/fixtures/under_grandparent/under_parent"));
      files.length.should.eql(1);
    }).timeout(10000);

    it('generates an index file with the default name', async () => {
      const cmd = bin + " -i -o " + outpath + " " + inpath;
      const {err, stdout, stderr} = await execp(cmd);
      (stderr === "").should.be.True();

      fsm.stat(outpath + "index.md")
        .should.not.be.rejected()
    }).timeout(10000);

    it('generates an index file with a custom name', async () => {
      const cmd = bin + " -i --in custom.md -o " + outpath + " " + inpath;
      const {err, stdout, stderr} = await execp(cmd);
      (stderr === "").should.be.True();

      fsm.stat(outpath + "custom.md")
        .should.not.be.rejected()
    }).timeout(10000);

    it("generates recusively, creating a custom index file", async () => {
      var cmd = bin + " -o " + outpath + " -r -i --in custom.md " + inpath;
      const {err, stdout, stderr} = await execp(cmd);
      (stderr === "").should.be.True();

      let [inputs] = await fsm.scandir(inpath);
      inputs = inputs.filter(i => i.match(/js$/));
      let [files] = await fsm.scandir(outpath);
      files = files.filter(f => f.match(/md$/));
      files.length.should.eql(inputs.length); // -1 for stomping +1 for index
      let found = await checkFiles(files);
      found.length.should.eql(files.length);

      fsm.stat(outpath + "custom.md")
        .should.not.be.rejected()

    }).timeout(10000);


    it('accepts a custom template directory with the -t option', async () => {
      var cmd = bin + " -o " + outpath + " -r --templates ./test/templateOverrides " + inpath;
      const overridden = await fsm.readFile("./test/templateOverrides/file.mustache");
      const {err, stdout, stderr} = await execp(cmd);
      (stderr === "").should.be.True();

      let [inputs] = await fsm.scandir(inpath);
      inputs = inputs.filter(i => i.match(/js$/));
      let [files] = await fsm.scandir(outpath);
      files = files.filter(f => f.match(/md$/));
      const probe = await fsm.readFile(files[0]);
      probe.toString().should.eql(overridden.toString());
    }).timeout(10000);
  });
});
