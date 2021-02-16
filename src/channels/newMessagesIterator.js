import { iterator } from '@agen/utils';

export default async function* newMessagesIterator(channel, eventKey = 'message') {
  yield* iterator(o => {
    channel.on(eventKey, o.next);
    channel.on('error', o.error);
    channel.on('disconnect', o.complete);
    return () => {
      channel.off(eventKey, o.next);
      channel.off('error', o.error);
      channel.off('disconnect', o.complete);
    }
  })();
}