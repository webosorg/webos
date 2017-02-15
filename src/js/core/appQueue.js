import proxying from '../libs/proxying.js';

export default class AppQueue {
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
    this.name = 'webos-app-queue';
    this.queue = [];
    this.dispatcher.on('create:new:app', this.createNewApp, this);
    this.dispatcher.on('remove:app', this.removeApp, this);
  }

  createNewApp(options) {
    if (!options.app) {
      throw new Error(`With create:new:app event send app options
        ex. \'dispatcher.emit('create:new:app', {app: ...})\'`);
    }
    this.pushApp(proxying(options.app))
    // function 'proxying' can get second argument which your custom
    // Proxy handler
    // TODO ::: Create restricting logic for marge custom and
    // default Proxy handler
    // => see ::: /libs/proxying.js
  }

  removeApp(options) {
    if (!options || (options && !options.app)) {
      throw new Error(`With create:new:app event send app options
        ex. \'dispatcher.emit('create:new:app', {app: ...})\'`);      
    } else if (options.app) {
      this.queue.splice(this.queue.indexOf(this.getAppByUuid(options.app.uuid)), 1);
    }
  }

  getAppByUuid(uuid) {
    return this.queue.find(app => app.__uuid == uuid);
  }

  getAppByName(name) {
    return this.queue.find(app => app.name == name);
  }

  pushApp(proxy) {
    let isNotUnique = this.getAppByUuid(proxy.__uuid);
    if (isNotUnique) {
      throw new Error('Dublicate application uuid');
    }
    isNotUnique = this.getAppByName(proxy.name);
    if (isNotUnique) {
      throw new Error('Dublicate application name');
    }
    this.queue.push(proxy);
  }
}