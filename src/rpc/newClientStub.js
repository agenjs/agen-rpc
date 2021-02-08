import newClientMethodProvider from './newClientMethodProvider.js';
import buildServiceStub from "./buildServiceStub.js";
import getJsServiceMethodName from './getJsServiceMethodName.js';

export default function newClientStub(serd, descriptors, getMethodName = getJsServiceMethodName) {
  return (getMethod) => buildServiceStub(
    descriptors,
    newClientMethodProvider(serd, getMethod),
    getMethodName
  );
}
