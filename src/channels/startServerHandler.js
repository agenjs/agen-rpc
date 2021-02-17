import { interrupt } from '@agen/utils';
import newInputOutput from './newInputOutput.js';
import newMessagesIterator from './newMessagesIterator.js';

export default async function startServerHandler({ channel, getMethod, unhandled }) {
  let channelClosed = false;
  const [newReader, newWriter] = newInputOutput(channel, unhandled);
  const notifications = {};
  // Listen for the "done" event sent by the client part to finish the call.
  // So the server-side part should stop to send data.
  const reg = channel.handle('done', (options = {}) => {
    const f = notifications[options.callId];
    f && f();
    return { code: 200 };
  })

  async function handleCall({ callId, packageName, serviceName, methodName }) {
    try {
      let stop = false;
      notifications[callId] = () => stop = true;
      const method = getMethod({ packageName, serviceName, methodName });
      const request = newReader(callId);
      const f = interrupt(() => channelClosed || stop);
      const response = f(method(request));
      await newWriter(callId, response);
    } finally {
      delete notifications[callId];
    }
  }
  try {
    for await (let callInfo of newMessagesIterator(channel, 'init')) {
      handleCall(callInfo);
    }
  } finally {
    channelClosed = true;
    Object.values(notifications).forEach(r => r && r());
    reg();
  }
}