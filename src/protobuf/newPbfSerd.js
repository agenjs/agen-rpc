import Pbf from 'pbf';
import compile from 'pbf/compile.js';

export default function newPbfSerd(ast) {
  function get(obj, path) {
    path = Array.isArray(path) ? path : path.split('.');
    let o, idx;
    for (o = obj, idx = 0; o && idx < path.length; idx++) {
      o = o[path[idx]];
    }
    return (idx === path.length) ? o : undefined;
  }
  const serializer = compile(ast);
  function newSerializer(type) {
    const write = get(serializer, type).write;
    return (req) => {
      const pbf = new Pbf();
      write(req, pbf);
      return pbf.finish();
    }
  }
  function newDeserializer(type) {
    const read = get(serializer, type).read;
    return (req) => {
      const pbf = new Pbf(req);
      return read(pbf);
    }
  }
  return { newSerializer, newDeserializer };
}