export default async function emitMessages(channel, prefix, it) {
  let error;
  try {
    for await (let message of it) {
      channel.emit(`${prefix}:next`, message);
    }
  } catch (e) {
    error = e;
  } finally {
    if (error)
      channel.emit(`${prefix}:error`, error);
    else
      channel.emit(`${prefix}:complete`);
  }
}