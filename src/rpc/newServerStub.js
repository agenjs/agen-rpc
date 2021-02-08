import buildServiceStub from './buildServiceStub.js';
import newServerMethodProvider from './newServerMethodProvider.js';
import getServiceMethod from './getServiceMethod.js';
import getJsServiceMethodName from './getJsServiceMethodName.js';

export default function newServerStub(serd, descriptors, getMethodName = getJsServiceMethodName) {
  return (impl) => buildServiceStub(
    descriptors,
    newServerMethodProvider(
      serd,
      (typeof impl === 'function')
        ? (methodInfo) => impl(methodInfo, getMethodName)
        : getServiceMethod(impl, getMethodName)
    )
  );
}