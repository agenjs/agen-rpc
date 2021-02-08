export default function newJsonSerd() {
  return ({
    newSerializer() { return (obj) => JSON.stringify(obj); },
    newDeserializer() { return (str) => JSON.parse(str); }
  })
}