import * as agen from '../dist/agen-gzip-esm.js';

// Create a pipeline transforming text to binaries 
// and deflating them
const compress = compose(
  textToBinary(),
  agen.deflate()
);

// This pipeline inflates binary blocks 
// and transforms them to texts
const uncompress = compose(
  agen.inflate(),
  binaryToText()
);

// Create a function printing binary blocks on the screen
function printBinaries(print) {
  const toHex = b => b.reduce((s, i) => s += ('0' + i.toString(16)).slice(-2), '');
  return async function*(it) {
    for await (let block of it) {
      print(toHex(block));
      yield block;
    }
  }
}  

// The final pipeline. It performs the following operations:
// - it deflates strings
// - prints binary blocks on the screen (hex-encoded)
// - it inflates binaries, decodes them and returns resulting strings
const f = compose(
  compress,
  printBinaries(console.log),
  uncompress
)

// Now we are ready to launch deflating/inflating cycle for all data:
const list = [
  'item-0\n',
  'item-1\n',
  'item-2\n',
  'item-3\n',
  'item-4\n',
  'item-5\n',
  'item-6\n',
  'item-7\n'
]
for await (let b of f(list)) {
  console.log(b);
}
// Output:
// 789ccb2c49cdd535e0ca04518610ca08421943281308650aa1cc2094391700ec8710cd
// item - 0
// item - 1
// item - 2
// item - 3
// item - 4
// item - 5
// item - 6
// item - 7


// -------------------------------------------------------------------------
// Utility functions used above

function compose(...list) {
  return async function* (it = []) {
    yield* list.reduce((it, f) => (f ? f(it) : it), it);
  }
}
async function concat(gen) {
  let result = '';
  for await (let block of gen) {
    const str = (typeof block !== 'string')
      ? decoder.decode(block)
      : block;
    result += str;
  }
  return result;
}
function textToBinary() {
  return async function* (data) {
    const enc = new TextEncoder();
    for await (let block of data) { yield enc.encode(block); }
  }
}
function binaryToText() {
  return async function* (data) {
    const dec = new TextDecoder();
    for await (let block of data) { yield dec.decode(block); }
    const lastChunk = dec.decode();
    lastChunk && (yield lastChunk);
  }
}