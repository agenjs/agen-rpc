export default function newMultiplexWriter(next) {
  return async function write(callId, it) {
    try {
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
    } catch (err) {
      // In case if the "next" method rises an exception...
      // TODO: find a better way to handle it.
      console.error(err);
    }
  }
}