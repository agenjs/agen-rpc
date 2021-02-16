import awaitEnd from './awaitEnd.js';
import newMultiplexWriter from './newMultiplexWriter.js';
import newMultiplexReader from './newMultiplexReader.js';
import newMessagesIterator from './newMessagesIterator.js';

export default function newInputOutput(channel, unhandled = () => { }) {
  let finished = false;
  const streamEnd = awaitEnd(channel);
  streamEnd.then(() => finished = true, () => finished = true);
  const newWriter = newMultiplexWriter((message) => {
    channel.emit('message', message);
    return !finished;
  });
  const input = newMessagesIterator(channel, 'message');
  const newReader = newMultiplexReader(input, unhandled);
  return [newReader, newWriter, streamEnd];
}
