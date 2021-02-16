import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';
import json from "@rollup/plugin-json";

import {terser} from "rollup-plugin-terser";
import * as meta from "./package.json";

const external = []; // Object.keys(meta.dependencies || {}).filter(key => /^@agen/.test(key));
const distName = meta.name.replace('@', '').replace('/', '-');
const config = {
  input: "src/index.js",
  external,
  output: {
    file: `dist/${distName}.js`,
    name: "agen",
    format: "umd",
    indent: false,
    extend: true,
    banner: `// ${meta.homepage} v${meta.version} Copyright ${(new Date).getFullYear()} ${meta.author.name}`,
    globals: Object.assign({}, ...Object.keys(meta.dependencies || {}).filter(key => /^@agen/.test(key)).map(key => ({[key]: "agen"})))
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    json()
  ]
};

export default [
  config,
  {
    ...config,
    output: {
      ...config.output,
      file: `dist/${distName}.min.js`
    },
    plugins: [
      ...config.plugins,
      terser({
        output: {
          preamble: config.output.banner
        }
      })
    ]
  },
  {
    ...config,
    output: {
      ...config.output,
      file: `dist/${distName}-esm.js`,
      format : "es"
    },
  },
  {
    ...config,
    output: {
      ...config.output,
      file: `dist/${distName}-esm.min.js`,
      format: "es"
    },
    plugins: [
      ...config.plugins,
      terser({
        output: {
          preamble: config.output.banner
        }
      })
    ]    
  }
];
