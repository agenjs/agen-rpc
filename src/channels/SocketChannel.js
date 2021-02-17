import serializeError from './serializeError.js';

/**
 * Implementation of the following three methods on top of the Socket.io-like API:
 * - `async call(event, request)` - calls a remote handler
 * - `handle(event, handler)` - registers a new call handler; returns a function allowing 
 *   to remove this handler
 * - `async close()` - closes the channel
 */
export default class SocketChannel {

  constructor(options) {
    this.options = options;
    this._registrations = {};
    this._calls = {};
    this.timeout = this.options.timeout || 1000;
  }

  close() {
    Object.values(this._calls).forEach(r => r && r());
    Object.values(this._registrations).forEach(r => r && r());
  }

  async call(event, request) {
    const callId = this._newId();
    const promise = new Promise((resolve, reject) => {
      try {
        this._calls[callId] = reject;
        this._invoke(event, request, this._withTimeout((reply) => {
          if (reply.code !== 200) reject(reply);
          else resolve(reply);
        }, reject));
      } catch (error) {
        reject(error);
      }
    });
    const clear = () => { delete this._calls[callId]; };
    promise.then(clear, clear);
    return promise;
  }

  handle(event, handler) {
    return this._listen(event, async (params, callback) => {
      let obj = { status: 'ok', code: 200 };
      try {
        obj.data = await handler(params);
      } catch (error) {
        Object.assign(obj, serializeError(error));
      } finally {
        callback(obj);
      }
    })
  }

  _newId() {
    return this._id = (this._id || 0) + 1;
  }

  _withTimeout(onSuccess, onTimeout) {
    const timeout = this.timeout;
    const begin = Date.now();
    let called = false;
    const timer = setTimeout(() => {
      if (called) return;
      called = true;
      const end = Date.now();
      const error = Object.assign(new Error('408 Request Timeout'), {
        code: 408, // HTTP 408 Request Timeout
        begin, end,
        elapsedTime: end - begin,
        timeout
      });
      onTimeout(error);
    }, timeout);
    return (...args) => {
      if (called) return;
      called = true;
      clearTimeout(timer);
      onSuccess.apply(this, args);
    }
  }

  // ------------------------------------------------------------
  // Socket-related code

  get socket() { return this.options.socket; }

  _invoke(event, params, callback) {
    this.socket.emit(event, params, callback);
  }

  _listen(event, handler) {
    const id = this._newId();
    const cleanup = this._registrations[id] = () => {
      this.socket.off(event, handler);
      delete this._registrations[id];
    }
    this.socket.on(event, handler);
    return cleanup;
  }

}
