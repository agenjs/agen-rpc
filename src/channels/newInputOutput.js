import newMultiplexWriter from './newMultiplexWriter.js';
import newMultiplexReader from './newMultiplexReader.js';
import newMessagesIterator from './newMessagesIterator.js';

export default function newInputOutput(channel, unhandled = () => { }) {
  let finished = false;
  channel.handle('error', () => finished = true);
  channel.handle('disconnected', () => finished = true);
  const newWriter = newMultiplexWriter(async (message) => {
    await channel.call('message', message);
    return !finished;
  });
  const input = newMessagesIterator(channel, 'message');
  const newReader = newMultiplexReader(input, unhandled);
  return [newReader, newWriter];
}