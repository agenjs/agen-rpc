import newClientMethodsProvider from './channels/newClientMethodsProvider.js';
import newClientStub from './rpc/newClientStub.js';

export default function newClient({ serd, descriptors, channel, newCallId }) {
  const newClientMethod = newClientMethodsProvider({
    channel,
    newCallId
  });
  return newClientStub(serd, descriptors)(newClientMethod);
}