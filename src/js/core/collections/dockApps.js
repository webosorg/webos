/**
 * Collection for dick Apps.
 * @module core/collection/activeApps
 * @see module:core/apps
 */

import debug from 'debug';

const log = debug('app:log');

if (ENV != 'production') {
  debug.enable();
} else {
  debug.disable();
}

import Collection from './collection.js';

/**
 * Class DockApps representing a applications collection, that must show in dock panel.
 * @extends Collection
 */

export default class DockApps extends Collection {
  /**
   * Create a dispatcher
   * @param { Dispatcher } dispatcher - The main dispatcher.
   */
  constructor(dispatcher) {
    super(dispatcher);
    this.remove = this.removeFromCollection;
    this.dispatcher.on('remove:app:from:main', this.remove, this);
    log('Create Dock Apps Collection');
  }
  /** 
   * Add aplication proxy in 'this.collection'
   * Use super.push
   * And make event 'create:app:in:dock' for show application dock panel
   * @param { proxy object } proxy
   */

  push(proxy) {
    super.push(proxy);

    this.dispatcher.emit('create:app:in:dock', {
      app: this.getByName(proxy.name)
    });
  }
}