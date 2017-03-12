/**
 * Calculator Applications.
 * @module core/apps/calculator
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

export default class Calculator extends App {
  constructor() {
    super({
      name: 'Calculator',
      dockApp: true
    });
  }
}