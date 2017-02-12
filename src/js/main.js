import Dispatcher from './patterns/pubSub.js';
// Import styles
import '../css/main.css';

import webOs from './core/init';

window.webOs = webOs;

// Add a debugger
import debug from 'debug';
const log = debug('app:log');
// Disable logging in production
if (ENV !== 'production') {
  debug.enable('*');

  // For live reload
  document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] +
  ':35729/livereload.js?snipver=1"></' + 'script>');
} else {
  debug.disable();
}

log('::: App Start :::');

// Create main 3 workers

const Analyze = new Worker('js/analyze/analyze.worker.js');
const Mathematic = new Worker('js/math/math.worker.js');
const NN = new Worker('js/nn/nn.worker.js');

let user = {
  name: 'Suren',
  age: 23,
  success: false
} ;

Mathematic
  .onmessage = (e) => {
    log(e.data);
  };

log(user);

Mathematic
  .postMessage(user);

log(Analyze, NN);

const AppDispatcher = new Dispatcher;