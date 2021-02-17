import { iterator } from '@agen/utils';
import newMultiplexWriter from './newMultiplexWriter.js';
import newMultiplexReader from './newMultiplexReader.js';

export default function newInputOutput(channel, unhandled = () => { }) {
  let finished = false;
  channel.handle('error', () => finished = true);
  channel.handle('disconnected', () => finished = true);
  const newWriter = newMultiplexWriter(async (message) => {
    if (!finished) await channel.call('message', message);
    return !finished;
  });
  const input = iterator(o => {
    const list = [
      channel.handle('message', o.next),
      channel.handle('error', o.error),
      channel.handle('disconnect', o.complete)
    ]
    return () => list.forEach(r => r && r());
  })();
  const newReader = newMultiplexReader(input, unhandled);
  return [newReader, newWriter];
}