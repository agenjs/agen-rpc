import fromIterator from './fromIterator.js';
import newCallsAdapter from './newCallsAdapter.js';
import toIterator from './toIterator.js';

export default function clientCallsAdapter({ requestStream, responseStream }) {
  return newCallsAdapter(toIterator(requestStream), fromIterator(responseStream));
}
