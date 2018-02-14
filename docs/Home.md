# @nphyx/esdox 0.3.0

Clean, simple JSDoc -&gt; Github Markdown generator with support for ES6+.

**Author**: Justen Robertson

**License**: MIT

# Navigation
**Modules**
* [main](#module-main)
 \(in [esdox.md](esdox.md)\)
* [analyze](#module-analyze)
 \(in [lib&#x2F;analyze.md](lib&#x2F;analyze.md)\)
* [generateMD](#module-generateMD)
 \(in [lib&#x2F;generateMD.md](lib&#x2F;generateMD.md)\)



# Modules
## Module main
Contains the main esdox module.

**Functions**
* [main](#main-opts-opts.input-opts.output-opts.templateDir-opts.index-sort-opts.indexName-opts.recursive-opts.respect-recursive-opts.index-x21e8-Promise-)
***
## Module analyze
Helper functions for analyzing JSDoc ASTs.

Handles sorting, adding extra metadata, string escaping / cleanup, and other
transforms of raw AST data for use by the mustache templates. These are all
used internally and marked as private, but exported for unit testing
purposes.
***
## Module generateMD
The generateMD function, plus various internal functions to manage the process.
***


