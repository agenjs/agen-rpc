import emitMessages from './emitMessages.js';
import newMultiplexer from './newMultiplexer.js';
import recieveMessages from './recieveMessages.js';

// Returns a method providing client-side part transforming client calls to a sequence of 
// events on the channel.

export default function newClientMethodsProvider({
  channel,
  newCallId,
  messageKey = 'call:message',
  initKey = 'call:init',
}) {
  const multiplexer = newMultiplexer(channel, messageKey);
  return ({ packageName, serviceName, methodName }) => async function* (request) {
    const callId = newCallId();
    const callChannel = multiplexer(callId);
    try {
      channel.emit(initKey, { callId, packageName, serviceName, methodName });
      const response = recieveMessages(callChannel, `response`);
      emitMessages(callChannel, `request`, request);
      yield* response;
    } finally {
      callChannel.close();
    }
  };
}
