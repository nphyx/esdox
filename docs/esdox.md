# File `esdox.js`

**Modules**
* [Global](#module-Global)






 **Author**





# Module Global


* [Functions](#functions)
* [collectIndexData](#collectIndexData-accumulator-accumulator.functions-accumulator.classes-data-opts-x21e8-Object-)
* [generate](#generate-opts-x21e8-Promise-)
* [createDirectoryRecursive](#createDirectoryRecursive-dir-x21e8-)
* [main](#main-opts-opts.input-opts.output-opts.templateDir-opts.index-sort-opts.indexName-opts.recursive-opts.respect-recursive-opts.index-x21e8-Promise-)



## Functions
* [collectIndexData](#collectIndexData-accumulator-accumulator.functions-accumulator.classes-data-opts-x21e8-Object-)
* [generate](#generate-opts-x21e8-Promise-)
* [createDirectoryRecursive](#createDirectoryRecursive-dir-x21e8-)
* [main](#main-opts-opts.input-opts.output-opts.templateDir-opts.index-sort-opts.indexName-opts.recursive-opts.respect-recursive-opts.index-x21e8-Promise-)

### collectIndexData(accumulator, data, opts)  &#x21e8; `Object`

Collects items that should end up in the file index from a single file's analyzed data. Meant to be used with Array.reduce.



**Returns:** accumulator.

**Parameters**

| name | type | description |
|------|------|-------------|
| **accumulator** | `Object` | object for collecting accumulated data across multiple files |
| **accumulator.functions** | `Array` | functions that should appear in the index |
| **accumulator.classes** | `Array` | classes that should appear in the index |
| **data** | `Object` | analyzed data |
| **opts** | `Object` | options passed to the [esdox](#esdox) function |


---
### generate(opts)  &#x21e8; `Promise`

Process files in opts according to specified options.




**Parameters**

| name | type | description |
|------|------|-------------|
| **opts** | `Object` | [see main opts](#main) |


---
### createDirectoryRecursive(dir)  &#x21e8; 

Recursively creates directories for an output file.



**Parameters**

| name | type | description |
|------|------|-------------|
| **dir** | `String` | directory to create |


---
### main(opts)  &#x21e8; `Promise`

Main function handles parsed CLI input from bin/esdox or a passed options object.




**Parameters**

| name | type | description |
|------|------|-------------|
| **opts** | `Object` | configuration object |
| **opts.input** | `String ❘ Array` | input file or directory |
| **opts.output** | `String` | output directory |
| ***opts.templateDir*** | `String` | directory for custom mustache templates |
| ***opts.index-sort*** | `String` | sort index entries by name ("standard"), namespace ("namespace"), or not at all ("none") |
| ***opts.indexName*** | `String` | name for generated index file |
| ***opts.recursive*** | `Boolean` | generate documentation for subdirectories |
| ***opts.respect-recursive*** | `Boolean` | generate documentation for subdirectories, keeping directory structure in output files |
| ***opts.index*** | `Boolean` | generate an index file |


---


