export default function toIterator(stream) {
  return stream
    ? (value) => (async function* () { yield* (await value); })()
    : (value) => (async function* () { yield (await value); })();
}
