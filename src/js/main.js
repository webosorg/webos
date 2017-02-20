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

// test for create application
webOs.dispatcher.emit('create:new:app', {
  app: {
    name: 'webos-terminal',
    uuid: '22e1d'
  }
});

// test for create application
webOs.dispatcher.emit('create:new:app', {
  app: {
    name: 'webos-terminal-face',
    uuid: '31qwa',
    // test
    process: {
      new: true,
      // ....
    }
  }
});

// test for remove application
webOs.appQueue.removeApp({
  app: {
    uuid: '22e1d'
  }
});

// test for create new process with dependecies,
// fucntion and onmessage callback.
// for ...dispatcher.emit('create:new:process', ...) 
webOs.dispatcher.emit(
  'create:new:process',
  // process body
  {
    deps: ['https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js'],
    fn: () => {
      let arr = [];
      for (let i = 0; i < 1000000; i++) {
        arr.push(i);
      }
      let odds = _.filter(arr, (item) => {
        if (item % 2 != 0) {
          return item;
        }
      });

      postMessage({odds: odds});

      // this example for implementation process work from devtools by webOs.process.queue
      // for reproduce this write this line in devtools
      // webOs.process.queue[0].postMessage([1, 2, 3, 4]);
      // NOTE ։։։ Please be attentive it will be work when terminate flag is false 

      onmessage = (e) => {
        let result = _.filter(e.data, (item) => {
          if (item % 2 == 0) {
            return item;
          }
        });

        postMessage({evens: result});
      };
    }
  },
  // options
  {
    // onmessage
    onmessage(e) {
      log('From another process ::: ', e.data);
    },
    // onerror
    onerror(err) {
      log('From another process ::: ', err);
    },

    terminate: false
  }
);

// test for create new process with dependecies,
// fucntion and onmessage callback.
// for webOs.process.create(...)
webOs.process.create(
  // process body
  {
    deps: ['https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js'],
    fn: () => {
      let arr = [];
      for (let i = 0; i < 1000000; i++) {
        arr.push(i);
      }
      let odds = _.filter(arr, (item) => {
        if (item % 2 != 0) {
          return item;
        }
      });

      postMessage({odds: odds});

      // this example for implementation process work from devtools by webOs.process.queue
      // for reproduce this write this line in devtools
      // webOs.process.queue[0].postMessage([1, 2, 3, 4]);
      // NOTE ։։։ Please be attentive it will be work when terminate flag is false 

      onmessage = (e) => {
        let result = _.filter(e.data, (item) => {
          if (item % 2 == 0) {
            return item;
          }
        });

        postMessage({evens: result});
      };
    }
  },
  // options
  {
    // onmessage
    onmessage(e) {
      log('From another process ::: ', e.data);
    },
    // onerror
    onerror(err) {
      log('From another process ::: ', err);
    },

    terminate: false
  }
);

// Create main workers
// ...

// Test for new application with another process calc logic
// ...