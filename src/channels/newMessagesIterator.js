import { iterator } from '@agen/utils';

export default async function* newMessagesIterator(channel, eventKey = 'message') {
  yield* iterator(o => {
    const list = [
      channel.handle(eventKey, o.next),
      channel.handle('error', o.error),
      channel.handle('disconnect', o.complete)
    ]
    return () => list.forEach(r => r && r());
  })();
}