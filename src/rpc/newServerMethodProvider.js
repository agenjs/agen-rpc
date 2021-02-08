import transform from './transform.js';
import serverCallsAdapter from './serverCallsAdapter.js';
import fromSerializedForm from './fromSerializedForm.js';

export default function newServerMethodProvider(serd, getImplementation) {
  return (descriptor) => transform(getImplementation(descriptor), [
    // Transform generic AsyncGenerator methods to JavaScript specific calls
    serverCallsAdapter(descriptor),
    // We need to parse requests before sending them to the real implementation.
    // Responses should be serialized before sending them back.
    fromSerializedForm({ ...descriptor, ...serd }),
  ]);
}
