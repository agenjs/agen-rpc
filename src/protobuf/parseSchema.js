import schema from 'protocol-buffers-schema';

export default function parseSchema(str) {
  return schema.parse(str);
}