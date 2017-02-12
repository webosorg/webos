self.window = self;

importScripts('https://cdnjs.cloudflare.com/ajax/libs/synaptic/1.0.8/synaptic.js');

const Layer = synaptic.Layer;
const Network = synaptic.Network;
const Trainer = synaptic.Trainer;

const inputLayer = new Layer(784);
const hiddenLayer = new Layer(100);
const outputLayer = new Layer(10);

inputLayer.project(hiddenLayer);
hiddenLayer.project(outputLayer);

const myNetwork = new Network({
    input: inputLayer,
    hidden: [hiddenLayer],
    output: outputLayer
});

console.log(myNetwork);

// https://www.youtube.com/watch?v=PusDheGpO5M