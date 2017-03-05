/**
 * Main core module.
 * @module core/init
 */
import Dispatcher from './dispatcher.js';

import Apps from './apps.js';

import Process from './process';

let webOs = {};

webOs.dispatcher = new Dispatcher;

webOs.apps = new Apps(webOs.dispatcher);

webOs.process = new Process(webOs.dispatcher);

Object.freeze(webOs);

export default webOs;