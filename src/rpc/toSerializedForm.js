import map from '@agen/utils/src/map.js';
import newCallsAdapter from './newCallsAdapter.js';

export default function toSerializedForm({ requestType, responseType, newSerializer, newDeserializer }) {
  return newCallsAdapter(map(newSerializer(requestType)), map(newDeserializer(responseType)));
}
