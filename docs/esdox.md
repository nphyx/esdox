# File `esdox.js`




 **Author**





* Modules 
- Module Global



# Module Global


* [Functions](#functions)
 - [collectIndexData](#collectIndexData)
 - [generate](#generate)
 - [createDirectoryRecursive](#createDirectoryRecursive)
 - [main](#main)



## Functions
* [collectIndexData](#collectIndexData)
* [generate](#generate)
* [createDirectoryRecursive](#createDirectoryRecursive)
* [main](#main)

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



