import fromIterator from './fromIterator.js';
import newCallsAdapter from './newCallsAdapter.js';
import toIterator from './toIterator.js';

export default function serverCallsAdapter({ requestStream, responseStream }) {
  return newCallsAdapter(fromIterator(requestStream), toIterator(responseStream));
}
