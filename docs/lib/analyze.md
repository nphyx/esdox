# File `analyze.js`

**Modules**
* [Global](#module-Global)






 **Author**





# Module Global


* [Functions](#functions)
* [exports](#exports-ast-opts-x21e8-Object-)
* [setPipedTypesString](#setPipedTypesString-node-x21e8-)



## Functions
* [exports](#exports-ast-opts-x21e8-Object-)
* [setPipedTypesString](#setPipedTypesString-node-x21e8-)

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
### setPipedTypesString(node)  &#x21e8; 

Attaches a 'typesString' pipe-separated attribute containing the node's types



**Parameters**

| name | type | description |
|------|------|-------------|
| **node** | `AST` | May or may not contain a type attribute |


---


