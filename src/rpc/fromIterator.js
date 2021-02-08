export default function fromIterator(stream) {
  return stream
    ? (value) => (async function* () { yield* (await value); })()
    : (value) => (async function () { for await (let item of await value) { return item; } })();
}
