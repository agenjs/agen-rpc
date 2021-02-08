import newServerStub from './rpc/newServerStub.js';
import startServerHandler from './channels/startServerHandler.js';

export default function newServer({ serd, descriptors, channel, service }) {
  const serverStub = newServerStub(serd, descriptors)(service);
  const getServerMethod = ({ packageName, serviceName, methodName }) => serverStub[packageName][serviceName][methodName];
  return startServerHandler({ channel, getMethod: getServerMethod });
}