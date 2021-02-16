export default function newMultiplexWriter(next) {
  return async function write(callId, it) {
    let error, ok;
    try {
      for await (let payload of it) {
        ok = await next({ callId, key: 'next', payload });
        if (ok === false) break;
      }
    } catch (e) {
      error = e;
    } finally {
      error
        ? await next({ callId, key: 'error', payload: error })
        : await next({ callId, key: 'complete' });
    }
  }
}