import tape from "tape-await";
import newMultiplexReader from '../src/channels/newMultiplexReader.js';

tape(`multiplexReader - should split the main stream of messages to multiple sub-streams`, async (t) => {

  const it = (async function* () {
    const messages = [
      { callId: 123, payload: 'A', key: 'next' },
      { callId: 234, payload: '1', key: 'next' },
      { callId: 345, payload: 'a', key: 'next' },
      { callId: 234, payload: '2', key: 'next' },
      { callId: 345, payload: 'b', key: 'next' },
      { callId: 123, payload: 'B', key: 'next' },
      { callId: 234, payload: '3', key: 'next' },
      { callId: 345, payload: 'c', key: 'next' },
      { callId: 345, payload: 'd', key: 'next' },
      { callId: 234, payload: '4', key: 'next' },
      { callId: 234, payload: '5', key: 'next' },
      { callId: 345, payload: 'e', key: 'next' },
      { callId: 234, payload: '6', key: 'next' },
      { callId: 123, payload: 'C', key: 'next' },
      { callId: 123, payload: 'D', key: 'next' },
      { callId: 234, payload: '7', key: 'next' },
      { callId: 234, key: 'complete' },
      { callId: 123, payload: 'E', key: 'next' },
      { callId: 345, key: 'complete' },
      { callId: 123, key: 'complete' },
    ];
    for await (let message of messages) {
      yield message;
      await new Promise(r => setTimeout(r, Math.random() * 30));
    }
  })();

  const read = newMultiplexReader(it);
  const first = read('123');
  const second = read('234');
  const third = read('345');
  const results = await Promise.all([
    readAll(first),
    readAll(second),
    readAll(third),
  ]);
  const control = [
    ["A", "B", "C", "D", "E"],
    ["1", "2", "3", "4", "5", "6", "7"],
    ["a", "b", "c", "d", "e"]
  ];
  t.deepEqual(results, control);

  async function readAll(it) {
    const result = [];
    for await (let value of it) {
      result.push(value);
    }
    return result;
  }
})


tape(`multiplexReader - should notify about non-handled messages`, async (t) => {

  const it = (async function* () {
    const messages = [
      { callId: 123, payload: 'A', key: 'next' },
      { callId: 234, payload: '1', key: 'next' },
      { callId: 345, payload: 'a', key: 'next' },
      { callId: 234, payload: '2', key: 'next' },
      { callId: 345, payload: 'b', key: 'next' },
      { callId: 123, payload: 'B', key: 'next' },
      { callId: 234, payload: '3', key: 'next' },
      { callId: 345, payload: 'c', key: 'next' },
      { callId: 345, key: 'complete' },
      { callId: 345, payload: 'd', key: 'next' },
      { callId: 234, payload: '4', key: 'next' },
      { callId: 234, key: 'complete' },
      { callId: 234, payload: '5', key: 'next' },
      { callId: 345, payload: 'e', key: 'next' },
      { callId: 234, payload: '6', key: 'next' },
      { callId: 123, key: 'complete' },
      { callId: 123, payload: 'C', key: 'next' },
      { callId: 123, payload: 'D', key: 'next' },
      { callId: 234, payload: '7', key: 'next' },
      { callId: 123, payload: 'E', key: 'next' },
    ];
    for await (let message of messages) {
      yield message;
      await new Promise(r => setTimeout(r, Math.random() * 30));
    }
  })();

  const list = [];
  const read = newMultiplexReader(it, (message) => list.push(message));
  const first = read('123');
  const second = read('234');
  const third = read('345');
  const result = await Promise.all([
    readAll(first),
    readAll(second),
    readAll(third),
  ]);
  t.deepEqual(result, [
    ["A", "B"],
    ["1", "2", "3", "4"],
    ["a", "b", "c"]
  ])
  t.deepEqual(list, [
    { callId: 345, payload: 'd', key: 'next' },
    { callId: 234, payload: '5', key: 'next' },
    { callId: 345, payload: 'e', key: 'next' },
    { callId: 234, payload: '6', key: 'next' },
    // These messages are never loaded from the source: 
    // { callId: 123, payload: 'C', key: 'next' },
    // { callId: 123, payload: 'D', key: 'next' },
    // { callId: 234, payload: '7', key: 'next' },
    // { callId: 123, payload: 'E', key: 'next' },
  ]);

  async function readAll(it) {
    const result = [];
    for await (let value of it) {
      result.push(value);
    }
    return result;
  }
})


tape(`multiplexReader - sub-streams should be automatically interrupted by the end of the main stream`, async (t) => {
  // This test has no "complete" messages. 
  // So each sub-stream is interrupted when the main stream is finished
  const it = (async function* () {
    const messages = [
      { callId: 123, payload: 'A', key: 'next' },
      { callId: 234, payload: '1', key: 'next' },
      { callId: 345, payload: 'a', key: 'next' },
      { callId: 234, payload: '2', key: 'next' },
      { callId: 345, payload: 'b', key: 'next' },
      { callId: 123, payload: 'B', key: 'next' },
      { callId: 234, payload: '3', key: 'next' },
      { callId: 345, payload: 'c', key: 'next' },
      { callId: 345, payload: 'd', key: 'next' },
      { callId: 234, payload: '4', key: 'next' },
      { callId: 234, payload: '5', key: 'next' },
      { callId: 345, payload: 'e', key: 'next' },
      { callId: 234, payload: '6', key: 'next' },
      { callId: 123, payload: 'C', key: 'next' },
      { callId: 123, payload: 'D', key: 'next' },
      { callId: 234, payload: '7', key: 'next' },
      { callId: 123, payload: 'E', key: 'next' },
    ];
    for await (let message of messages) {
      yield message;
      await new Promise(r => setTimeout(r, Math.random() * 30));
    }
  })();

  const read = newMultiplexReader(it);
  const first = read('123');
  const second = read('234');
  const third = read('345');
  const results = await Promise.all([
    readAll(first),
    readAll(second),
    readAll(third),
  ]);
  const control = [
    ["A", "B", "C", "D", "E", "END"],
    ["1", "2", "3", "4", "5", "6", "7", "END"],
    ["a", "b", "c", "d", "e", "END"]
  ];
  t.deepEqual(results, control);

  async function readAll(it) {
    const result = [];
    for await (let value of it) {
      result.push(value);
    }
    // Add it to the end to notify that the stream 
    // was properly finished (without exceptions etc):
    result.push('END'); 
    return result;
  }
})


tape(`multiplexReader - should properly notify about errors`, async (t) => {

  const it = (async function* () {
    const messages = [
      { callId: 123, payload: 'A', key: 'next' },
      { callId: 234, payload: '1', key: 'next' },
      { callId: 345, payload: 'a', key: 'next' },
      { callId: 234, payload: '2', key: 'next' },
      { callId: 345, payload: 'b', key: 'next' },
      { callId: 123, payload: 'B', key: 'next' },
      { callId: 234, payload: '3', key: 'next' },
      { callId: 345, payload: 'c', key: 'next' },
      { callId: 345, payload: 'Hello, world', key: 'error' },
      { callId: 345, payload: 'd', key: 'next' },
      { callId: 234, payload: '4', key: 'next' },
      { callId: 234, payload: '5', key: 'next' },
      { callId: 345, payload: 'e', key: 'next' },
      { callId: 234, payload: '6', key: 'next' },
      { callId: 123, payload: 'C', key: 'next' },
      { callId: 123, payload: 'D', key: 'next' },
      { callId: 234, payload: '7', key: 'next' },
      { callId: 234, key: 'complete' },
      { callId: 123, payload: 'E', key: 'next' },
      { callId: 123, key: 'complete' },
    ];
    for await (let message of messages) {
      yield message;
      await new Promise(r => setTimeout(r, Math.random() * 30));
    }
  })();

  const list = [];
  const read = newMultiplexReader(it, (message) => list.push(message));
  const first = read('123');
  const second = read('234');
  const third = read('345');
  const result = await Promise.all([
    readAll(first),
    readAll(second),
    readAll(third),
  ]);
  t.deepEqual(result, [
    ["A", "B", "C", "D", "E"],
    ["1", "2", "3", "4", "5", "6", "7"],
    ["a", "b", "c", "Error: Hello, world"]
  ])
  t.deepEqual(list, [
    { callId: 345, payload: 'd', key: 'next' },
    { callId: 345, payload: 'e', key: 'next' },
  ]);

  async function readAll(it) {
    const result = [];
    try {
      for await (let value of it) {
        result.push(value);
      }
    } catch (err) {
      result.push(`Error: ${err}`);
    }
    return result;
  }
})
