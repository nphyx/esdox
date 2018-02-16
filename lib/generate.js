/**
 *
 * The generateMD function, plus various internal functions to manage the process.
 *
 * @module generateMD
 * @requires mustache
 * @requires fs
 * @requires path
 * @requires util
 * @requires fsm.scandir-readdir
 */
const Mustache = require("mustache");
const fsm = require("fs-magic");
const path = require("path");
const util = require("util");
const analyze = require("./analyze");

/**
 * Finds the template name of a mustache template based on the file name.
 * @private
 */
const mustacheRegExp = new RegExp(/\.mustache$/);

/**
 * Get the name of a template from its filename.
 * @example
 * ```javascript
 * templateName("templates/file.mustache"); // "file"
 * ```
 * @private
 * @param {String} filePath the path
 * @return {String}
 */
const templateName = (filePath) => path.basename(filePath).replace(mustacheRegExp, '');

/**
 * Loads default templates and user-provided overrides, then stores them in a cache.
 * @return {Object} { "templateName": "templateContents" ... }
 */
const loadTemplates = (() => {
  const cache = {};
  return async function loadTemplates(overrides) {
    if (Object.keys(cache).length) {
      return cache; // no doublin' up
    }
    const [defaultFiles] = await fsm.scandir(path.join(__dirname, "../templates"));
    let overrideFiles = [];
    if (overrides) {
      [overrideFiles] = await fsm.scandir(overrides);
    }
    const queue = {};
    defaultFiles.forEach(filePath => queue[templateName(filePath)] = {filePath});
    overrideFiles.forEach(filePath => queue[templateName(filePath)] = {filePath});
    const names = Object.keys(queue);
    const templates = await Promise.all(names.map(name => fsm.readFile(queue[name].filePath)));
    templates.forEach((template, i) => {
      cache[names[i]] = template.toString();
    });
    return cache;
  }
})();

/**
 * Processes nodes recursively, fixing links.
 * @private
 * @param {Object} tag - tag to process
 * @param {Object} targets - map of targets to use for links (optional)
 */
function processLinksRecursive(node, targets) {
  targets = {};
  if (node.description) {
    node.description = replaceLinks(node.description, targets);
  }
  ["modules", "classes", "functions", "methods", "members", "params"].forEach(type => {
    if (node[type] && node[type].length) {
      node[type].forEach((subNode) => {
        //subNode.target = targets[subNode.longname] = '#' + subNode.longname.toLowerCase();
        processLinksRecursive(subNode, targets);
      });
    }
  });
}

/**
 * Replaces {@link ...} with `[...](...)`.
 * @private
 * @param {string} str string to process
 * @return {string}
 */
function replaceLinks(str) {
  return str.replace(/\{@link\s+([^}]+)\}/g, function(full, link) {
    return util.format('[%s](%s)', link, link);
  });
}

/**
 * Renders markdown from the given analyzed AST
 * @param  {Object} analyzed - output from analyze()
 * @param  {Object} opts application options {@link esdox}
 * @return {String} Markdown output
 */
async function generate(analyzed, opts) {
  if (!analyzed) { throw new Error('no analyzed analyzed to generate markdown from'); }
  const templates = await loadTemplates(opts.templates);

  processLinksRecursive(analyzed);
  return Mustache.render(templates.file, analyzed, templates);
}

/**
 * Exports for unit testing.
 */
module.exports = generate;
module.exports.replaceLinks = replaceLinks;
module.exports.processLinksRecursive = processLinksRecursive;
