export default function getServiceMethod(service, getMethodName = (_ => _)) {
  return ({ packageName, serviceName, methodName }) => {
    return service[packageName][serviceName][getMethodName(methodName)];
  }
}
