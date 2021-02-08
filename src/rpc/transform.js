export default function transform(method, transforms) {
  for (let t of transforms) { method = t(method); }
  return method;
}
