
# Module main

* [Description &amp; Usage](#description)

* [Functions](#functions)
 - [init](#init)
 - [dispose](#dispose)

* [Classes](#classes)
 - [Thing](#class-Thing)
 - [Worker](#class-Worker)

## Description
The top-level namespace.




## Functions
## init
### init()  &#x21e8; 

Initializes everything.






---
## Functions
## dispose
### dispose()  &#x21e8; 

Disposes everything.






---

## Classes
## Class: Thing
Definition for a Thing object used by a Worker.  See [main.Worker](#main.worker).

**name**: `string` , Every Thing has a name.
**data**: `* ❘ undefined` , Every Thing might have some data.
## Classes
## Class: Worker
Definition for a Worker. See [https://developer.mozilla.org/en-US/docs/Web/API/Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker)

## do
### do(thing)  &#x21e8; 

Have a Worker do some Thing.  See [main.Thing](#main.thing).



**Parameters**

| name | type | description |
|------|------|-------------|
| **thing** | `main.Thing` | The Thing to do.  See [main.Thing](#main.thing). |


---

# Module util

* [Description &amp; Usage](#description)

* [Functions](#functions)
 - [foo](#foo)
 - [bar](#bar)


## Description
Namespace for utility functions.




## Functions
## foo
### foo()  &#x21e8; 

Run the Foo utility.






---
## Functions
## bar
### bar()  &#x21e8; 

Run the Bar utility.






---



**Overview:** This sample handles namespaces, interfaces, and links.

 **Author**

**License:** MIT 


