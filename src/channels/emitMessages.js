export default function emitMessages(channel) {
  return async function* (it) {
    let error;
    try {
      for await (let message of it) {
        channel.emit('next', message);
        yield message;
      }
    } catch (e) {
      let stack = e.stack;
      if (!Array.isArray(e.stack)) {
        const str = (typeof e.stack !== 'string') ? '' + e.stack : e.stack;
        stack = str.split(/[\r\n]+/gim);
      }
      error = {
        ...e,
        type : 'Error',
        code : e.code || 500,
        message : e.message,
        stack 
      };
    } finally {
      if (error) channel.emit('error', error);
      else channel.emit('complete');
    }
  }
}