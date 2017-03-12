/**
 * Default Applications.
 * @module core/apps/defaults
 * @see module:core/apps
 */

import debug from 'debug';

const log = debug('default-apps:log');

if (ENV != 'production') {
  debug.enable();
} else {
  debug.disable();
}

import Calculator from './calculator.js';

export default [
  (new Calculator).app
];
