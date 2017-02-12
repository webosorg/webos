import Dispatcher from './dispatcher.js';
import AppQueue from './appQueue.js';

let webOs = {};

webOs.dispatcher = new Dispatcher;

webOs.appQueue = new AppQueue(webOs.dispatcher);

export default webOs;