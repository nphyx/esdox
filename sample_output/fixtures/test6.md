# File `fixtures/test6.js`
**Overview:** This sample handles namespaces, interfaces, and links.



 **Author**

**License:** MIT 



* Modules 
- Module main
- Module util



# Module main
The top-level namespace.


* [Functions](#functions)
 - [init](#init)
 - [dispose](#dispose)
* [Classes](#classes)
 - [Thing](#class-Thing)
 - [Worker](#class-Worker)



## Functions
* [init](#init)
* [dispose](#dispose)

### init()  &#x21e8; 

Initializes everything.






---
### dispose()  &#x21e8; 

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

### do(thing)  &#x21e8; 

Have a Worker do some Thing.  See [main.Thing](#main.thing).



**Parameters**

| name | type | description |
|------|------|-------------|
| **thing** | `main.Thing` | The Thing to do.  See [main.Thing](#main.thing). |


---

# Module util
Namespace for utility functions.


* [Functions](#functions)
 - [foo](#foo)
 - [bar](#bar)



## Functions
* [foo](#foo)
* [bar](#bar)

### foo()  &#x21e8; 

Run the Foo utility.






---
### bar()  &#x21e8; 

Run the Bar utility.






---



