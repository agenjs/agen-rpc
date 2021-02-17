import newEventEmitter from './newEventEmitter.js';
import serializeError from '../src/channels/serializeError.js';
/**
 * A fake "channel" implementation - for each part it provides three methods:
 * - `async call(event, request)` - calls a remote handler
 * - `handle(event, handler)` - registers a new call handler; returns a function allowing
 *   to remove this handler
 * - `async close()` - closes the channel
 */
export default function newChannel() {

  const input = newEventEmitter();
  const output = newEventEmitter();
  const calls = {};
  let idCounter = 0;
  const newId = () => idCounter++;

  async function call(key, payload) {
    const id = newId();
    const promise = new Promise((resolve) => {
      calls[id] = resolve;
      output.emit(key, { id, payload });
    });
    const clear = () => delete calls[id];
    promise.then(clear, clear);
    return promise;
  }

  function sendAcknowledgement(id, payload) {
    output.emit('_ack', { id, payload });
  }
  input.on('_ack', ({ id, payload }) => {
    const resolve = calls[id];
    if (!resolve) return ; // FIXME: notify about an error
    resolve(payload);
  })

  function handle(key, handler) {
    const h = async ({ id, payload }) => {
      let response;
      try {
        response = await handler(payload);
      } catch (err) {
        response = serializeError(err);
      }
      sendAcknowledgement(id, response);
    };
    input.on(key, h);
    return () => input.off(key, h);
  }

  const registrations = [];

  function close() {
    registrations.forEach(r => r()); // Unregister connection
    Object.values(calls).forEach(r => r());
  }

  return {
    _input: input,
    _output: output,
    handle,
    call,
    close,
    connect: (channel) => {
      registrations.push(channel._output.on('*', input.emit));
      registrations.push(output.on('*', channel._input.emit));
      return close;
    }
  }
}