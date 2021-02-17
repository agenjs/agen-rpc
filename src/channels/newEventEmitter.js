export default function newEventEmitter() {
  const index = {};
  function on(event, listener) {
    (index[event] = index[event] || []).push(listener);
    return () => off(event, listener);
  }
  function off(event, listener) {
    index[event] = (index[event] || []).filter(l => l !== listener);
  }
  function emit(event, ...args) {
    for (let l of (index['*'] || [])) { l(event, ...args); }
    for (let l of (index[event] || [])) { l(...args); }
  }
  return { on, off, emit };
}
