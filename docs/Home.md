Modules
=======


Functions
=========

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



### createDirectoryRecursive(dir)  &#x21e8; 

Recursively creates directories for an output file.



**Parameters**

| name | type | description |
|------|------|-------------|
| **dir** | `String` | directory to create |


---



### exports(ast, opts)  &#x21e8; `Object`

Copyright (c) 2012-2016 Sutoiku 
Transforms the AST into a form that represents a single file with modules and their functions.

**Example**:
{ functions:
   [ { name: 'testNamed',
       params: [ { name: 'file', type: 'String', value: 'filename to parse' } ],
       returns: '',
       version: '',
       description: 'This is a test function\nwith a description on multiple lines' },
     { name: 'testAnonynous',
       params: [],
       returns: 'the result',
       version: '',
       description: 'function without name',
       type: 'String' } ],
  methods: [],
  classes: [],
  modules:
   [ { name: 'test_module',
       functions:
        [ { name: 'testAnonynous',
            params: [],
            returns: 'the result',
            version: '',
            description: 'function without name',
            type: 'String' } ],
       classes: [],
       description: '' } ],
  global_functions:
   [ { name: 'testNamed',
       params: [ { name: 'file', type: 'String', value: 'filename to parse' } ],
       returns: '',
       version: '',
       description: 'This is a test function\nwith a description on multiple lines' } ],
  description: 'Some extra text\nSome more extra text',
  overview: 'This is the overview',
  copyright: '2012 Blah Blah Blah',
  license: 'MIT',
  author: 'Joe Schmo',
  version: ''
}



**Parameters**

| name | type | description |
|------|------|-------------|
| **ast** | `Object` |  |
| **opts** | `Object` | Command-line args |


---



### generate(opts)  &#x21e8; `Promise`

Process files in opts according to specified options.




**Parameters**

| name | type | description |
|------|------|-------------|
| **opts** | `Object` | [see main opts](#main) |


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



### setPipedTypesString(node)  &#x21e8; 

Attaches a 'typesString' pipe-separated attribute containing the node's types



**Parameters**

| name | type | description |
|------|------|-------------|
| **node** | `AST` | May or may not contain a type attribute |


---





Classes
=======

