import { compose, interrupt } from '@agen/utils';
import emitMessages from './emitMessages.js';
import newMultiplexer from './newMultiplexer.js';
import recieveMessages from './recieveMessages.js';
import readAll from './readAll.js';

// Returns a method providing client-side part transforming client calls to a sequence of 
// events on the channel.

export default function newClientMethodsProvider({ channel, newCallId, unhandled }) {
  const multiplexer = newMultiplexer({ channel, unhandled });
  return ({ packageName, serviceName, methodName }) => async function* (request) {
    const callId = newCallId();
    const callChannel = multiplexer(callId);
    let stop = false, promise;
    try {
      channel.emit('init', { callId, packageName, serviceName, methodName });
      promise = readAll(compose(
        interrupt(() => stop),
        emitMessages(callChannel),
      )(request));
      const response = recieveMessages(callChannel);
      yield* interrupt(() => stop)(response);
    } finally {
      stop = true;
      await promise;
      // callChannel.emit('done', { callId });
      callChannel.close();
    }
  };
}
