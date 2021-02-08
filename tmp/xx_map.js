export default function map(f) {
  return async function* (it) { for await (let item of await it) { yield f(item); } };
}
