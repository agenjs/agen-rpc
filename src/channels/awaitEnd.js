export default function awaitEnd(channel) {
  return new Promise((resolve, reject) => {
    once(channel, 'error', reject);
    once(channel, 'disconnect', resolve);
  });
  function once(events, key, action) {
    events.on(key, async function handler(...args) {
      let result = await action(...args);
      (result !== false) && events.off(key, handler);
    })
  }
}