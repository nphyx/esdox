# File `lib/generateMD.js`




 **Author**





* Modules 
- Module Global



# Module Global


* [Functions](#functions)
 - [replaceLink](#replaceLink)
 - [processTag](#processTag)
 - [exports](#exports)



## Functions
* [replaceLink](#replaceLink)
* [processTag](#processTag)
* [exports](#exports)

### replaceLink(str, targets)  &#x21e8; `string`

Replaces ... with `[...](...)`.




**Parameters**

| name | type | description |
|------|------|-------------|
| **str** | `string` | string to process |
| **targets** | `Object` | map of targets to use for links (optional) |


---
### processTag(tag, targets)  &#x21e8; 

Processes a tag for Markdown replacements.



**Parameters**

| name | type | description |
|------|------|-------------|
| **tag** | `Object` | tag to process |
| **targets** | `Object` | map of targets to use for links (optional) |


---
### exports(ast, templateDir)  &#x21e8; `String`

Renders markdown from the given analyzed AST



**Returns:** Markdown output.

**Parameters**

| name | type | description |
|------|------|-------------|
| **ast** | `Object` | output from analyze() |
| **templateDir** | `String` | templates directory (optional) |


---



