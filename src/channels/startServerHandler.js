import { interrupt } from '@agen/utils';
import newInputOutput from './newInputOutput.js';
import newMessagesIterator from './newMessagesIterator.js';

export default async function startServerHandler({ channel, getMethod, unhandled }) {
  let channelClosed = false;
  const [newReader, newWriter] = newInputOutput(channel, unhandled);
  async function handleCall({ callId, packageName, serviceName, methodName }) {
    const method = getMethod({ packageName, serviceName, methodName });
    const request = newReader(callId);
    // Listen for the "done" event sent by the client part to finish the call.
    // So the server-side part should stop to send data.
    let stop = false;
    channel.on('done', function onDone(options) {
      if (options.callId !== callId) return;
      channel.off('done', onDone);
      stop = true;
    })
    const f = interrupt(() => channelClosed || stop);

    const response = f(method(request));
    await newWriter(callId, response);
  }  
  try { 
    for await (let callInfo of newMessagesIterator(channel, 'init')) {
      handleCall(callInfo);
    }
  } finally {
    channelClosed = true;
  }
}