import tape from "tape-await";
import { newClient, newServer, protobuf } from '../dist/agen-rpc-esm.js';
import EchoService from './service.js';
import EchoServiceServiceSchema from './service.schema.js';

tape(`service method invocation by "channels" sending/recieving individual messages`, async (t) => {

  // A fake "channel" implementation - for each part it provides three methods:
  // * emit - to send messages to the peer
  // * on - registers a listener for a specific even type
  // * off - remove registered listener
  function newChannel() {
    const reader = newEventEmitter();
    const writer = newEventEmitter();
    return {
      _reader: reader,
      _writer: writer,
      on: reader.on,
      off: reader.off,
      emit: writer.emit,
      connect: (channel) => {
        const list = [];
        list.push(channel._writer.on('*', reader.emit));
        list.push(writer.on('*', channel._reader.emit));
        return () => list.forEach(r => r()); // Unregister connection
      }
    }
    function newEventEmitter() {
      const index = {};
      function on(event, listener) {
        (index[event] = index[event] || []).push(listener);
        return () => off(event, listener);
      }
      function off(event, listener) {
        index[event] = (index[event] || []).filter(l => l !== listener);
      }
      function emit(event, ...args) {
        for (let l of (index['*'] || [])) { l(event, ...args); }
        for (let l of (index[event] || [])) { l(...args); }
      }
      return { on, off, emit };
    }
  }  

  const { descriptors, serd } = protobuf.parseProtobufSchema(EchoServiceServiceSchema);

  // Method description. On the server these descriptors are used to define
  // how the real code should be called by the generated stub.
  // The client uses them to automatically generate an object implementing
  // the API and re-directing real calls to the server. 
  const service = { test: { EchoService } };

  // --------------------------
  // Step 1: Implementing the server-side part.
  // The server stub recieves notifications by the server-side channel, 
  // and re-directs them to a real method implementation.
  // Data are loaded from the channel by subscribing on specific events 
  // and responses are send back using the emit channel method.
  const serverHandler = newServer({ service, serd, descriptors })

  // 
  const serverChannel = newChannel();
  const stop = serverHandler(serverChannel);

  // --------------------------
  // Step 2: Implementing the client-side part.
  // This code sends request messages and recieves replies via a dedicated channel.

  // Create a client-side channel:
  let idCounter = 0;
  const newCallId = () => `call-${Date.now()}-${idCounter++}`;
  const clientHandler = newClient({ newCallId, serd, descriptors });

  const clientChannel = newChannel();
  const clientStub = clientHandler(clientChannel);

  // --------------------------
  // Step 3: Connect client with the server.
  // Plug input from one channel to the output of the other and vice versa
  serverChannel.connect(clientChannel);

  // --------------------------
  // Now is everything ready to perform remote calls!

  const requests = ['Foo', 'Bar', 'Baz', 'Boo', 'Bea']
    .map((message, id) => ({ id, message, extraField: `${message} - ${id}` }));

  const responses = [];
  for await (let response of clientStub.test.EchoService.pingPong(requests)) {
    responses.push(response);
  }

  t.deepEqual(responses, [
    { "id": 0, "message": "Pong for Foo" },
    { "id": 1, "message": "Pong for Bar" },
    { "id": 2, "message": "Pong for Baz" },
    { "id": 3, "message": "Pong for Boo" },
    { "id": 4, "message": "Pong for Bea" },
  ]);
})

