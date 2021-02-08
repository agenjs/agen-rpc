export default function* visitAstMethods(ast) {
  const packageName = ast.package;
  for (let service of ast.services) {
    const serviceName = service.name;
    for (let method of service.methods) {
      const methodName = method.name;
      const requestStream = method.client_streaming;
      const responseStream = method.server_streaming;
      const requestType = method.input_type;
      const responseType = method.output_type;
      const methodInfo = {
        packageName, serviceName, methodName,
        requestStream, responseStream,
        requestType, responseType,
      };
      yield methodInfo;
    }
  }
}
