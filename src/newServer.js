import newServerStub from './rpc/newServerStub.js';
import startServerHandler from './channels/startServerHandler.js';

export default function newServer({ serd, descriptors, service }) {
  const serverStub = newServerStub(serd, descriptors)(service);
  const getMethod = ({ packageName, serviceName, methodName }) => serverStub[packageName][serviceName][methodName];
  return (channel) => startServerHandler({ channel, getMethod });
}
