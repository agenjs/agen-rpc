import map from '@agen/utils/src/map.js';
import newCallsAdapter from './newCallsAdapter.js';

export default function fromSerializedForm({ requestType, responseType, newSerializer, newDeserializer }) {
  return newCallsAdapter(map(newDeserializer(requestType)), map(newSerializer(responseType)));
}
