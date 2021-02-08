import visitAstMethods from "./visitAstMethods.js";

export default function getMethodsDescriptors(ast) {
  const descriptors = [];
  for (let descriptor of visitAstMethods(ast)) {
    descriptors.push(descriptor);
  }
  return descriptors;
}