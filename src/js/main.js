import webOs from './core/init';

// Import styles
import '../css/main.css';

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

// Create main workers
// ...
