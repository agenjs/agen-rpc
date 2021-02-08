// import iterator from '@agen/utils/src/iterator.js';
import iterator from '@agen/utils/src/iterator.js';

export default async function* recieveMessages(channel, prefix) {
  yield* iterator(({ next, complete, error }) => {
    const list = [];
    list.push(channel.on(`${prefix}:next`, next));
    list.push(channel.on(`${prefix}:complete`, complete));
    list.push(channel.on(`${prefix}:error`, error));
    return () => list.forEach(r => r());
  })();
}
