import transform from './transform.js';
import toSerializedForm from './toSerializedForm.js';
import clientCallsAdapter from './clientCallsAdapter.js';

export default function newClientMethodProvider(serd, getTransport) {
  return (descriptor) => transform(getTransport(descriptor), [
    // Serialize requests before sending them and deserialize responses
    toSerializedForm({ ...descriptor, ...serd }),
    // Transform JavaScript-specific method calls to generic ones
    clientCallsAdapter(descriptor),
  ]);
}
