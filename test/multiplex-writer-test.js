import tape from "tape-await";
import newMultiplexWriter from '../src/channels/newMultiplexWriter.js';

tape(`multiplexerWriter - should split the main stream of messages to multiple sub-streams`, async (t) => {
  // This test checks that all messages are delivered.
  // But it does not take into account the order of their arrival - 
  // all results are sorted before verification.
  let list = []
  const writer = newMultiplexWriter((message) => list.push(message));
  await Promise.all([
    writer('123', toAsyncIterator([ 'A', 'B', 'C', 'D', 'E' ])),
    writer('234', toAsyncIterator([ '1', '2', '3', '4', '5', '6', '7'])),
    writer('345', toAsyncIterator([ 'a', 'b', 'c', 'd', 'e' ])),
  ]);
  const control = [
    { callId: '123', key: 'next', payload: 'A' },
    { callId: '123', key: 'next', payload: 'B' },
    { callId: '123', key: 'next', payload: 'C' },
    { callId: '123', key: 'next', payload: 'D' },
    { callId: '123', key: 'next', payload: 'E' },
    { callId: '123', key: 'complete' },
    
    { callId: '234', key: 'next', payload: '1' },
    { callId: '234', key: 'next', payload: '2' },
    { callId: '234', key: 'next', payload: '3' },
    { callId: '234', key: 'next', payload: '4' },
    { callId: '234', key: 'next', payload: '5' },
    { callId: '234', key: 'next', payload: '6' },
    { callId: '234', key: 'next', payload: '7' },
    { callId: '234', key: 'complete' },
    
    { callId: '345', key: 'next', payload: 'a' },
    { callId: '345', key: 'next', payload: 'b' },
    { callId: '345', key: 'next', payload: 'c' },
    { callId: '345', key: 'next', payload: 'd' },
    { callId: '345', key: 'next', payload: 'e' },
    { callId: '345', key: 'complete' }
  ]

  list = list.sort((a, b) =>  {
    let r = cmp(a.callId, b.callId);
    return r !== 0 ? r : cmp(a.payload, b.payload);

    function cmp(a, b) {
      return a > b ? 1 : a < b ? -1 : 0;
    }
  });
  t.deepEqual(list, control);

  async function* toAsyncIterator(list) {
    for await (let value of list) {
      yield value;
      await new Promise(r => setTimeout(r, Math.random() * 30));
    }
  }
})

tape(`multiplexer - should split the main stream of messages to multiple sub-streams (fixe timeouts)`, async (t) => {
  // This test uses the fixed delay between messages of each sub-stream.
  // So the order of message arrival should be fixed. 
  let list = []
  const writer = newMultiplexWriter((message) => list.push(message));
  await Promise.all([
    writer('123', toAsyncIterator(['A', 'B', 'C', 'D', 'E'])),
    writer('234', toAsyncIterator(['1', '2', '3', '4', '5', '6', '7'])),
    writer('345', toAsyncIterator(['a', 'b', 'c', 'd', 'e'])),
  ]);
  const control = [
    { "callId": "123", "key": "next", "payload": "A" },
    { "callId": "234", "key": "next", "payload": "1" },
    { "callId": "345", "key": "next", "payload": "a" },
    { "callId": "123", "key": "next", "payload": "B" },
    { "callId": "234", "key": "next", "payload": "2" },
    { "callId": "345", "key": "next", "payload": "b" },
    { "callId": "123", "key": "next", "payload": "C" },
    { "callId": "234", "key": "next", "payload": "3" },
    { "callId": "345", "key": "next", "payload": "c" },
    { "callId": "123", "key": "next", "payload": "D" },
    { "callId": "234", "key": "next", "payload": "4" },
    { "callId": "345", "key": "next", "payload": "d" },
    { "callId": "123", "key": "next", "payload": "E" },
    { "callId": "234", "key": "next", "payload": "5" },
    { "callId": "345", "key": "next", "payload": "e" },
    { "callId": "123", "key": "complete" },
    { "callId": "234", "key": "next", "payload": "6" },
    { "callId": "345", "key": "complete" },
    { "callId": "234", "key": "next", "payload": "7" },
    { "callId": "234", "key": "complete" }
  ]
  t.deepEqual(list, control);

  async function* toAsyncIterator(list, t) {
    for await (let value of list) {
      yield value;
      await new Promise(r => setTimeout(r, 5));
    }
  }
})

tape(`multiplexer - should be able to interrupt substreams from the main stream`, async (t) => {
  let list = []
  const writer = newMultiplexWriter((message) => {
    list.push(message);
    if (list.length >= 5) return false;
  });
  await Promise.all([
    writer('123', toAsyncIterator(['A', 'B', 'C', 'D', 'E'])),
    writer('234', toAsyncIterator(['1', '2', '3', '4', '5', '6', '7'])),
    writer('345', toAsyncIterator(['a', 'b', 'c', 'd', 'e'])),
  ]);
  const control = [
    { "callId": "123", "key": "next", "payload": "A" },
    { "callId": "234", "key": "next", "payload": "1" },
    { "callId": "345", "key": "next", "payload": "a" },
    { "callId": "123", "key": "next", "payload": "B" },
    { "callId": "234", "key": "next", "payload": "2" },
    { "callId": "234", "key": "complete" },
    { "callId": "345", "key": "next", "payload": "b" },
    { "callId": "345", "key": "complete" },
    { "callId": "123", "key": "next", "payload": "C" },
    { "callId": "123", "key": "complete" },

    // // The following messages will be never delivered:
    // { "callId": "234", "key": "next", "payload": "3" },
    // { "callId": "345", "key": "next", "payload": "c" },
    // { "callId": "123", "key": "next", "payload": "D" },
    // { "callId": "234", "key": "next", "payload": "4" },
    // { "callId": "345", "key": "next", "payload": "d" },
    // { "callId": "123", "key": "next", "payload": "E" },
    // { "callId": "234", "key": "next", "payload": "5" },
    // { "callId": "345", "key": "next", "payload": "e" },
    // { "callId": "234", "key": "next", "payload": "6" },
    // { "callId": "234", "key": "next", "payload": "7" },
  ]
  // console.log(list.map(v => JSON.stringify(v)).join(',\n'))
  t.deepEqual(list, control);

  async function* toAsyncIterator(list) {
    for await (let value of list) {
      yield value;
      await new Promise(r => setTimeout(r, 10));
    }
  }
})

