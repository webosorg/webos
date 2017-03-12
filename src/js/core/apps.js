/**
 * Applications Collection.
 * @module core/apps
 * @see module:core/init
 */

import debug from 'debug';

const log = debug('webos-apps:log');
// Disable logging in production
if (ENV !== 'production') {
  debug.enable('*');
} else {
  debug.disable();
}

import Collection     from './collections/collection.js';

import DockApps       from './collections/dockApps.js';

import ActiveApps     from './collections/activeApps.js';

import defaultApps    from '../apps/defaults.js';

/** Class Apps representing a webos applications collection. */

export default class Apps {
  /**
   * Create a dispatcher, name, allApps, activeApps, dockApps and call _installListeners.
   * @param { Dispatcher } dispatcher - The main dispatcher.
   */
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
    this.name       = 'webos-app-collection';
    this.allApps    = new Collection(this.dispatcher);
    this.dockApps   = new DockApps(this.dispatcher);
    this.activeApps = new ActiveApps(this.dispatcher);
    this._installListeners();
    log('Create webos apps');
  }
  /**
   * Set the listeners.
   */
  _installListeners() {
    this.dispatcher.on('app:touch',               this.touchApp,     this);
    this.dispatcher.on('ready:component:appList', this.readyAppList, this);
    this.dispatcher.on('close:app',               this.closeApp,     this);
  }

  /**
   * Set the default applications.
   */
  initializeApps() {
    defaultApps.forEach(app => {
      this.allApps.push(app);

      // if application have dockApp flag in 'true'
      // that application add to dockApps collection
      // and will show in 'dock' panel

      if (app.dockApp) {
        this.dockApps.push(app);
      }
    });
  }

  /**
   * When ready application list component (dock panel) 
   * set the default applications.
   */
  readyAppList() {
    this.initializeApps();
  }

  /** 
   * Called when user touch application icon
   * In application list(dock)
   * @param { object } options
   */  

  touchApp(options) {
    let app = this.allApps.getByName(options.name);
    if (app) {
      if (!this.activeApps.getByName(app.name)) {
        this.activeApps.push(app);
      }
    } else {
      throw new Error('unknown application');
    }
  }

  closeApp(options) {
    let app = this.allApps.getByName(options.app.name);
    if (app) {
      this.activeApps.remove(app.name);
    } else {
      throw new Error('unknown application');
    }
  }
}