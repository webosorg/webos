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

import webOs from './core/init';

window.webOs = webOs;

// Import styles
import '../css/main.css';


// test
webOs.dispatcher.emit('create:new:app', {
  app: {
    name: 'webos-terminal',
    uuid: '22e1d'
  }
});

webOs.dispatcher.emit('create:new:app', {
  app: {
    name: 'webos-terminal-face',
    uuid: '31qwa'
  }
});

// test
webOs.appQueue.removeApp({
  app: {
    uuid: '22e1d'
  }
});


// Create main workers
// ...
