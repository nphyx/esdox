# @nphyx/esdox 0.3.0

Clean, simple JSDoc -&gt; Github Markdown generator with support for ES6+.

**Author**: Justen Robertson

**License**: MIT

# Navigation
**Modules**
* [base](#module-base)
 \(in [fixtures&#x2F;test5.md](fixtures&#x2F;test5.md)\)
* [main](#module-main)
 \(in [fixtures&#x2F;test6.md](fixtures&#x2F;test6.md)\)
* [foo](#module-foo)
 \(in [fixtures&#x2F;under&#x2F;test.md](fixtures&#x2F;under&#x2F;test.md)\)

**Classes**
* [Test](#class-Test)
 in [fixtures&#x2F;test7.md](fixtures&#x2F;test7.md)

**Functions**
* [create](#create-values-x21e8-Object-)
 in [fixtures&#x2F;test3.md](fixtures&#x2F;test3.md)
* [exported](#exported-param-x21e8-undefined-)
 in [fixtures&#x2F;test2.md](fixtures&#x2F;test2.md)
* [exports.Object#remove](#exports.Object#remove-x21e8-undefined-)
 in [fixtures&#x2F;test3.md](fixtures&#x2F;test3.md)
* [func1](#func1-a-b-x21e8-Number-)
 in [fixtures&#x2F;under_grandparent&#x2F;under_parent&#x2F;test.md](fixtures&#x2F;under_grandparent&#x2F;under_parent&#x2F;test.md)
* [func1](#func1-a-b-x21e8-String-)
 in [fixtures&#x2F;test2.md](fixtures&#x2F;test2.md)
* [func2](#func2-c-d-x21e8-undefined-)
 in [fixtures&#x2F;test2.md](fixtures&#x2F;test2.md)
* [globalFunction](#globalFunction-param-x21e8-undefined-)
 in [fixtures&#x2F;test2.md](fixtures&#x2F;test2.md)
* [notAnInternalFunction](#notAnInternalFunction-file-optional-x21e8-undefined-)
 in [fixtures&#x2F;test4.md](fixtures&#x2F;test4.md)
* [optionsFunction](#optionsFunction-file-options-options.enableOption1-options.enableOption2-options.default-x21e8-undefined-)
 in [fixtures&#x2F;test8.md](fixtures&#x2F;test8.md)
* [testNamed](#testNamed-file-optional-x21e8-undefined-)
 in [fixtures&#x2F;under&#x2F;test.md](fixtures&#x2F;under&#x2F;test.md)

# Modules
## Module base
init system configuration

**Functions**
* [init](#init-x21e8-undefined-)
***
## Module main
The top-level namespace.

**Functions**
* [init](#init-x21e8-undefined-)
* [dispose](#dispose-x21e8-undefined-)

**Classes**
* [Thing](#class-Thing)
* [Worker](#class-Worker)
***
## Module foo
Can I get some description please
  on more than one line, if possible.

**Functions**
* [testAnonynous](#testAnonynous-x21e8-String-)
* [testAnon2](#testAnon2-x21e8-String-)
* [func1](#func1-a-b-x21e8-)
* [func2](#func2-c-d-x21e8-)
* [testDeprecated](#testDeprecated-x21e8-undefined-)
* [testAnonynous](#testAnonynous-x21e8-String-)

**Classes**
* [Ketch](#class-Ketch)
* [SampleClass](#class-SampleClass)
***

# Classes
## Class: Test
Test class.
### Members

| name | type | description |
|------|------|-------------|
| **a** |  | First member. |
| **c** |  | Third member is incorrectly documented but explicitly assigned. |

***

# Functions
**create(values)  &#x21e8; `Object`**

**exported(param)  &#x21e8; `undefined`**

**exports.Object#remove()  &#x21e8; `undefined`**

**func1(a, b)  &#x21e8; `Number`**

**func1(a, b)  &#x21e8; `String`**

**func2(c, d)  &#x21e8; `undefined`**

**globalFunction(param)  &#x21e8; `undefined`**

**notAnInternalFunction(file, optional)  &#x21e8; `undefined`**

**optionsFunction(file, options)  &#x21e8; `undefined`**

**testNamed(file, optional)  &#x21e8; `undefined`**
