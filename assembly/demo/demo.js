loadWebAssembly('../math.calc/math.calc.wasm')
  .then(instance => {
    let exports = instance.exports; // the exports of that instance
    console.log('Log ::: exports', exports);
    var add = exports._add; // the "add" function (note "_" prefix)
    var sub = exports._sub; // the "sub" function (note "_" prefix)
    var dev = exports._dev; // the "dev" function (note "_" prefix)
    var mul = exports._mul; // the "mul" function (note "_" prefix)
    
    console.log('Log ::: Result from binary \'add\' ::: ', add(10, 3));
    console.log('Log ::: Result from binary \'sub\' ::: ', sub(10, 3));
    console.log('Log ::: Result from binary \'dev\' ::: ', dev(10, 3));
    console.log('Log ::: Result from binary \'mul\' ::: ', mul(10, 3));
  }
);