/**
 * Collection for make different apps collection.
 * @module core/collection/collection
 * @see module:core/apps
 */

import debug from 'debug';

const log = debug('collection:log');

if (ENV != 'production') {
  debug.enable();
} else {
  debug.disable();
}

/** Class Collection representing a applications collection. */

export default class Collection {
  /**
   * Create a dispatcher and collection(type Array)
   * @param { Dispatcher } dispatcher - The main dispatcher.
   */
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
    this.collection = [];
    log('Create Collection');
  }

  /** 
   * Get application by UUID from 'this.collection'
   * @param { string } uuid - application uuid
   * @return { object } application
   */

  getByUuid(uuid) {
    return this.collection.find(app => app.__uuid == uuid);
  }

  /** 
   * Get application by NAME from 'this.collection'
   * @param { string } name - application name
   * @return { object } application
   */

  getByName(name) {
    return this.collection.find(app => app.name == name);
  }

  /** 
   * Add aplication proxy in 'this.collection'
   * @param { proxy object } proxy
   */

  push(proxy) {
    let isNotUnique = this.getByUuid(proxy.__uuid);
    if (isNotUnique) {
      throw new Error('Dublicate application uuid');
    }
    isNotUnique = this.getByName(proxy.name);
    if (isNotUnique) {
      throw new Error('Dublicate application name');
    }
    this.collection.push(proxy);
  }

  /** 
   * Remove aplication proxy from 'this.collection'
   * @param { proxy object } proxy
   */

  removeFromCollection(proxy) {
    let currentApp = this.getByName(proxy.name);
    this.collection.splice(this.collection.indexOf(currentApp), 1);
  }

  /** 
   * Remove aplication proxy from 'this.collection'
   * and make event 'remove:app:from:main' for
   * remove application from other collections.
   * @param { proxy object } proxy
   */

  remove(app) {
    this.removeFromCollection(app);
    this.dispatcher.emit('remove:app:from:main', app);
  }
}