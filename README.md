@agen/rpc
===========

Introduction
------------

This package contains an implementation of Remote Procedure Calls
on top of various transport layers such as socket.io, peerjs.com,
websockets, WebRTC, HTTP2/REST etc.

Features:
* Bi-directional asynchronious data streams
* Simple service implementation based on async generators
* Service definition using Protobuf schemas
* Optional Protobuf-based binary serialization/deserialization
* Automatic transparent creation of client and server stubs
* Easy pluggable transport layer - 3 methods to implement: 'on', 'off', 'emit'

See https://observablehq.com/d/15e7a8cb4a361293

Remote procedure calls can be defines like the following sequence of operations: 
```
-> [clientStub] --serializing--> [transport] -deserializing-> [serverStub] --+
                                                                             |
                                                                  [service execution]
                                                                             |
<- [clientStub] <-deserializing- [transport] <--serializing-- [serverStub] <-+
```
All client stubs, server stubs, all messages serialization/deserialization etc 
are performed by the library transparently for the user.

This library requires the following parameters:
* *Schema* defining services and data structures
* *Service implementation* - a simple JS object with async methods
* *Transport layer* - like socket.io, peerjs.com, websockets, HTTP2/REST etc. 

Schema
------

Schema for all service methods should have the following structure:
* *packageName* - name of the package containing individual services
* *serviceName* - name of the service regrouping multiple methods
* *methodName* - name of the callable method
* *requestType* - type name of request objects
* *requestStream* - this flag defines if the method request is an AsyncIterator or a simple object
* *responseType* - type name for response objects
* *responseStream* - if this method is an AsyncGenerator or it returns a single object

Protobuf schemas are parsed and transformed to this internal format. 
It is possible to manually create schemas objects. In this case protobuf schema parser is not required.

Service Implementation
-----------------------

Service implementation object should reflect the structure defined by the schema:

```
 packageName -> serviceName -> methodName
```

Example:
```javascript
{
  "test.package" : {                                // Name of the package

    "MyService" : {                                 // Name of the service

      async* sayHello(input) {                      // Service method.
        for await (let { name } of input) {
          yield { message : `Hello ${name}!` }
        }
      }

    }

  }
}

```

Each service method should correspond to the following simple constraints:
* It should accepts just one parameter: a single serializable request object 
  or an AsyncIterator over serializable objects
* It should return just one serializable object or it is an AsyncIterator over 
  serializable results

Method descriptors allow to transform JavaScript methods to universal format based on the following table:
<table>
<tr><th></th><th>requestStream</th><th>responseStream</th></tr>
<tr><td>\`async function(Object):Object\`</td><td>false</td><td>false</td></tr>
<tr><td>\`async function(AsyncIterator):Object\`</td><td>true</td><td>false</td></tr>
<tr><td>\`async function*(Object):AsyncIterator\`</td><td>false</td><td>true</td></tr>
<tr><td>\`async function*(AsyncIterator):AsyncIterator\`</td><td>true</td><td>true</td></tr>
</table>


This approach allows to wrap all service methods with functions of this type:
```javascript
async function*(iterator:AsyncIterator):AsyncIterator{ ... }

```

All service methods have to accept serializable objects (for simple calls)
or an async iterator (for input streams). As a result the service methods 
should return a serializable object or an async iterator returning 
serializable objects.

Possible signatures of service methods:
```javascript
// 1) input: single object; output: single object  (like REST methods)
async function( input : Object ) : Object { ... }

// 2) input: single object; output: stream of response objects
async function*( input : Object ) : AsyncIterator { ... }

// 3) input: stream of objects; output: single response object
async function( input : AsyncIterator ) : Object { ... }

// 4) input: stream of objects; output: stream of response objects
async function( input : AsyncIterator ) : AsyncIterator { ... }
```
