// import iterator from '@agen/utils/src/iterator.js';
import iterator from '@agen/utils/src/iterator.js';

export default async function* recieveMessages(channel) {
  yield* iterator(({ next, complete, error }) => {
    const list = [];
    const listen = (ev, handler) => {
      channel.on(ev, handler);
      list.push(() => channel.off(ev, handler));
    }
    listen('next', next);
    listen('complete', complete);
    listen('error', error);
    return () => list.forEach(r => r && r());
  })();
}
