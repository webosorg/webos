/**
 * Module for Proxying.
 * @module libs/proxying
 */

import AppProxyHandler from './app.proxy.handler.js';

/**
 * Wrap on proxy object.
 * @param { object } app - The application which must wrap on proxy object.
 * @param { Object } options - The options which can contain proxy handler.
 * @return { Proxy object } - Proxy object with current application and handler from
 * options or default (@see module:libs/app.proxy.handler)
 */

export default function proxying(app, options) {
  let handler;
  if (!options || (options && !options.handler)) {
    // default handler
    handler = new AppProxyHandler;
  } else if (options.handler) {
    handler = Object.assign(new AppProxyHandler, options.handler);
  }
  return new Proxy(app, handler);
}
