import tape from "tape-await";
import { newServer, newClient } from '../src/index.js';
import { protobuf } from '../dist/agen-rpc-esm.js';
import EchoService from './service.js';
import EchoServiceServiceSchema from './service.schema.js';
import newChannel from './newChannel.js';

tape(`newMultiplexer - socket.io-like server-side communication`, async (t) => {

  const service = { test: { EchoService } };
  const { descriptors, serd } = protobuf.parseProtobufSchema(EchoServiceServiceSchema);
  let unhandled = {
    client : [],
    server : []
  };
  const onServerUnhandledMessages = (msg) => unhandled.server.push(msg);
  const onClientUnhandledMessages = (msg) => unhandled.client.push(msg);

  // --------------------------
  // Step 1: Implementing the server-side part.
  // The server stub recieves notifications by the server-side channel, 
  // and re-directs them to a real method implementation.
  // Data are loaded from the channel by subscribing on specific events 
  // and responses are send back using the emit channel method.
  const serverHandler = newServer({ service, serd, descriptors, unhandled : onServerUnhandledMessages })
  const serverChannel = newChannel();
  const stop = serverHandler(serverChannel);

  // ---------------------------------
  // Step 2: Implementing the client-side part.
  // This code sends request messages and recieves replies via a dedicated channel.
  let idCounter = 0;
  const newCallId = () => idCounter++;
  const clientHandler = newClient({ serd, descriptors, newCallId, unhandled: onClientUnhandledMessages, })

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

  let responses = [];
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
  t.deepEqual(unhandled, {
    client: [],
    server : []
  });

  responses = [];
  unhandled = { client: [], server: [] };
  for await (let response of clientStub.test.EchoService.generateMessages({ count : 10000 })) {
    responses.push(response);
    if (responses.length === 7) break;
  }
  await clientChannel.call('disconnect');
  
  await new Promise(r => setTimeout(r, 10));
  t.deepEqual(responses, [
    { idx: 0, message: 'Message 0' },
    { idx: 1, message: 'Message 1' },
    { idx: 2, message: 'Message 2' },
    { idx: 3, message: 'Message 3' },
    { idx: 4, message: 'Message 4' },
    { idx: 5, message: 'Message 5' },
    { idx: 6, message: 'Message 6' }
  ]);
  const decoder = new TextDecoder();

})


