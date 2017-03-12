/**
 * Webos Application.
 * @module core/app
 * @see module:core/init
 */

import debug from 'debug';

const log = debug('webos-app:log');

if (ENV != 'production') {
  debug.enable();
} else {
  debug.disable();
}

import proxying from '../libs/proxying.js';

/** Class App representing a webos application. */

export default class App {
  /**
   * 
   */
  constructor(options) {
    // function 'proxying' can get second argument which your custom
    // Proxy handler
    // TODO ::: Create restricting logic for marge custom and
    // default Proxy handler
    // => see ::: /libs/proxying.js
    this.app = proxying(options, null);
    log('Create webos app');
  }
}
