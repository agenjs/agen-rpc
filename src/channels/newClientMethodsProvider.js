import newInputOutput from './newInputOutput.js';

export default function newClientMethodsProvider({ channel, newCallId, unhandled, }) {
  const [newReader, newWriter] = newInputOutput(channel, unhandled);
  return ({ packageName, serviceName, methodName, ...options }) => async function* (request) {
    let writePromise, callId;
    try {
      callId = newCallId();
      await channel.call('init', { callId, packageName, serviceName, methodName, options });
      writePromise = newWriter(callId, request);
      yield* newReader(callId);
    } finally {
      await channel.call('done', { callId });
      await writePromise;
    }
  };
}