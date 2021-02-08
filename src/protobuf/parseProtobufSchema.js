import parseSchema from './parseSchema.js';
import getMethodsDescriptors from './getMethodsDescriptors.js';
import newPbfSerd from './newPbfSerd.js';

export default function parseProtobufSchema(schema) {
  const ast = parseSchema(schema);
  const descriptors = getMethodsDescriptors(ast);
  const serd = newPbfSerd(ast);
  return { descriptors, serd, ast };
}