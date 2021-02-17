export default function serializeError(e) {
  let stack = e.stack;
  if (!Array.isArray(e.stack)) {
    const str = (typeof e.stack !== 'string') ? '' + e.stack : e.stack;
    stack = str.split(/[\r\n]+/gim);
  }
  return {
    ...e,
    status: 'error',
    code: e.code || 500,
    message: e.message,
    stack
  };
}