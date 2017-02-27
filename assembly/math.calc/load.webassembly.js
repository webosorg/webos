async function loadWebAssembly(filename, imports) {

  let binary  = await fetch(filename);

  let bytes   = await binary.arrayBuffer();

  let module  = await WebAssembly.compile(bytes);

  imports = imports || {};

  imports.env = imports.env || {};

  imports.env.memoryBase = imports.env.memoryBase || 0;

  imports.env.tableBase = imports.env.tableBase || 0;

  if (!imports.env.memory) {
    imports.env.memory = new WebAssembly.Memory({ initial: 256 });
  }

  if (!imports.env.table) {
    imports.env.table = new WebAssembly.Table({ initial: 0, element: 'anyfunc' });
  }

  return new WebAssembly.Instance(module, imports);
}