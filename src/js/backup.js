// this.dispatcher.on('create:new:app',          this.createNewApp, this);
// this.dispatcher.on('remove:app',              this.removeApp,    this);

  /** 
   * Check options and call static pushApp
   * method with options
   * @param { object } options
   */

  // createNewApp(options) {
  //   if (!options.app) {
  //     // TODO ::: Create Error Handler
  //     // see => link ::: https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Error
  //     // see => link ::: https://learn.javascript.ru/oop-errors 
  //     // see => link ::: http://expressjs.com/ru/guide/error-handling.html
  //     throw new Error(`With create:new:app event send app options
  //       ex. \'dispatcher.emit('create:new:app', {app: ...})\'`);
  //   }
  //   this.pushApp((new App(options.app)).app);
  //   log('create new app');
  // }

  /** 
   * Remove application from 'this.allApps'
   * @param { object } options
   */

  // removeApp(options) {
  //   if (!options || (options && !options.app)) {
  //     throw new Error(`With create:new:app event send app options
  //       ex. \'dispatcher.emit('create:new:app', {app: ...})\'`);      
  //   } else if (options.app) {
  //     this.allApps.splice(this.allApps.indexOf(this.getAppByUuid(options.app.uuid)), 1);
  //     log('remove app');
  //   }
  // }

  /** 
   * Get application by UUID from 'this.allApps'
   * @param { string } uuid
   * @return { object } application
   */

  // getAppByUuid(uuid) {
  //   return this.allApps.find(app => app.__uuid == uuid);
  // }

  /** 
   * Get application by NAME from 'this.allApps' by default
   * and from 'arr' when 'arr' is exists
   * @param { string } name
   * @param { array } arr
   * @return { object } application
   */

  // getAppByName(name, arr) {
  //   let queue;
  //   if (arr) {
  //     queue = arr;
  //   } else {
  //     queue = this.allApps;
  //   }
  //   return queue.find(app => app.name == name);
  // }

  /** 
   * Add aplication proxy in 'this.allApps'
   * @param { proxy object } proxy
   */

  // pushApp(proxy) {
  //   let isNotUnique = this.getAppByUuid(proxy.__uuid);
  //   if (isNotUnique) {
  //     throw new Error('Dublicate application uuid');
  //   }
  //   isNotUnique = this.getAppByName(proxy.name);
  //   if (isNotUnique) {
  //     throw new Error('Dublicate application name');
  //   }
  //   this.allApps.push(proxy);
  // }
    // this.activeApps.splice(this.allApps.indexOf(this.getAppByName(options.app.name)), 1);
   