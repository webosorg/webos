/**
 * Applications Queue.
 * @module core/appQueue
 * @see module:core/init
 */

import debug from 'debug';

const log = debug('appQueue:log');
// Disable logging in production
if (ENV !== 'production') {
  debug.enable('*');
} else {
  debug.disable();
}

import proxying from '../libs/proxying.js';

/** Class AppQueue representing a webos applications queue. */

export default class Apps {
  /**
   * Create a dispatcher, name, allApps, activeApps and call _installListeners.
   * @param { Dispatcher } dispatcher - The main dispatcher.
   */
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
    this.name = 'webos-app-queue';
    this.allApps = [];
    this.activeApps = [];
    this._installListeners();
  }
  /**
   * Set the listeners.
   */
  _installListeners() {
    this.dispatcher.on('create:new:app', this.createNewApp, this);
    this.dispatcher.on('app:touch', this.touchApp, this);
    this.dispatcher.on('remove:app', this.removeApp, this);
    this.dispatcher.on('ready:component:appList', this.readyAppList, this);
    this.dispatcher.on('close:app', this.closeApp, this);
  }

  /**
   * Set the default applications.
   */
  initDefaultApps() {
    let calculator = {
      name: 'Calculator'
    };

    this.createNewApp({
      app: calculator
    });

    this.dispatcher.emit('create:app', {
      app: this.getAppByName(calculator.name)
    });
  }

  /**
   * When ready application list component 
   * set the default applications.
   */
  readyAppList() {
    this.initDefaultApps();
  }

  /** 
   * Check options and call static pushApp
   * method with options
   * @param { object } options
   */

  createNewApp(options) {
    if (!options.app) {
      // TODO ::: Create Error Handler
      // see => link ::: https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Error
      // see => link ::: https://learn.javascript.ru/oop-errors 
      // see => link ::: http://expressjs.com/ru/guide/error-handling.html
      throw new Error(`With create:new:app event send app options
        ex. \'dispatcher.emit('create:new:app', {app: ...})\'`);
    }
    this.pushApp(proxying(options.app));
    log('create new app');
    // function 'proxying' can get second argument which your custom
    // Proxy handler
    // TODO ::: Create restricting logic for marge custom and
    // default Proxy handler
    // => see ::: /libs/proxying.js
  }

  /** 
   * Remove application from 'this.allApps'
   * @param { object } options
   */

  removeApp(options) {
    if (!options || (options && !options.app)) {
      throw new Error(`With create:new:app event send app options
        ex. \'dispatcher.emit('create:new:app', {app: ...})\'`);      
    } else if (options.app) {
      this.allApps.splice(this.allApps.indexOf(this.getAppByUuid(options.app.uuid)), 1);
      log('remove app');
    }
  }

  /** 
   * Get application by UUID from 'this.allApps'
   * @param { string } uuid
   * @return { object } application
   */

  getAppByUuid(uuid) {
    return this.allApps.find(app => app.__uuid == uuid);
  }

  /** 
   * Get application by NAME from 'this.allApps' by default
   * and from 'arr' when 'arr' is exists
   * @param { string } name
   * @param { array } arr
   * @return { object } application
   */

  getAppByName(name, arr) {
    let queue;
    if (arr) {
      queue = arr;
    } else {
      queue = this.allApps;
    }
    return queue.find(app => app.name == name);
  }

  /** 
   * Add aplication proxy in 'this.allApps'
   * @param { proxy object } proxy
   */

  pushApp(proxy) {
    let isNotUnique = this.getAppByUuid(proxy.__uuid);
    if (isNotUnique) {
      throw new Error('Dublicate application uuid');
    }
    isNotUnique = this.getAppByName(proxy.name);
    if (isNotUnique) {
      throw new Error('Dublicate application name');
    }
    this.allApps.push(proxy);
  }

  /** 
   * Called when user touch application icon
   * In application list
   * @param { object } options
   */  

  touchApp(options) {
    let currentApp = this.getAppByName(options.name);
    if (currentApp) {
      if (!this.getAppByName(currentApp.name, this.activeApps)) {
        this.dispatcher.emit('open:app', {
          app: currentApp
        });
        this.activeApps.push(currentApp);
      }
      // create logic for open app
    } else {
      throw new Error('unknown application');
    }
  }

  closeApp(options) {
    this.activeApps.splice(this.allApps.indexOf(this.getAppByName(options.app.name)), 1);
  }
}