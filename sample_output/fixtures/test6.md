# File `test6.js`

**Modules**
* [main](#module-main)
* [util](#module-util)


**Overview:** This sample handles namespaces, interfaces, and links.



 **Author**

**License:** MIT 



# Module main
The top-level namespace.


* [Functions](#functions)
* [init](#init-x21e8-)
* [dispose](#dispose-x21e8-)
* [Classes](#classes)
* [Thing](#class-Thing)
* [Worker](#class-Worker)



## Functions
* [init](#init-x21e8-)
* [dispose](#dispose-x21e8-)

### init()  &#x21e8; `undefined`

Initializes everything.








---
### dispose()  &#x21e8; `undefined`

Disposes everything.








---

## Classes
* [Thing](#class-Thing)
* [Worker](#class-Worker)

## Class: Thing

Definition for a Thing object used by a Worker.  See [main.Worker](#main.worker).

***
### Members

| name | type | description |
|------|------|-------------|
| **name** | `string` | Every Thing has a name. |
| **data** | `* ❘ undefined` | Every Thing might have some data. |
***


## Class: Worker

Definition for a Worker. See [https://developer.mozilla.org/en-US/docs/Web/API/Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker)

***

### Methods
 - [do](#do)

### do(thing)  &#x21e8; `undefined`

Have a Worker do some Thing.  See [main.Thing](#main.thing).



**Parameters**
| name | type | description |
|------|------|-------------|
| **thing** | `main.Thing` | The Thing to do.  See [main.Thing](#main.thing). |




---
# Module util
Namespace for utility functions.


* [Functions](#functions)
* [foo](#foo-x21e8-)
* [bar](#bar-x21e8-)



## Functions
* [foo](#foo-x21e8-)
* [bar](#bar-x21e8-)

### foo()  &#x21e8; `undefined`

Run the Foo utility.








---
### bar()  &#x21e8; `undefined`

Run the Bar utility.








---


