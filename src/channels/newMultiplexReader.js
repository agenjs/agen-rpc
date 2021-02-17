import { iterator } from '@agen/utils';

export default function newMultiplexReader(from, unhandled) {
  const index = {};
  (async () => {
    let error;
    try {
      for await (let message of from) {
        const { callId, key, payload } = message;
        const o = index[callId];
        if (!o || !o[key]) await unhandled(message);
        else await o[key](payload);
      }
    } catch (e) {
      error = e;
    } finally {
      const method = error ? 'error' : 'complete';
      for (let o of Object.values(index)) { await o[method](error); }
    }
  })();
  return async function* read(callId) {
    yield* iterator((o) => {
      index[callId] = o;
      return () => delete index[callId];
    })();
  }
}