import { interrupt } from '@agen/utils';
import newInputOutput from './newInputOutput.js';

export default function startServerHandler({ channel, getMethod, unhandled }) {
  let channelClosed = false;
  const [newReader, newWriter] = newInputOutput(channel, unhandled);
  const notifications = {};

  const regs = [
    channel.handle('disconnect', () => {
      channelClosed = true;
      return {};
    }),
    channel.handle('init', (callInfo) => {
      if (channelClosed) return ;
      handleCall(callInfo);
      return {};
    }),
    // Listen for the "done" event sent by the client part to finish the call.
    // So the server-side part should stop to send data.
    channel.handle('done', (options = {}) => {
      const f = notifications[options.callId];
      f && f();
      return { code: 200 };
    }),
  ]

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
  return () => {
    channelClosed = true;
    Object.values(notifications).forEach(r => r && r());
    regs.forEach(r => r && r());
  }
}