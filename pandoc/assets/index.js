import {
  WASI,
  OpenFile,
  File,
  ConsoleStdout,
  PreopenDirectory,
} from "./dist-index.js";

const args = ["pandoc.wasm", "+RTS", "-H64m", "-RTS"];
const env = [];
const in_file = new File(new Uint8Array(), { readonly: true });
const out_file = new File(new Uint8Array(), { readonly: false });
const fds = [
  new OpenFile(new File(new Uint8Array(), { readonly: true })),
  ConsoleStdout.lineBuffered((msg) => console.log(`[WASI stdout] ${msg}`)),
  ConsoleStdout.lineBuffered((msg) => console.warn(`[WASI stderr] ${msg}`)),
  new PreopenDirectory("/", [
    ["in", in_file],
    ["out", out_file],
  ]),
];
const options = { debug: false };
const wasi = new WASI(args, env, fds, options);
/*
const { instance } = await instantiateStreaming(
  fetch("./pandoc.wasm"),
  {
    wasi_snapshot_preview1: wasi.wasiImport,
  }
);
*/
///
  const { instance } = await instantiateStreaming("pandoc.wasm.br", {
    wasi_snapshot_preview1: wasi.wasiImport
  });
  
async function instantiateStreaming(source, imports) {
	let resp = await fetch(source);
	let buffer = await	resp.arrayBuffer();
	let binary = new Uint8Array(buffer);
	const decompressed = dw(binary);
  let result = await WebAssembly.instantiate(
    decompressed, imports
  );
  return result;
}

////
wasi.initialize(instance);
instance.exports.__wasm_call_ctors();

function memory_data_view() {
  return new DataView(instance.exports.memory.buffer);
}

const argc_ptr = instance.exports.malloc(4);
memory_data_view().setUint32(argc_ptr, args.length, true);
const argv = instance.exports.malloc(4 * (args.length + 1));
for (let i = 0; i < args.length; ++i) {
  const arg = instance.exports.malloc(args[i].length + 1);
  new TextEncoder().encodeInto(
    args[i],
    new Uint8Array(instance.exports.memory.buffer, arg, args[i].length)
  );
  memory_data_view().setUint8(arg + args[i].length, 0);
  memory_data_view().setUint32(argv + 4 * i, arg, true);
}
memory_data_view().setUint32(argv + 4 * args.length, 0, true);
const argv_ptr = instance.exports.malloc(4);
memory_data_view().setUint32(argv_ptr, argv, true);

instance.exports.hs_init_with_rtsopts(argc_ptr, argv_ptr);

export function pandoc(args_str, data) {
  const args_ptr = instance.exports.malloc(args_str.length);
  new TextEncoder().encodeInto(
    args_str,
    new Uint8Array(instance.exports.memory.buffer, args_ptr, args_str.length)
  );
  in_file.data = data;
  instance.exports.wasm_main(args_ptr, args_str.length);
  return out_file.data;
}
