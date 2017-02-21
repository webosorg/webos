import Dispatcher from './dispatcher.js';

import AppQueue from './appQueue.js';

import Process from './process';

let webOs = {}

webOs.dispatcher = new Dispatcher

webOs.appQueue = new AppQueue(webOs.dispatcher)

webOs.process = new Process(webOs.dispatcher)

export default webOs

'It is only for webos-bot testing'
