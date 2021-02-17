import newEventEmitter from './newEventEmitter.js';

export default function newMultiplexer({ channel, messageKey = 'message', unhandled = (()=>{}) } = {}) {
  const index = {};
  const handler = ({ callId, key, payload }) => {
    const emitter = index[callId];
    if (!emitter) unhandled({ callId, key, payload });
    else emitter.emit(key, ...payload);
  };
  channel.on(messageKey, handler);
  return (callId) => {
    const emitter = index[callId] = newEventEmitter();
    function close() { delete index[callId]; }
    return {
      on: emitter.on,
      off: emitter.off,
      emit(key, ...payload) { channel.emit(messageKey, { callId, key, payload }); },
      close
    };
  };
}
