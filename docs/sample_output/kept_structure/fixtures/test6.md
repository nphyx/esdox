# File `test6.js`


**Overview:** This sample handles namespaces, interfaces, and links.



 

**License:** MIT 



The top-level namespace.

**[Functions](#functions)**
* [init](#init-x21e8-undefined-)
* [dispose](#dispose-x21e8-undefined-)

**[Classes](#classes)**
* [Thing](#class-Thing)
* [Worker](#class-Worker)


## Functions
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
Definition for a Thing object used by a Worker.  See {@link main.Worker}.
***
### Members

| name | type | description |
|------|------|-------------|
| **name** |  | Every Thing has a name. |
| **data** |  | Every Thing might have some data. |
***

## Class: Worker
Definition for a Worker. See {@link https://developer.mozilla.org/en-US/docs/Web/API/Worker}
***

### Methods
* [do](#do-thing-x21e8-undefined-)
***
### do(thing)  &#x21e8; `undefined`
Have a Worker do some Thing.  See {@link main.Thing}.



**Parameters**

| name | type | description |
|------|------|-------------|
| **thing** | `main.Thing` | The Thing to do.  See {@link main.Thing}. |




---
