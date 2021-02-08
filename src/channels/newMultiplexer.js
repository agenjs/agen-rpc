import newEventEmitter from './newEventEmitter.js';

export default function newMultiplexer(channel, messageKey) {
  const index = {};
  const handler = ({ channelId, key, payload }) => {
    const emitter = index[channelId];
    if (!emitter)
      return; // TODO: log and throw an error!
    emitter.emit(key, ...payload);
  };
  channel.on(messageKey, handler);
  return (channelId) => {
    const emitter = index[channelId] = newEventEmitter();
    function close() { delete index[channelId]; }
    return {
      on: emitter.on,
      off: emitter.off,
      emit(key, ...payload) { channel.emit(messageKey, { channelId, key, payload }); },
      close
    };
  };
}
