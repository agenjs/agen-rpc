import emitMessages from './emitMessages.js';
import newMultiplexer from './newMultiplexer.js';
import recieveMessages from './recieveMessages.js';

// Returns a method recieving messages from the given channel, transforming them 
// to a request stream and calling methods.
export default function startServerHandler({
  channel,
  getMethod,
  messageKey = 'call:message',
  initKey = 'call:init',
}) {
  const multiplexer = newMultiplexer(channel, messageKey);
  const handler = async ({ callId, packageName, serviceName, methodName }) => {
    const callChannel = multiplexer(callId);
    try {
      const method = getMethod({ packageName, serviceName, methodName });
      const request = recieveMessages(callChannel, `request`);
      let it = method(request);
      await emitMessages(callChannel, `response`, it);
    } catch (error) {
      callChannel.emit(`error`, error);
    } finally {
      callChannel.close();
    }
  };
  channel.on(initKey, handler);
  return () => channel.off(initKey, handler);
}
