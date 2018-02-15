# File `esdox.js`






 





Contains the main esdox module.

**[Functions](#functions)**
* [main](#main-opts-opts.input-opts.index-opts.indexName-opts.indexSort-opts.keepFs-opts.output-opts.private-opts.recursive-opts.templates-x21e8-Promise-)


## Functions
### main(opts)  &#x21e8; `Promise`
Main function handles parsed CLI input from bin/esdox or a passed
options object.





**Parameters**

| name | type | default | description |
|------|------|---------|-------------|
| **opts** | `Object` |  | configuration object |
| **opts.input** | `String ❘ Array` |  | input file or directory |
| ***opts.index*** | `Boolean` |  | generate an index file |
| ***opts.indexName*** | `String` | `index.md` | name for generated index file |
| ***opts.indexSort*** | `String` | `standard` | sort index entries by name ("standard"), namespace ("namespace"), or not at all ("none") |
| ***opts.keepFs*** | `Boolean` |  | generate documentation for subdirectories of opts.input, keeping directory structure in output files |
| ***opts.output*** | `String` | `esdox_output` | output directory |
| ***opts.private*** | `String` |  | include @private/@internal in docs |
| ***opts.recursive*** | `Boolean` |  | include subdirectories of opts.input |
| ***opts.templates*** | `String` |  | directory for custom mustache templates |



---


