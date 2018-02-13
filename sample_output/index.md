Modules
=======


Functions
=========

### bar()  &#x21e8; 

Run the Bar utility.






---



### bar()  &#x21e8; `Boolean ❘ null`

I so cool


**Deprecated:** Not a good function





---



### create(values)  &#x21e8; `Object`

Create a record



**Returns:** The created record.

**Parameters**

| name | type | description |
|------|------|-------------|
| **values** | `Object` | An object holding the initial values of the record's fields |


---



### dispose()  &#x21e8; 

Disposes everything.






---



### exported(param)  &#x21e8; 

exported with dot notation



**Parameters**

| name | type | description |
|------|------|-------------|
| **param** | `String` | the parameter |


---



### foo()  &#x21e8; 

Run the Foo utility.






---



### func1(a, b)  &#x21e8; `Number`

Return the sum of two numbers.



**Returns:** the result.

**Parameters**

| name | type | description |
|------|------|-------------|
| **a** | `Number` | the first param |
| **b** | `Number` | the second param |


---



### func1(a, b)  &#x21e8; 




**Returns:** the result.

**Parameters**

| name | type | description |
|------|------|-------------|
| **a** |  | the first param |
| **b** |  | the second param |


---



### func1(a, b)  &#x21e8; `String`




**Returns:** the result.

**Parameters**

| name | type | description |
|------|------|-------------|
| **a** | `String` | the first param |
| **b** | `String` | the second param |


---



### func2(c, d)  &#x21e8; 




**Parameters**

| name | type | description |
|------|------|-------------|
| **c** |  | the first param |
| **d** |  | the second param @ returns the other result |


---



### func2(c, d)  &#x21e8; 




**Returns:** the other result.

**Parameters**

| name | type | description |
|------|------|-------------|
| **c** |  | the first param |
| **d** |  | the second param |


---



### globalFunction(param)  &#x21e8; 

global function



**Parameters**

| name | type | description |
|------|------|-------------|
| **param** | `String` | the parameter |


---



### init()  &#x21e8; 

Read global config from database






---



### init()  &#x21e8; 

Initializes everything.






---



### notAnInternalFunction(file, optional)  &#x21e8; 

This is a test function   with a description on multiple lines



**Parameters**

| name | type | description |
|------|------|-------------|
| **file** | `String` | filename to parse |
| ***optional*** | `Boolean` | Changes behavior |


---



### optionsFunction(file, options)  &#x21e8; 

This is a test function   with a object that has attributes



**Parameters**

| name | type | description |
|------|------|-------------|
| **file** | `String` | filename to parse |
| ***options*** | `Object` | Changes behavior |
| **options.enableOption1** | `Boolean` | should option1 be enabled |
| **options.enableOption2** | `Boolean` | should option2 be enabled |


---



### remove()  &#x21e8; 

Remove a record






---



### testAnon2()  &#x21e8; `String`

second function without name



**Returns:** the result.




---



### testAnonynous()  &#x21e8; `String`

function without name



**Returns:** the result.




---



### testDeprecated()  &#x21e8; 

This is a deprecated function.


**Deprecated:** Because I said so




---



### testNamed(file, optional)  &#x21e8; 

This is a test function   with a description on multiple lines



**Parameters**

| name | type | description |
|------|------|-------------|
| **file** | `String ❘ null` | filename to parse                        this parsing thing is funny business |
| ***optional*** | `Boolean ❘ null` | Changes behavior |

**Fires**: [`foo#one_thing`](module:foo#event:one_thing) [`foo#another`](module:foo#event:another) [`foo#booyah`](module:foo#event:booyah) 

---





Classes
=======

## Class: Ketch

Provides chainable functions to easily build and execute a command.

***
### Members

| name | type | description |
|------|------|-------------|
| **last_err** | `String` | Last error, if present |
| **cmd** | `Array` | Internal array representation of this command. |
***



## Class: SampleClass

This is a class

***

### Methods
 - [func1](#func1)
 - [testAnonynous](#testAnonynous)
 - [testNamed](#testNamed)

### func1(a, b)  &#x21e8; 

A method in the class

**Example**:
func1(1, 2)


**Returns:** the result.

**Parameters**

| name | type | description |
|------|------|-------------|
| **a** |  | the first param |
| **b** |  | the second param |


---
### testAnonynous()  &#x21e8; `String`

function without name



**Returns:** the result.




---
### testNamed(file, optional)  &#x21e8; 

This is a test method     with a description on multiple lines



**Parameters**

| name | type | description |
|------|------|-------------|
| **file** | `String ❘ null` | filename to parse                          this parsing thing is funny business |
| ***optional*** | `Boolean ❘ null` | Changes behavior |

**Fires**: [`foo#one_thing`](module:foo#event:one_thing) [`foo#another`](module:foo#event:another) [`foo#booyah`](module:foo#event:booyah) 

---

## Class: Test

Test class.

***
### Members

| name | type | description |
|------|------|-------------|
| **a** | `*` | First member. |
| **b** | `*` | Second member. |
***



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

