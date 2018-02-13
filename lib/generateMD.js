/**
 * @module generateMD
 *
 * The generateMD function, plus various internal functions to manage the process.
 * @requires mustache, fs, path, util, recursive-readdir, promisify
 */
const Mustache = require('mustache');
const promisify = require("util").promisify
const fs = require('fs');
const path = require('path');
const util = require('util');
const recursive = require("recursive-readdir");
const fsp = {};
["readFile"].forEach(fn => {
  fsp[fn] = promisify(fs[fn]);
});

/**
 * Finds the template name of a mustache template based on the file name.
 * @private
 */
const mustacheRegExp = new RegExp(/\.mustache$/);
const templateName = (filePath) => path.basename(filePath).replace(mustacheRegExp, '');

/**
 * Loads default templates and user-provided overrides, then stores them in a cache.
 *
 */
const loadTemplates = (() => {
  const cache = {};
  return async function loadTemplates(overrides) {
    if (Object.keys(cache).length) {
      return cache; // no doublin' up
    }
    const defaultFiles = await recursive(path.join(__dirname, "../templates"));
    let overrideFiles = [];
    if (overrides) {
      overrideFiles = await recursive(overrides);
    }
    const queue = {};
    defaultFiles.forEach(filePath => queue[templateName(filePath)] = {filePath});
    overrideFiles.forEach(filePath => queue[templateName(filePath)] = {filePath});
    const names = Object.keys(queue);
    const templates = await Promise.all(names.map(name => fsp.readFile(queue[name].filePath)));
    templates.forEach((template, i) => {
      cache[names[i]] = template.toString();
    });
    return cache;
  }
})();


/**
 * Replaces {@link ...} with `[...](...)`.
 * @private
 * @param {string} str - string to process
 * @param {Object} targets - map of targets to use for links (optional)
 * @return {string}
 */
function replaceLink(str, targets) {
  return str.replace(/\{@link\s+([^}]+)\}/g, function(full, link) {
    if (link in targets) {
      return util.format('[%s](%s)', link, targets[link]);
    } else if (link.match(/^(https?:)?\/\//)) {
      return util.format('[%s](%s)', link, link);
    }
    return link;
  });
}


/**
 * Processes a tag for Markdown replacements.
 * @private
 * @param {Object} tag - tag to process
 * @param {Object} targets - map of targets to use for links (optional)
 */
function processTag(tag, targets) {
  if (tag.description) {
    tag.description = replaceLink(tag.description, targets);
  }
  if (tag.params) {
    tag.params.forEach(function (param) {
      if (param.description) {
        param.description = replaceLink(param.description, targets);
      }
    });
  }
  if (tag.members) {
    tag.members.forEach(function (member) {
      processTag(member, targets);
    });
  }
  if (tag.methods) {
    tag.methods.forEach(function (method) {
      processTag(method, targets);
    });
  }
}


/**
 * Renders markdown from the given analyzed AST
 * @name generateMD
 * @async
 * @param  {Object} ast - output from analyze()
 * @param  {String} templateDir - templates directory (optional)
 * @return {String} Markdown output
 */
module.exports = async function generateMD(ast, templateDir, isIndex, sort) {
  if (!ast) { throw new Error('no analyzed ast to generate markdown from'); }
  const templates = await loadTemplates(templateDir);

  var tags = (ast.modules || [])
    .concat(ast.classes || [])
    .concat(ast.functions || []);
  var targets = {};
  tags.forEach(function (tag) {
    if (tag.longname) {
      tag.target = targets[tag.longname] = '#' + tag.longname.toLowerCase();
    }
  });

  //if ast is an index file, we need to sort the contents and to use the right templates;
  if (isIndex) {
    var sortFn;
    if (sort === 'none') {
      sortFn = null;
    } else if (sort === 'namespace') {
      sortFn = function(a, b) {
        var namespaceA = a.longname.split('.').slice(0, -1);
        var namespaceB = b.longname.split('.').slice(0, -1);
        if (namespaceA < namespaceB) {
          return -1;
        }
        if (namespaceA > namespaceB) {
          return 1;
        }
        return a.name < b.name ? -1 : 1;
      };
    } else {
      sortFn = function(a, b) {
        return a.name < b.name ? -1 : 1;
      };
    }
    if (sortFn !== null) {
      ast.classes.sort(sortFn);
      ast.functions.sort(sortFn);
    }
    return Mustache.render(templates.index, ast, templates);
  }

  tags.forEach(function (tag) {
    processTag(tag, targets);
  });

  return Mustache.render(templates.file, ast, templates);
};
