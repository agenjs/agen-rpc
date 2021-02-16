import newClientMethodsProvider from './channels/newClientMethodsProvider.js';
import newClientStub from './rpc/newClientStub.js';

export default function newClient({ serd, descriptors, newCallId, unhandled, }) {
  const clientStub = newClientStub(serd, descriptors);
  return (channel) => {
    const newClientMethod = newClientMethodsProvider({ channel, newCallId, unhandled });
    return clientStub(newClientMethod);
  }
}
