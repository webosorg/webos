/**
 * Terminal Applications.
 * @module core/apps/terminal
 * @see module:core/apps
 */

import debug from 'debug';

const log = debug('calculator-app:log');

if (ENV != 'production') {
  debug.enable();
} else {
  debug.disable();
}

import App from '../core/app.js';

export default class Terminal extends App {
  constructor() {
    super({
      name: 'Terminal',
      dockApp: true,
      uuid: '78',
      componentPath: '/components/webos-components/webos-terminal/t.html',
      elemName: 'webos-terminal'
    });
  }
}