import tape from "tape-await";
import { protobuf, rpc } from '../src/index.js';
import EchoService from './service.js';
import EchoServiceServiceSchema from './service.schema.js';

tape(`client-server communication with protobuf serialization`, async (t) => {

  const timeout = 10; // Slowdown responses...
  const { descriptors, serd } = protobuf.parseProtobufSchema(EchoServiceServiceSchema);

  const requests = ['A', 'B', 'C', 'D', 'E']
    .map((message, id) => ({
      id,
      message,
      // This field is dropped when messages are serialized-deserialized 
      extraField: `${message} - ${id}`
    }));

  const service = { test: { EchoService } };
  const serverStub = rpc.newServerStub(serd, descriptors)(service);

  const newServerCaller = ({ packageName, serviceName, methodName }) => {
    const method = serverStub[packageName][serviceName][methodName];
    return async function* (request) {
      for await (let replyObject of method(request)) {
        yield replyObject;
        // Artificially slow down responses...
        await new Promise(r => setTimeout(r, timeout));
      }
    };
  }
  let serverCaller;
  serverCaller = newServerCaller;
  // // We can call the server stub directly, without going through the a network layer
  // serverCaller = rpc.getServiceMethod(serverStub);

  const clientStub = rpc.newClientStub(serd, descriptors)(serverCaller);

  const responses = [];
  for await (let response of clientStub.test.EchoService.pingPong(requests)) {
    responses.push(response);
  }

  t.deepEqual(responses, [
    { "id": 0, "message": "Pong for A" },
    { "id": 1, "message": "Pong for B" },
    { "id": 2, "message": "Pong for C" },
    { "id": 3, "message": "Pong for D" },
    { "id": 4, "message": "Pong for E" },
  ]);
})

