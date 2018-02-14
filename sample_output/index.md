# @nphyx/esdox 0.2.1

Clean, simple JSDoc -&gt; Github Markdown generator with support for ES6+.

**Author**: Justen Robertson

**License**: MIT

# Navigation
**Modules**
* [base](#module-base)
 \(in [fixtures&#x2F;test5.md](fixtures&#x2F;test5.md)\)
* [main](#module-main)
 \(in [fixtures&#x2F;test6.md](fixtures&#x2F;test6.md)\)
* [util](#module-util)
 \(in [fixtures&#x2F;test6.md](fixtures&#x2F;test6.md)\)
* [foo](#module-foo)
 \(in [fixtures&#x2F;under&#x2F;test.md](fixtures&#x2F;under&#x2F;test.md)\)

**Classes**
* [Ketch](#class-Ketch)
 in [fixtures&#x2F;under&#x2F;test.md](fixtures&#x2F;under&#x2F;test.md)
* [SampleClass](#class-SampleClass)
 in [fixtures&#x2F;under&#x2F;test.md](fixtures&#x2F;under&#x2F;test.md)
* [Test](#class-Test)
 in [fixtures&#x2F;test7.md](fixtures&#x2F;test7.md)
* [Thing](#class-Thing)
 in [fixtures&#x2F;test6.md](fixtures&#x2F;test6.md)
* [Worker](#class-Worker)
 in [fixtures&#x2F;test6.md](fixtures&#x2F;test6.md)

**Functions**
* [bar](#bar-x21e8-Boolean ❘ null-)
 in [fixtures&#x2F;under&#x2F;test.md](fixtures&#x2F;under&#x2F;test.md)
* [create](#create-values-x21e8-Object-)
 in [fixtures&#x2F;test3.md](fixtures&#x2F;test3.md)
* [exported](#exported-param-x21e8-undefined-)
 in [fixtures&#x2F;test2.md](fixtures&#x2F;test2.md)
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
* [remove](#remove-x21e8-undefined-)
 in [fixtures&#x2F;test3.md](fixtures&#x2F;test3.md)
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
## Module util
Namespace for utility functions.

**Functions**
* [foo](#foo-x21e8-undefined-)
* [bar](#bar-x21e8-undefined-)
***
## Module foo
Can I get some description please   on more than one line, if possible.

**Functions**
* [testAnonynous](#testAnonynous-x21e8-String-)
* [testAnon2](#testAnon2-x21e8-String-)
* [func1](#func1-a-b-x21e8-)
* [func2](#func2-c-d-x21e8-)
* [testDeprecated](#testDeprecated-x21e8-undefined-)

**Classes**
* [Ketch](#class-Ketch)
* [SampleClass](#class-SampleClass)
***

# Classes
## Class: Ketch
Provides chainable functions to easily build and execute a command.
### Members

| name | type | description |
|------|------|-------------|
| **last_err** | `String` | Last error, if present |
| **cmd** | `Array` | Internal array representation of this command. |

***
## Class: SampleClass
This is a class

### Methods
**func1(a, b)  &#x21e8; **

**testAnonynous()  &#x21e8; `String`**

**testNamed(file, optional)  &#x21e8; `undefined`**

***
## Class: Test
Test class.
### Members

| name | type | description |
|------|------|-------------|
| **a** | `*` | First member. |
| **b** | `*` | Second member. |

***
## Class: Thing
Definition for a Thing object used by a Worker.  See [main.Worker](#main.worker).
### Members

| name | type | description |
|------|------|-------------|
| **name** | `string` | Every Thing has a name. |
| **data** | `* ❘ undefined` | Every Thing might have some data. |

***
## Class: Worker
Definition for a Worker. See [https://developer.mozilla.org/en-US/docs/Web/API/Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker)

### Methods
**do(thing)  &#x21e8; `undefined`**

***

# Functions
**bar()  &#x21e8; `Boolean ❘ null`**

**create(values)  &#x21e8; `Object`**

**exported(param)  &#x21e8; `undefined`**

**func1(a, b)  &#x21e8; `Number`**

**func1(a, b)  &#x21e8; `String`**

**func2(c, d)  &#x21e8; `undefined`**

**globalFunction(param)  &#x21e8; `undefined`**

**notAnInternalFunction(file, optional)  &#x21e8; `undefined`**

**optionsFunction(file, options)  &#x21e8; `undefined`**

**remove()  &#x21e8; `undefined`**

**testNamed(file, optional)  &#x21e8; `undefined`**

