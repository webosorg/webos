/**
 * Collection for Active Apps.
 * @module core/collection/activeApps
 * @see module:core/apps
 */

import debug from 'debug';

const log = debug('active apps:log');

if (ENV != 'production') {
  debug.enable();
} else {
  debug.disable();
}

import Collection from './collection.js';

/**
 * Class ActiveApps representing an active applications collection.
 * @extends Collection
 */

export default class ActiveApps extends Collection {
  /**
   * Create a dispatcher
   * @param { Dispatcher } dispatcher - The main dispatcher.
   */
  constructor(dispatcher) {
    super(dispatcher);
    this.remove = this.removeFromCollection;
    this.dispatcher.on('remove:app:from:main', this.remove, this);
    log('Create Active Apps Collection');
  }

  /** 
   * Add aplication proxy in 'this.collection'
   * Use super.push
   * And make event 'open:app'
   * @param { proxy object } proxy
   */

  push(proxy) {
    super.push(proxy);

    this.dispatcher.emit('open:app', {
      app: proxy
    });
  }
}