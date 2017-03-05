/**
 * The dispatcher for webos.
 * @module core/dispatcher
 */
import debug from 'debug';

const log = debug('dispatcher:log');
// Disable logging in production
if (ENV !== 'production') {
  debug.enable('*');
} else {
  debug.disable();
}

import EE from 'eventemitter3';

/** Class representing a main dispatcher for webos.
 *  @extends EventEmmiter3
 */

export default class Dispatcher extends EE {
  constructor() {
    super();
    log('Dispatcher Create');
  }
}