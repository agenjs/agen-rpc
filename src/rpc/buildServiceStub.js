/**
 * Transforms a sequence of methods with the corresponding information about their signature
 * to a stub containing the following heirarchies:
 * package > service > method
 */
export default function buildServiceStub(it, getMethod, getMethodName = (_ => _)) {
  const result = {};
  for (let info of it) {
    const pckg = result[info.packageName] = result[info.packageName] || {};
    const service = pckg[info.serviceName] = pckg[info.serviceName] || {};
    service[getMethodName(info.methodName)] = getMethod(info);
  }
  return result;
}
