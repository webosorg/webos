import AppProxyHandler from './app.proxy.handler.js';

export default function proxying(item, options) {
  let handler;
  if (!options || (options && !options.handler)) {
    // default handler
    handler = new AppProxyHandler;
  } else if (options.handler) {
    handler = Object.assign(new AppProxyHandler, options.handler);
  }
  return new Proxy(item, handler);
}