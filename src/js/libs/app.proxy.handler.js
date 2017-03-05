/**
 * Default handler for Proxying.
 * @module libs/app.proxy.handler
 * @see module:libs/proxying
 */

/** Class representing a default handler for applications Proxying. */
export default class AppProxyHandler {
  /**
   * Getter.
   * @return { any } target[prop] - Return true when try to get 'uuid.
   */
  get(target, prop) {
    if (prop == '__uuid') {
      return target.uuid;
    }
    if (prop == 'uuid') {
      return true;
    }
    return target[prop];
  }

  /**
   * Setter.
   * @return { any } value
   */

  set(target, prop, value) {
    if (prop == 'uuid' || prop == 'name') {
      throw new Error('You can\'t change \'uuid\' or \'name\'');
    } else {
      target[prop] = value;
      return true;
    }
  }

  deleteProperty(target, prop) {
    if (prop == 'uuid' || prop == 'name') {
      throw new Error('You can\'t delete \'uuid\' or \'name\'');
    }
  }
}