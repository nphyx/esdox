Modules
=======


Functions
=========

### main(opts)  &#x21e8; `Promise`

Main function handles parsed CLI input from bin/esdox or a passed options object.





**Parameters**

| name | type | default | description |
|------|------|---------|-------------|
| **opts** | `Object` |  | configuration object |
| **opts.input** | `String ❘ Array` |  | input file or directory |
| **opts.output** | `String` |  | output directory |
| ***opts.templateDir*** | `String` |  | directory for custom mustache templates |
| ***opts.index-sort*** | `String` | `standard` | sort index entries by name ("standard"), namespace ("namespace"), or not at all ("none") |
| ***opts.indexName*** | `String` | `index.md` | name for generated index file |
| ***opts.recursive*** | `Boolean` |  | generate documentation for subdirectories |
| ***opts.respect-recursive*** | `Boolean` |  | generate documentation for subdirectories, keeping directory structure in output files |
| ***opts.index*** | `Boolean` |  | generate an index file |



---





Classes
=======

