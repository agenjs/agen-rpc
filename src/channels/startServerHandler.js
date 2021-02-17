import { compose, interrupt } from '@agen/utils';
import emitMessages from './emitMessages.js';
import newMultiplexer from './newMultiplexer.js';
import recieveMessages from './recieveMessages.js';
import readAll from './readAll.js';

// Returns a method recieving messages from the given channel, transforming them 
// to a request stream and calling methods.
export default function startServerHandler({ channel, getMethod, unhandled }) {
  const multiplexer = newMultiplexer({ channel, unhandled });
  const handler = async ({ callId, packageName, serviceName, methodName }) => {
    const callChannel = multiplexer(callId);
    let promise, stop = false;
    try {
      callChannel.on('done', () => stop = true);
      const method = getMethod({ packageName, serviceName, methodName });
      const request = recieveMessages(callChannel);
      const response = method(request);
      promise = readAll(compose( // eslint-disable-line no-unused-vars
        interrupt(() => stop),
        emitMessages(callChannel)
      )(response));
    } catch (error) {
      callChannel.emit('error', error);
    } finally {
      await promise; 
      callChannel.close();
    }
  };
  channel.on('init', handler);
  return () => channel.off('init', handler);
}
