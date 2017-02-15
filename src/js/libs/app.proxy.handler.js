export default class AppProxyHandler {
  get(target, prop) {
    if (prop == '__uuid') {
      return target.uuid;
    }
    if (prop == 'uuid') {
      return true;
    }
    return target[prop];
  }

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