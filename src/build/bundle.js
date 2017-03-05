(function () {
'use strict';

function __$styleInject(css, returnValue) {
  if (typeof document === 'undefined') {
    return returnValue;
  }
  css = css || '';
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  head.appendChild(style);
  return returnValue;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

var index = function (val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val)
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ?
			fmtLong(val) :
			fmtShort(val)
  }
  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val))
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 10000) {
    return
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) {
    return
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y
    case 'days':
    case 'day':
    case 'd':
      return n * d
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n
    default:
      return undefined
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd'
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h'
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm'
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's'
  }
  return ms + 'ms'
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms'
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name
  }
  return Math.ceil(ms / n) + ' ' + name + 's'
}

var debug$1 = createCommonjsModule(function (module, exports) {
/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug.default = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = index;

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index$$1 = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index$$1++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index$$1];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index$$1, 1);
        index$$1--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}
});

var browser$1 = createCommonjsModule(function (module, exports) {
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug$1;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window && typeof window.process !== 'undefined' && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document && 'WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window && window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit');

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  try {
    return exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (typeof process !== 'undefined' && 'env' in process) {
    return process.env.DEBUG;
  }
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}
});

var index$2 = createCommonjsModule(function (module) {
'use strict';

var has = Object.prototype.hasOwnProperty
  , prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @api private
 */
function Events() {}

//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
if (Object.create) {
  Events.prototype = Object.create(null);

  //
  // This hack is needed because the `__proto__` property is still inherited in
  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //
  if (!new Events().__proto__) prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {Mixed} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var names = []
    , events
    , name;

  if (this._eventsCount === 0) return names;

  for (name in (events = this._events)) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Boolean} exists Only check if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn The listener function.
 * @param {Mixed} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
  else if (!this._events[evt].fn) this._events[evt].push(listener);
  else this._events[evt] = [this._events[evt], listener];

  return this;
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn The listener function.
 * @param {Mixed} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
  else if (!this._events[evt].fn) this._events[evt].push(listener);
  else this._events[evt] = [this._events[evt], listener];

  return this;
};

/**
 * Remove the listeners of a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {Mixed} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return this;
  if (!fn) {
    if (--this._eventsCount === 0) this._events = new Events();
    else delete this._events[evt];
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (
         listeners.fn === fn
      && (!once || listeners.once)
      && (!context || listeners.context === context)
    ) {
      if (--this._eventsCount === 0) this._events = new Events();
      else delete this._events[evt];
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (
           listeners[i].fn !== fn
        || (once && !listeners[i].once)
        || (context && listeners[i].context !== context)
      ) {
        events.push(listeners[i]);
      }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    else if (--this._eventsCount === 0) this._events = new Events();
    else delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {String|Symbol} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = prefix ? prefix + event : event;
    if (this._events[evt]) {
      if (--this._eventsCount === 0) this._events = new Events();
      else delete this._events[evt];
    }
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;

//
// Expose the module.
//
{
  module.exports = EventEmitter;
}
});

/**
 * The dispatcher for webos.
 * @module core/dispatcher
 */
const log$1 = browser$1('dispatcher:log');
// Disable logging in production
{
  browser$1.enable('*');
}

class Dispatcher extends index$2 {
  constructor() {
    super();
    log$1('Dispatcher Create');
  }
}

/**
 * Default handler for Proxying.
 * @module libs/app.proxy.handler
 * @see module:libs/proxying
 */

/** Class representing a default handler for applications Proxying. */
class AppProxyHandler {
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

/**
 * Module for Proxying.
 * @module libs/proxying
 */

function proxying(app, options) {
  let handler;
  if (!options || (options && !options.handler)) {
    // default handler
    handler = new AppProxyHandler;
  } else if (options.handler) {
    handler = Object.assign(new AppProxyHandler, options.handler);
  }
  return new Proxy(app, handler);
}

/**
 * Applications Queue.
 * @module core/appQueue
 * @see module:core/init
 */

const log$2 = browser$1('appQueue:log');
// Disable logging in production
{
  browser$1.enable('*');
}

class Apps {
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
    log$2('create new app');
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
      log$2('remove app');
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
        this.dispatcher.emit('open:app', currentApp);
        this.activeApps.push(currentApp);
      }
      // create logic for open app
    } else {
      throw new Error('unknown application');
    }
  }
}

/**
 * Module for make worker source.
 * @module libs/workerSource.maker
 * @see module:core/process
 */

/** Class representing a worker source maker. */

class MakeWorkerSource {
  /**
   * Check options and call 'workerSource' method.
   * @param { object } options - Options for worker body. Can contain worker dependency and fn.
   */

  constructor(options) {
    this.options = options;
    if (options.deps) {
      this.deps = options.deps.join(',');
    } else {
      this.deps = '';
    }

    this.deps = "\'" + this.deps + "\'";
    this.workerSource();
  }

  /**
   * Make worker source.
   * @return { Function }
   */

  workerSource() {
    // TODO ::: Optimize this case
    return Function(
      `
      importScripts(${this.deps});
      let fn = ${this.options.fn};
      fn();
      `
    );
  }
}

/**
 * The process for webos.
 * @module core/process
 */
const log$3 = browser$1('process:log');
// Disable logging in production
{
  browser$1.enable('*');
}

/** Class representing a process for webos.
 *  @extends EventEmmiter3
 */

class Process {
  /**
   * Create a dispatcher, processes and _installListeners.
   * @param { Dispatcher } dispatcher - The main dispatcher.
   */
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
    this.processes = [];
    log$3('run Process class');
    this._installListeners();
  }

  /**
   * Set the listeners.
   */

  _installListeners() {
    this.dispatcher.on('create:new:process', this.newProcess, this);
  }

  /**
   * Method for create new process in webos.
   * @param { object } processBody - Process body can contain process dependencies and fn
   * @param { object } options - options can contain onmessage and onerror callbacks and terminate flag
   * @return { worker object } worker - return 'runWorker' method with 'processBody, options, true'
   * The 3th param in 'runWorker' method is promisify flag. Different between with 'create' and 'newProcess'
   * is theirs returned value. NOTE։ 'newProcess' method nothing returned. 
   */

  create(processBody, options) {
    return this.runWorker(processBody, options, true);
  }

  /**
   * Method for create new process in webos.
   * @param { object } processBody - Process body can contain process dependencies and fn
   * @param { object } options - options can contain onmessage and onerror callbacks and terminate flag
   */

  newProcess(processBody, options) {
    this.runWorker(processBody, options);
  }

  /**
   * Method for create new process in webos.
   * @param { object } processBody - Process body can contain process dependencies and fn
   * @param { object } options - options can contain onmessage and onerror callbacks and terminate flag
   */

  runWorker(processBody, options, promisify) {
    let worker;
    if (!processBody || (processBody && !processBody.fn)) {
      throw new Error(
      `
        With 'create:new:process' event you should send processBody
        ex.
        ...dispatcher.emit(
            'create:new:process', // or webOs.process.create(...);
            {
              deps: Array ::: (optional) ::: In this case you should write all dependency paths,
              fn: Function ::: (requires) ::: It is this function witch will run in new process          
            },
            {
              onmessage: Function ::: (optional) ::: It is worker onmessage callback,
              onerror: Function ::: (optional) ::: it is worker onerror callback,
              terminate: Boolean ::: (optional) ::: default => false ::: If this flag is true and
                                                    you have onmessage then after process job it will
                                                    be terminated, but when you havn't onmessage and want
                                                    terminate process you can kill it yourself in fn
                                                    callback :)
            }
          )
      `);
    } else if (typeof processBody.fn !== 'function') {
      throw new Error(`'fn' in new process should be Function`);
    } else if (processBody.deps && !Array.isArray(processBody.deps)) {
      throw new Error(`'deps' in new process should be Array`);
    } else {
      let workerSource = new MakeWorkerSource(processBody).workerSource();

      let code = workerSource.toString();

      code = code.substring(code.indexOf('{') + 1, code.lastIndexOf('}'));

      let blob = new Blob([code], {type: 'application/javascript'});
      worker = new Worker(URL.createObjectURL(blob));
      // create in processes
      this.processes.push(worker);

      if (options.onmessage) {
        if (typeof options.onmessage === 'function') {
          if (options.terminate) {
            if (typeof options.terminate === 'boolean') {
              worker.onmessage = function() {
                options.onmessage.apply(this, arguments);
                worker.terminate();
              };
            } else {
              throw new Error(`'terminate' in new process should be Boolean`);
            }
          } else {
            worker.onmessage = options.onmessage;
          }
        } else {
          throw new Error(`'onmessage' in new process should be Function`);
        }
      }

      if (options.onerror) {
        if (typeof options.onerror === 'function') {
          worker.onerror = options.onerror;
        } else {
          throw new Error(`'onerror' in new process should be Function`);
        }
      }
    }

    if (promisify && worker) {
      return worker;
    }
  }
}

/**
 * Main core module.
 * @module core/init
 */
let webOs = {};

webOs.dispatcher = new Dispatcher;

webOs.apps = new Apps(webOs.dispatcher);

webOs.process = new Process(webOs.dispatcher);

__$styleInject("body{color:green;margin:0;padding:0}",undefined);

// Add a debugger
const log$$1 = browser$1('app:log');
// Disable logging in production
{
  browser$1.enable('*');

  // For live reload
  document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] +
  ':35729/livereload.js?snipver=1"></' + 'script>');
}

log$$1('::: App Start :::');

window.webOs = webOs;

// Import styles
webOs.dispatcher.emit('create:new:app', {
  app: {
    name: 'webos-terminal',
    uuid: '22e1d'
  }
});

// test for create application
webOs.dispatcher.emit('create:new:app', {
  app: {
    name: 'webos-terminal-face',
    uuid: '31qwa',
    // test
    process: {
      new: true,
      // ....
    }
  }
});

// test for remove application
webOs.apps.removeApp({
  app: {
    uuid: '22e1d'
  }
});

// test for create new process with dependecies,
// fucntion and onmessage callback.
// for ...dispatcher.emit('create:new:process', ...) 
webOs.dispatcher.emit(
  'create:new:process',
  // process body
  {
    deps: ['https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js'],
    fn: () => {
      let arr = [];
      for (let i = 0; i < 1000000; i++) {
        arr.push(i);
      }
      let odds = _.filter(arr, (item) => {
        if (item % 2 != 0) {
          return item;
        }
      });

      postMessage({odds: odds});

      // this example for implementation process work from devtools by webOs.process.queue
      // for reproduce this write this line in devtools
      // webOs.process.queue[0].postMessage([1, 2, 3, 4]);
      // NOTE ։։։ Please be attentive it will be work when terminate flag is false 

      onmessage = (e) => {
        let result = _.filter(e.data, (item) => {
          if (item % 2 == 0) {
            return item;
          }
        });

        postMessage({evens: result});
      };
    }
  },
  // options
  {
    // onmessage
    onmessage(e) {
      log$$1('From another process ::: ', e.data);
    },
    // onerror
    onerror(err) {
      log$$1('From another process ::: ', err);
    },

    terminate: false
  }
);

// test for create new process with dependecies,
// fucntion and onmessage callback.
// for webOs.process.create(...)
webOs.process.create(
  // process body
  {
    deps: ['https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js'],
    fn: () => {
      let arr = [];
      for (let i = 0; i < 1000000; i++) {
        arr.push(i);
      }
      let odds = _.filter(arr, (item) => {
        if (item % 2 != 0) {
          return item;
        }
      });

      postMessage({odds: odds});

      // this example for implementation process work from devtools by webOs.process.queue
      // for reproduce this write this line in devtools
      // webOs.process.queue[0].postMessage([1, 2, 3, 4]);
      // NOTE ։։։ Please be attentive it will be work when terminate flag is false 

      onmessage = (e) => {
        let result = _.filter(e.data, (item) => {
          if (item % 2 == 0) {
            return item;
          }
        });

        postMessage({evens: result});
      };
    }
  },
  // options
  {
    // onmessage
    onmessage(e) {
      log$$1('From another process ::: ', e.data);
    },
    // onerror
    onerror(err) {
      log$$1('From another process ::: ', err);
    },

    terminate: false
  }
);

// Create main workers
// ...

// Test for new application with another process calc logic
// ...

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9ub2RlX21vZHVsZXMvbXMvaW5kZXguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZGVidWcvc3JjL2RlYnVnLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2RlYnVnL3NyYy9icm93c2VyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2V2ZW50ZW1pdHRlcjMvaW5kZXguanMiLCIuLi9qcy9jb3JlL2Rpc3BhdGNoZXIuanMiLCIuLi9qcy9saWJzL2FwcC5wcm94eS5oYW5kbGVyLmpzIiwiLi4vanMvbGlicy9wcm94eWluZy5qcyIsIi4uL2pzL2NvcmUvYXBwcy5qcyIsIi4uL2pzL2xpYnMvd29ya2VyU291cmNlLm1ha2VyLmpzIiwiLi4vanMvY29yZS9wcm9jZXNzLmpzIiwiLi4vanMvY29yZS9pbml0LmpzIiwiLi4vanMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEhlbHBlcnMuXG4gKi9cblxudmFyIHMgPSAxMDAwXG52YXIgbSA9IHMgKiA2MFxudmFyIGggPSBtICogNjBcbnZhciBkID0gaCAqIDI0XG52YXIgeSA9IGQgKiAzNjUuMjVcblxuLyoqXG4gKiBQYXJzZSBvciBmb3JtYXQgdGhlIGdpdmVuIGB2YWxgLlxuICpcbiAqIE9wdGlvbnM6XG4gKlxuICogIC0gYGxvbmdgIHZlcmJvc2UgZm9ybWF0dGluZyBbZmFsc2VdXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8TnVtYmVyfSB2YWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAdGhyb3dzIHtFcnJvcn0gdGhyb3cgYW4gZXJyb3IgaWYgdmFsIGlzIG5vdCBhIG5vbi1lbXB0eSBzdHJpbmcgb3IgYSBudW1iZXJcbiAqIEByZXR1cm4ge1N0cmluZ3xOdW1iZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHZhbCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWxcbiAgaWYgKHR5cGUgPT09ICdzdHJpbmcnICYmIHZhbC5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHBhcnNlKHZhbClcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiBpc05hTih2YWwpID09PSBmYWxzZSkge1xuICAgIHJldHVybiBvcHRpb25zLmxvbmcgP1xuXHRcdFx0Zm10TG9uZyh2YWwpIDpcblx0XHRcdGZtdFNob3J0KHZhbClcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ3ZhbCBpcyBub3QgYSBub24tZW1wdHkgc3RyaW5nIG9yIGEgdmFsaWQgbnVtYmVyLiB2YWw9JyArIEpTT04uc3RyaW5naWZ5KHZhbCkpXG59XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGBzdHJgIGFuZCByZXR1cm4gbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICBzdHIgPSBTdHJpbmcoc3RyKVxuICBpZiAoc3RyLmxlbmd0aCA+IDEwMDAwKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgdmFyIG1hdGNoID0gL14oKD86XFxkKyk/XFwuP1xcZCspICoobWlsbGlzZWNvbmRzP3xtc2Vjcz98bXN8c2Vjb25kcz98c2Vjcz98c3xtaW51dGVzP3xtaW5zP3xtfGhvdXJzP3xocnM/fGh8ZGF5cz98ZHx5ZWFycz98eXJzP3x5KT8kL2kuZXhlYyhzdHIpXG4gIGlmICghbWF0Y2gpIHtcbiAgICByZXR1cm5cbiAgfVxuICB2YXIgbiA9IHBhcnNlRmxvYXQobWF0Y2hbMV0pXG4gIHZhciB0eXBlID0gKG1hdGNoWzJdIHx8ICdtcycpLnRvTG93ZXJDYXNlKClcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAneWVhcnMnOlxuICAgIGNhc2UgJ3llYXInOlxuICAgIGNhc2UgJ3lycyc6XG4gICAgY2FzZSAneXInOlxuICAgIGNhc2UgJ3knOlxuICAgICAgcmV0dXJuIG4gKiB5XG4gICAgY2FzZSAnZGF5cyc6XG4gICAgY2FzZSAnZGF5JzpcbiAgICBjYXNlICdkJzpcbiAgICAgIHJldHVybiBuICogZFxuICAgIGNhc2UgJ2hvdXJzJzpcbiAgICBjYXNlICdob3VyJzpcbiAgICBjYXNlICdocnMnOlxuICAgIGNhc2UgJ2hyJzpcbiAgICBjYXNlICdoJzpcbiAgICAgIHJldHVybiBuICogaFxuICAgIGNhc2UgJ21pbnV0ZXMnOlxuICAgIGNhc2UgJ21pbnV0ZSc6XG4gICAgY2FzZSAnbWlucyc6XG4gICAgY2FzZSAnbWluJzpcbiAgICBjYXNlICdtJzpcbiAgICAgIHJldHVybiBuICogbVxuICAgIGNhc2UgJ3NlY29uZHMnOlxuICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgY2FzZSAnc2Vjcyc6XG4gICAgY2FzZSAnc2VjJzpcbiAgICBjYXNlICdzJzpcbiAgICAgIHJldHVybiBuICogc1xuICAgIGNhc2UgJ21pbGxpc2Vjb25kcyc6XG4gICAgY2FzZSAnbWlsbGlzZWNvbmQnOlxuICAgIGNhc2UgJ21zZWNzJzpcbiAgICBjYXNlICdtc2VjJzpcbiAgICBjYXNlICdtcyc6XG4gICAgICByZXR1cm4gblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cbn1cblxuLyoqXG4gKiBTaG9ydCBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBmbXRTaG9ydChtcykge1xuICBpZiAobXMgPj0gZCkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gZCkgKyAnZCdcbiAgfVxuICBpZiAobXMgPj0gaCkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gaCkgKyAnaCdcbiAgfVxuICBpZiAobXMgPj0gbSkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gbSkgKyAnbSdcbiAgfVxuICBpZiAobXMgPj0gcykge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gcykgKyAncydcbiAgfVxuICByZXR1cm4gbXMgKyAnbXMnXG59XG5cbi8qKlxuICogTG9uZyBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBmbXRMb25nKG1zKSB7XG4gIHJldHVybiBwbHVyYWwobXMsIGQsICdkYXknKSB8fFxuICAgIHBsdXJhbChtcywgaCwgJ2hvdXInKSB8fFxuICAgIHBsdXJhbChtcywgbSwgJ21pbnV0ZScpIHx8XG4gICAgcGx1cmFsKG1zLCBzLCAnc2Vjb25kJykgfHxcbiAgICBtcyArICcgbXMnXG59XG5cbi8qKlxuICogUGx1cmFsaXphdGlvbiBoZWxwZXIuXG4gKi9cblxuZnVuY3Rpb24gcGx1cmFsKG1zLCBuLCBuYW1lKSB7XG4gIGlmIChtcyA8IG4pIHtcbiAgICByZXR1cm5cbiAgfVxuICBpZiAobXMgPCBuICogMS41KSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IobXMgLyBuKSArICcgJyArIG5hbWVcbiAgfVxuICByZXR1cm4gTWF0aC5jZWlsKG1zIC8gbikgKyAnICcgKyBuYW1lICsgJ3MnXG59XG4iLCJcbi8qKlxuICogVGhpcyBpcyB0aGUgY29tbW9uIGxvZ2ljIGZvciBib3RoIHRoZSBOb2RlLmpzIGFuZCB3ZWIgYnJvd3NlclxuICogaW1wbGVtZW50YXRpb25zIG9mIGBkZWJ1ZygpYC5cbiAqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gY3JlYXRlRGVidWcuZGVidWcgPSBjcmVhdGVEZWJ1Zy5kZWZhdWx0ID0gY3JlYXRlRGVidWc7XG5leHBvcnRzLmNvZXJjZSA9IGNvZXJjZTtcbmV4cG9ydHMuZGlzYWJsZSA9IGRpc2FibGU7XG5leHBvcnRzLmVuYWJsZSA9IGVuYWJsZTtcbmV4cG9ydHMuZW5hYmxlZCA9IGVuYWJsZWQ7XG5leHBvcnRzLmh1bWFuaXplID0gcmVxdWlyZSgnbXMnKTtcblxuLyoqXG4gKiBUaGUgY3VycmVudGx5IGFjdGl2ZSBkZWJ1ZyBtb2RlIG5hbWVzLCBhbmQgbmFtZXMgdG8gc2tpcC5cbiAqL1xuXG5leHBvcnRzLm5hbWVzID0gW107XG5leHBvcnRzLnNraXBzID0gW107XG5cbi8qKlxuICogTWFwIG9mIHNwZWNpYWwgXCIlblwiIGhhbmRsaW5nIGZ1bmN0aW9ucywgZm9yIHRoZSBkZWJ1ZyBcImZvcm1hdFwiIGFyZ3VtZW50LlxuICpcbiAqIFZhbGlkIGtleSBuYW1lcyBhcmUgYSBzaW5nbGUsIGxvd2VyIG9yIHVwcGVyLWNhc2UgbGV0dGVyLCBpLmUuIFwiblwiIGFuZCBcIk5cIi5cbiAqL1xuXG5leHBvcnRzLmZvcm1hdHRlcnMgPSB7fTtcblxuLyoqXG4gKiBQcmV2aW91cyBsb2cgdGltZXN0YW1wLlxuICovXG5cbnZhciBwcmV2VGltZTtcblxuLyoqXG4gKiBTZWxlY3QgYSBjb2xvci5cbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlbGVjdENvbG9yKG5hbWVzcGFjZSkge1xuICB2YXIgaGFzaCA9IDAsIGk7XG5cbiAgZm9yIChpIGluIG5hbWVzcGFjZSkge1xuICAgIGhhc2ggID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgKyBuYW1lc3BhY2UuY2hhckNvZGVBdChpKTtcbiAgICBoYXNoIHw9IDA7IC8vIENvbnZlcnQgdG8gMzJiaXQgaW50ZWdlclxuICB9XG5cbiAgcmV0dXJuIGV4cG9ydHMuY29sb3JzW01hdGguYWJzKGhhc2gpICUgZXhwb3J0cy5jb2xvcnMubGVuZ3RoXTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBkZWJ1Z2dlciB3aXRoIHRoZSBnaXZlbiBgbmFtZXNwYWNlYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gY3JlYXRlRGVidWcobmFtZXNwYWNlKSB7XG5cbiAgZnVuY3Rpb24gZGVidWcoKSB7XG4gICAgLy8gZGlzYWJsZWQ/XG4gICAgaWYgKCFkZWJ1Zy5lbmFibGVkKSByZXR1cm47XG5cbiAgICB2YXIgc2VsZiA9IGRlYnVnO1xuXG4gICAgLy8gc2V0IGBkaWZmYCB0aW1lc3RhbXBcbiAgICB2YXIgY3VyciA9ICtuZXcgRGF0ZSgpO1xuICAgIHZhciBtcyA9IGN1cnIgLSAocHJldlRpbWUgfHwgY3Vycik7XG4gICAgc2VsZi5kaWZmID0gbXM7XG4gICAgc2VsZi5wcmV2ID0gcHJldlRpbWU7XG4gICAgc2VsZi5jdXJyID0gY3VycjtcbiAgICBwcmV2VGltZSA9IGN1cnI7XG5cbiAgICAvLyB0dXJuIHRoZSBgYXJndW1lbnRzYCBpbnRvIGEgcHJvcGVyIEFycmF5XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGFyZ3NbMF0gPSBleHBvcnRzLmNvZXJjZShhcmdzWzBdKTtcblxuICAgIGlmICgnc3RyaW5nJyAhPT0gdHlwZW9mIGFyZ3NbMF0pIHtcbiAgICAgIC8vIGFueXRoaW5nIGVsc2UgbGV0J3MgaW5zcGVjdCB3aXRoICVPXG4gICAgICBhcmdzLnVuc2hpZnQoJyVPJyk7XG4gICAgfVxuXG4gICAgLy8gYXBwbHkgYW55IGBmb3JtYXR0ZXJzYCB0cmFuc2Zvcm1hdGlvbnNcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIGFyZ3NbMF0gPSBhcmdzWzBdLnJlcGxhY2UoLyUoW2EtekEtWiVdKS9nLCBmdW5jdGlvbihtYXRjaCwgZm9ybWF0KSB7XG4gICAgICAvLyBpZiB3ZSBlbmNvdW50ZXIgYW4gZXNjYXBlZCAlIHRoZW4gZG9uJ3QgaW5jcmVhc2UgdGhlIGFycmF5IGluZGV4XG4gICAgICBpZiAobWF0Y2ggPT09ICclJScpIHJldHVybiBtYXRjaDtcbiAgICAgIGluZGV4Kys7XG4gICAgICB2YXIgZm9ybWF0dGVyID0gZXhwb3J0cy5mb3JtYXR0ZXJzW2Zvcm1hdF07XG4gICAgICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGZvcm1hdHRlcikge1xuICAgICAgICB2YXIgdmFsID0gYXJnc1tpbmRleF07XG4gICAgICAgIG1hdGNoID0gZm9ybWF0dGVyLmNhbGwoc2VsZiwgdmFsKTtcblxuICAgICAgICAvLyBub3cgd2UgbmVlZCB0byByZW1vdmUgYGFyZ3NbaW5kZXhdYCBzaW5jZSBpdCdzIGlubGluZWQgaW4gdGhlIGBmb3JtYXRgXG4gICAgICAgIGFyZ3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgaW5kZXgtLTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9KTtcblxuICAgIC8vIGFwcGx5IGVudi1zcGVjaWZpYyBmb3JtYXR0aW5nIChjb2xvcnMsIGV0Yy4pXG4gICAgZXhwb3J0cy5mb3JtYXRBcmdzLmNhbGwoc2VsZiwgYXJncyk7XG5cbiAgICB2YXIgbG9nRm4gPSBkZWJ1Zy5sb2cgfHwgZXhwb3J0cy5sb2cgfHwgY29uc29sZS5sb2cuYmluZChjb25zb2xlKTtcbiAgICBsb2dGbi5hcHBseShzZWxmLCBhcmdzKTtcbiAgfVxuXG4gIGRlYnVnLm5hbWVzcGFjZSA9IG5hbWVzcGFjZTtcbiAgZGVidWcuZW5hYmxlZCA9IGV4cG9ydHMuZW5hYmxlZChuYW1lc3BhY2UpO1xuICBkZWJ1Zy51c2VDb2xvcnMgPSBleHBvcnRzLnVzZUNvbG9ycygpO1xuICBkZWJ1Zy5jb2xvciA9IHNlbGVjdENvbG9yKG5hbWVzcGFjZSk7XG5cbiAgLy8gZW52LXNwZWNpZmljIGluaXRpYWxpemF0aW9uIGxvZ2ljIGZvciBkZWJ1ZyBpbnN0YW5jZXNcbiAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBleHBvcnRzLmluaXQpIHtcbiAgICBleHBvcnRzLmluaXQoZGVidWcpO1xuICB9XG5cbiAgcmV0dXJuIGRlYnVnO1xufVxuXG4vKipcbiAqIEVuYWJsZXMgYSBkZWJ1ZyBtb2RlIGJ5IG5hbWVzcGFjZXMuIFRoaXMgY2FuIGluY2x1ZGUgbW9kZXNcbiAqIHNlcGFyYXRlZCBieSBhIGNvbG9uIGFuZCB3aWxkY2FyZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZW5hYmxlKG5hbWVzcGFjZXMpIHtcbiAgZXhwb3J0cy5zYXZlKG5hbWVzcGFjZXMpO1xuXG4gIHZhciBzcGxpdCA9IChuYW1lc3BhY2VzIHx8ICcnKS5zcGxpdCgvW1xccyxdKy8pO1xuICB2YXIgbGVuID0gc3BsaXQubGVuZ3RoO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoIXNwbGl0W2ldKSBjb250aW51ZTsgLy8gaWdub3JlIGVtcHR5IHN0cmluZ3NcbiAgICBuYW1lc3BhY2VzID0gc3BsaXRbaV0ucmVwbGFjZSgvXFwqL2csICcuKj8nKTtcbiAgICBpZiAobmFtZXNwYWNlc1swXSA9PT0gJy0nKSB7XG4gICAgICBleHBvcnRzLnNraXBzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lc3BhY2VzLnN1YnN0cigxKSArICckJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleHBvcnRzLm5hbWVzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lc3BhY2VzICsgJyQnKSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRGlzYWJsZSBkZWJ1ZyBvdXRwdXQuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkaXNhYmxlKCkge1xuICBleHBvcnRzLmVuYWJsZSgnJyk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBtb2RlIG5hbWUgaXMgZW5hYmxlZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBlbmFibGVkKG5hbWUpIHtcbiAgdmFyIGksIGxlbjtcbiAgZm9yIChpID0gMCwgbGVuID0gZXhwb3J0cy5za2lwcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChleHBvcnRzLnNraXBzW2ldLnRlc3QobmFtZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgZm9yIChpID0gMCwgbGVuID0gZXhwb3J0cy5uYW1lcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChleHBvcnRzLm5hbWVzW2ldLnRlc3QobmFtZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogQ29lcmNlIGB2YWxgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBjb2VyY2UodmFsKSB7XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBFcnJvcikgcmV0dXJuIHZhbC5zdGFjayB8fCB2YWwubWVzc2FnZTtcbiAgcmV0dXJuIHZhbDtcbn1cbiIsIi8qKlxuICogVGhpcyBpcyB0aGUgd2ViIGJyb3dzZXIgaW1wbGVtZW50YXRpb24gb2YgYGRlYnVnKClgLlxuICpcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2RlYnVnJyk7XG5leHBvcnRzLmxvZyA9IGxvZztcbmV4cG9ydHMuZm9ybWF0QXJncyA9IGZvcm1hdEFyZ3M7XG5leHBvcnRzLnNhdmUgPSBzYXZlO1xuZXhwb3J0cy5sb2FkID0gbG9hZDtcbmV4cG9ydHMudXNlQ29sb3JzID0gdXNlQ29sb3JzO1xuZXhwb3J0cy5zdG9yYWdlID0gJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZVxuICAgICAgICAgICAgICAgJiYgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZS5zdG9yYWdlXG4gICAgICAgICAgICAgICAgICA/IGNocm9tZS5zdG9yYWdlLmxvY2FsXG4gICAgICAgICAgICAgICAgICA6IGxvY2Fsc3RvcmFnZSgpO1xuXG4vKipcbiAqIENvbG9ycy5cbiAqL1xuXG5leHBvcnRzLmNvbG9ycyA9IFtcbiAgJ2xpZ2h0c2VhZ3JlZW4nLFxuICAnZm9yZXN0Z3JlZW4nLFxuICAnZ29sZGVucm9kJyxcbiAgJ2RvZGdlcmJsdWUnLFxuICAnZGFya29yY2hpZCcsXG4gICdjcmltc29uJ1xuXTtcblxuLyoqXG4gKiBDdXJyZW50bHkgb25seSBXZWJLaXQtYmFzZWQgV2ViIEluc3BlY3RvcnMsIEZpcmVmb3ggPj0gdjMxLFxuICogYW5kIHRoZSBGaXJlYnVnIGV4dGVuc2lvbiAoYW55IEZpcmVmb3ggdmVyc2lvbikgYXJlIGtub3duXG4gKiB0byBzdXBwb3J0IFwiJWNcIiBDU1MgY3VzdG9taXphdGlvbnMuXG4gKlxuICogVE9ETzogYWRkIGEgYGxvY2FsU3RvcmFnZWAgdmFyaWFibGUgdG8gZXhwbGljaXRseSBlbmFibGUvZGlzYWJsZSBjb2xvcnNcbiAqL1xuXG5mdW5jdGlvbiB1c2VDb2xvcnMoKSB7XG4gIC8vIE5COiBJbiBhbiBFbGVjdHJvbiBwcmVsb2FkIHNjcmlwdCwgZG9jdW1lbnQgd2lsbCBiZSBkZWZpbmVkIGJ1dCBub3QgZnVsbHlcbiAgLy8gaW5pdGlhbGl6ZWQuIFNpbmNlIHdlIGtub3cgd2UncmUgaW4gQ2hyb21lLCB3ZSdsbCBqdXN0IGRldGVjdCB0aGlzIGNhc2VcbiAgLy8gZXhwbGljaXRseVxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93ICYmIHR5cGVvZiB3aW5kb3cucHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnByb2Nlc3MudHlwZSA9PT0gJ3JlbmRlcmVyJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gaXMgd2Via2l0PyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNjQ1OTYwNi8zNzY3NzNcbiAgLy8gZG9jdW1lbnQgaXMgdW5kZWZpbmVkIGluIHJlYWN0LW5hdGl2ZTogaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0LW5hdGl2ZS9wdWxsLzE2MzJcbiAgcmV0dXJuICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50ICYmICdXZWJraXRBcHBlYXJhbmNlJyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUpIHx8XG4gICAgLy8gaXMgZmlyZWJ1Zz8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzk4MTIwLzM3Njc3M1xuICAgICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cgJiYgd2luZG93LmNvbnNvbGUgJiYgKGNvbnNvbGUuZmlyZWJ1ZyB8fCAoY29uc29sZS5leGNlcHRpb24gJiYgY29uc29sZS50YWJsZSkpKSB8fFxuICAgIC8vIGlzIGZpcmVmb3ggPj0gdjMxP1xuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvVG9vbHMvV2ViX0NvbnNvbGUjU3R5bGluZ19tZXNzYWdlc1xuICAgICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkubWF0Y2goL2ZpcmVmb3hcXC8oXFxkKykvKSAmJiBwYXJzZUludChSZWdFeHAuJDEsIDEwKSA+PSAzMSkgfHxcbiAgICAvLyBkb3VibGUgY2hlY2sgd2Via2l0IGluIHVzZXJBZ2VudCBqdXN0IGluIGNhc2Ugd2UgYXJlIGluIGEgd29ya2VyXG4gICAgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIG5hdmlnYXRvciAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvYXBwbGV3ZWJraXRcXC8oXFxkKykvKSk7XG59XG5cbi8qKlxuICogTWFwICVqIHRvIGBKU09OLnN0cmluZ2lmeSgpYCwgc2luY2Ugbm8gV2ViIEluc3BlY3RvcnMgZG8gdGhhdCBieSBkZWZhdWx0LlxuICovXG5cbmV4cG9ydHMuZm9ybWF0dGVycy5qID0gZnVuY3Rpb24odikge1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuICdbVW5leHBlY3RlZEpTT05QYXJzZUVycm9yXTogJyArIGVyci5tZXNzYWdlO1xuICB9XG59O1xuXG5cbi8qKlxuICogQ29sb3JpemUgbG9nIGFyZ3VtZW50cyBpZiBlbmFibGVkLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZm9ybWF0QXJncyhhcmdzKSB7XG4gIHZhciB1c2VDb2xvcnMgPSB0aGlzLnVzZUNvbG9ycztcblxuICBhcmdzWzBdID0gKHVzZUNvbG9ycyA/ICclYycgOiAnJylcbiAgICArIHRoaXMubmFtZXNwYWNlXG4gICAgKyAodXNlQ29sb3JzID8gJyAlYycgOiAnICcpXG4gICAgKyBhcmdzWzBdXG4gICAgKyAodXNlQ29sb3JzID8gJyVjICcgOiAnICcpXG4gICAgKyAnKycgKyBleHBvcnRzLmh1bWFuaXplKHRoaXMuZGlmZik7XG5cbiAgaWYgKCF1c2VDb2xvcnMpIHJldHVybjtcblxuICB2YXIgYyA9ICdjb2xvcjogJyArIHRoaXMuY29sb3I7XG4gIGFyZ3Muc3BsaWNlKDEsIDAsIGMsICdjb2xvcjogaW5oZXJpdCcpXG5cbiAgLy8gdGhlIGZpbmFsIFwiJWNcIiBpcyBzb21ld2hhdCB0cmlja3ksIGJlY2F1c2UgdGhlcmUgY291bGQgYmUgb3RoZXJcbiAgLy8gYXJndW1lbnRzIHBhc3NlZCBlaXRoZXIgYmVmb3JlIG9yIGFmdGVyIHRoZSAlYywgc28gd2UgbmVlZCB0b1xuICAvLyBmaWd1cmUgb3V0IHRoZSBjb3JyZWN0IGluZGV4IHRvIGluc2VydCB0aGUgQ1NTIGludG9cbiAgdmFyIGluZGV4ID0gMDtcbiAgdmFyIGxhc3RDID0gMDtcbiAgYXJnc1swXS5yZXBsYWNlKC8lW2EtekEtWiVdL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgaWYgKCclJScgPT09IG1hdGNoKSByZXR1cm47XG4gICAgaW5kZXgrKztcbiAgICBpZiAoJyVjJyA9PT0gbWF0Y2gpIHtcbiAgICAgIC8vIHdlIG9ubHkgYXJlIGludGVyZXN0ZWQgaW4gdGhlICpsYXN0KiAlY1xuICAgICAgLy8gKHRoZSB1c2VyIG1heSBoYXZlIHByb3ZpZGVkIHRoZWlyIG93bilcbiAgICAgIGxhc3RDID0gaW5kZXg7XG4gICAgfVxuICB9KTtcblxuICBhcmdzLnNwbGljZShsYXN0QywgMCwgYyk7XG59XG5cbi8qKlxuICogSW52b2tlcyBgY29uc29sZS5sb2coKWAgd2hlbiBhdmFpbGFibGUuXG4gKiBOby1vcCB3aGVuIGBjb25zb2xlLmxvZ2AgaXMgbm90IGEgXCJmdW5jdGlvblwiLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gbG9nKCkge1xuICAvLyB0aGlzIGhhY2tlcnkgaXMgcmVxdWlyZWQgZm9yIElFOC85LCB3aGVyZVxuICAvLyB0aGUgYGNvbnNvbGUubG9nYCBmdW5jdGlvbiBkb2Vzbid0IGhhdmUgJ2FwcGx5J1xuICByZXR1cm4gJ29iamVjdCcgPT09IHR5cGVvZiBjb25zb2xlXG4gICAgJiYgY29uc29sZS5sb2dcbiAgICAmJiBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKTtcbn1cblxuLyoqXG4gKiBTYXZlIGBuYW1lc3BhY2VzYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2F2ZShuYW1lc3BhY2VzKSB7XG4gIHRyeSB7XG4gICAgaWYgKG51bGwgPT0gbmFtZXNwYWNlcykge1xuICAgICAgZXhwb3J0cy5zdG9yYWdlLnJlbW92ZUl0ZW0oJ2RlYnVnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4cG9ydHMuc3RvcmFnZS5kZWJ1ZyA9IG5hbWVzcGFjZXM7XG4gICAgfVxuICB9IGNhdGNoKGUpIHt9XG59XG5cbi8qKlxuICogTG9hZCBgbmFtZXNwYWNlc2AuXG4gKlxuICogQHJldHVybiB7U3RyaW5nfSByZXR1cm5zIHRoZSBwcmV2aW91c2x5IHBlcnNpc3RlZCBkZWJ1ZyBtb2Rlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbG9hZCgpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZXhwb3J0cy5zdG9yYWdlLmRlYnVnO1xuICB9IGNhdGNoKGUpIHt9XG5cbiAgLy8gSWYgZGVidWcgaXNuJ3Qgc2V0IGluIExTLCBhbmQgd2UncmUgaW4gRWxlY3Ryb24sIHRyeSB0byBsb2FkICRERUJVR1xuICBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmICdlbnYnIGluIHByb2Nlc3MpIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5lbnYuREVCVUc7XG4gIH1cbn1cblxuLyoqXG4gKiBFbmFibGUgbmFtZXNwYWNlcyBsaXN0ZWQgaW4gYGxvY2FsU3RvcmFnZS5kZWJ1Z2AgaW5pdGlhbGx5LlxuICovXG5cbmV4cG9ydHMuZW5hYmxlKGxvYWQoKSk7XG5cbi8qKlxuICogTG9jYWxzdG9yYWdlIGF0dGVtcHRzIHRvIHJldHVybiB0aGUgbG9jYWxzdG9yYWdlLlxuICpcbiAqIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2Ugc2FmYXJpIHRocm93c1xuICogd2hlbiBhIHVzZXIgZGlzYWJsZXMgY29va2llcy9sb2NhbHN0b3JhZ2VcbiAqIGFuZCB5b3UgYXR0ZW1wdCB0byBhY2Nlc3MgaXQuXG4gKlxuICogQHJldHVybiB7TG9jYWxTdG9yYWdlfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbG9jYWxzdG9yYWdlKCkge1xuICB0cnkge1xuICAgIHJldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlO1xuICB9IGNhdGNoIChlKSB7fVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxuICAsIHByZWZpeCA9ICd+JztcblxuLyoqXG4gKiBDb25zdHJ1Y3RvciB0byBjcmVhdGUgYSBzdG9yYWdlIGZvciBvdXIgYEVFYCBvYmplY3RzLlxuICogQW4gYEV2ZW50c2AgaW5zdGFuY2UgaXMgYSBwbGFpbiBvYmplY3Qgd2hvc2UgcHJvcGVydGllcyBhcmUgZXZlbnQgbmFtZXMuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gRXZlbnRzKCkge31cblxuLy9cbi8vIFdlIHRyeSB0byBub3QgaW5oZXJpdCBmcm9tIGBPYmplY3QucHJvdG90eXBlYC4gSW4gc29tZSBlbmdpbmVzIGNyZWF0aW5nIGFuXG4vLyBpbnN0YW5jZSBpbiB0aGlzIHdheSBpcyBmYXN0ZXIgdGhhbiBjYWxsaW5nIGBPYmplY3QuY3JlYXRlKG51bGwpYCBkaXJlY3RseS5cbi8vIElmIGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBub3Qgc3VwcG9ydGVkIHdlIHByZWZpeCB0aGUgZXZlbnQgbmFtZXMgd2l0aCBhXG4vLyBjaGFyYWN0ZXIgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGJ1aWx0LWluIG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBub3Rcbi8vIG92ZXJyaWRkZW4gb3IgdXNlZCBhcyBhbiBhdHRhY2sgdmVjdG9yLlxuLy9cbmlmIChPYmplY3QuY3JlYXRlKSB7XG4gIEV2ZW50cy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIC8vXG4gIC8vIFRoaXMgaGFjayBpcyBuZWVkZWQgYmVjYXVzZSB0aGUgYF9fcHJvdG9fX2AgcHJvcGVydHkgaXMgc3RpbGwgaW5oZXJpdGVkIGluXG4gIC8vIHNvbWUgb2xkIGJyb3dzZXJzIGxpa2UgQW5kcm9pZCA0LCBpUGhvbmUgNS4xLCBPcGVyYSAxMSBhbmQgU2FmYXJpIDUuXG4gIC8vXG4gIGlmICghbmV3IEV2ZW50cygpLl9fcHJvdG9fXykgcHJlZml4ID0gZmFsc2U7XG59XG5cbi8qKlxuICogUmVwcmVzZW50YXRpb24gb2YgYSBzaW5nbGUgZXZlbnQgbGlzdGVuZXIuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCB0byBpbnZva2UgdGhlIGxpc3RlbmVyIHdpdGguXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvbmNlPWZhbHNlXSBTcGVjaWZ5IGlmIHRoZSBsaXN0ZW5lciBpcyBhIG9uZS10aW1lIGxpc3RlbmVyLlxuICogQGNvbnN0cnVjdG9yXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gRUUoZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdGhpcy5mbiA9IGZuO1xuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLm9uY2UgPSBvbmNlIHx8IGZhbHNlO1xufVxuXG4vKipcbiAqIE1pbmltYWwgYEV2ZW50RW1pdHRlcmAgaW50ZXJmYWNlIHRoYXQgaXMgbW9sZGVkIGFnYWluc3QgdGhlIE5vZGUuanNcbiAqIGBFdmVudEVtaXR0ZXJgIGludGVyZmFjZS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBhcGkgcHVibGljXG4gKi9cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gbmV3IEV2ZW50cygpO1xuICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG59XG5cbi8qKlxuICogUmV0dXJuIGFuIGFycmF5IGxpc3RpbmcgdGhlIGV2ZW50cyBmb3Igd2hpY2ggdGhlIGVtaXR0ZXIgaGFzIHJlZ2lzdGVyZWRcbiAqIGxpc3RlbmVycy5cbiAqXG4gKiBAcmV0dXJucyB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmV2ZW50TmFtZXMgPSBmdW5jdGlvbiBldmVudE5hbWVzKCkge1xuICB2YXIgbmFtZXMgPSBbXVxuICAgICwgZXZlbnRzXG4gICAgLCBuYW1lO1xuXG4gIGlmICh0aGlzLl9ldmVudHNDb3VudCA9PT0gMCkgcmV0dXJuIG5hbWVzO1xuXG4gIGZvciAobmFtZSBpbiAoZXZlbnRzID0gdGhpcy5fZXZlbnRzKSkge1xuICAgIGlmIChoYXMuY2FsbChldmVudHMsIG5hbWUpKSBuYW1lcy5wdXNoKHByZWZpeCA/IG5hbWUuc2xpY2UoMSkgOiBuYW1lKTtcbiAgfVxuXG4gIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG4gICAgcmV0dXJuIG5hbWVzLmNvbmNhdChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGV2ZW50cykpO1xuICB9XG5cbiAgcmV0dXJuIG5hbWVzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGxpc3RlbmVycyByZWdpc3RlcmVkIGZvciBhIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfFN5bWJvbH0gZXZlbnQgVGhlIGV2ZW50IG5hbWUuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGV4aXN0cyBPbmx5IGNoZWNrIGlmIHRoZXJlIGFyZSBsaXN0ZW5lcnMuXG4gKiBAcmV0dXJucyB7QXJyYXl8Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKGV2ZW50LCBleGlzdHMpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRcbiAgICAsIGF2YWlsYWJsZSA9IHRoaXMuX2V2ZW50c1tldnRdO1xuXG4gIGlmIChleGlzdHMpIHJldHVybiAhIWF2YWlsYWJsZTtcbiAgaWYgKCFhdmFpbGFibGUpIHJldHVybiBbXTtcbiAgaWYgKGF2YWlsYWJsZS5mbikgcmV0dXJuIFthdmFpbGFibGUuZm5dO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXZhaWxhYmxlLmxlbmd0aCwgZWUgPSBuZXcgQXJyYXkobCk7IGkgPCBsOyBpKyspIHtcbiAgICBlZVtpXSA9IGF2YWlsYWJsZVtpXS5mbjtcbiAgfVxuXG4gIHJldHVybiBlZTtcbn07XG5cbi8qKlxuICogQ2FsbHMgZWFjaCBvZiB0aGUgbGlzdGVuZXJzIHJlZ2lzdGVyZWQgZm9yIGEgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8U3ltYm9sfSBldmVudCBUaGUgZXZlbnQgbmFtZS5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsIGVsc2UgYGZhbHNlYC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXG4gICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBhcmdzXG4gICAgLCBpO1xuXG4gIGlmIChsaXN0ZW5lcnMuZm4pIHtcbiAgICBpZiAobGlzdGVuZXJzLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVycy5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCksIHRydWU7XG4gICAgICBjYXNlIDI6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEpLCB0cnVlO1xuICAgICAgY2FzZSAzOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiksIHRydWU7XG4gICAgICBjYXNlIDQ6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMyksIHRydWU7XG4gICAgICBjYXNlIDU6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQpLCB0cnVlO1xuICAgICAgY2FzZSA2OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0LCBhNSksIHRydWU7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGxpc3RlbmVycy5mbi5hcHBseShsaXN0ZW5lcnMuY29udGV4dCwgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGhcbiAgICAgICwgajtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnNbaV0uZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICAgIGNhc2UgMTogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQpOyBicmVhaztcbiAgICAgICAgY2FzZSAyOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEpOyBicmVhaztcbiAgICAgICAgY2FzZSAzOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEsIGEyKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgNDogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMiwgYTMpOyBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAoIWFyZ3MpIGZvciAoaiA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgICAgICBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4uYXBwbHkobGlzdGVuZXJzW2ldLmNvbnRleHQsIGFyZ3MpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBBZGQgYSBsaXN0ZW5lciBmb3IgYSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xTeW1ib2x9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gW2NvbnRleHQ9dGhpc10gVGhlIGNvbnRleHQgdG8gaW52b2tlIHRoZSBsaXN0ZW5lciB3aXRoLlxuICogQHJldHVybnMge0V2ZW50RW1pdHRlcn0gYHRoaXNgLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcylcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lciwgdGhpcy5fZXZlbnRzQ291bnQrKztcbiAgZWxzZSBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFt0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGQgYSBvbmUtdGltZSBsaXN0ZW5lciBmb3IgYSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xTeW1ib2x9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gW2NvbnRleHQ9dGhpc10gVGhlIGNvbnRleHQgdG8gaW52b2tlIHRoZSBsaXN0ZW5lciB3aXRoLlxuICogQHJldHVybnMge0V2ZW50RW1pdHRlcn0gYHRoaXNgLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZShldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMsIHRydWUpXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXIsIHRoaXMuX2V2ZW50c0NvdW50Kys7XG4gIGVsc2UgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBsaXN0ZW5lcnMgb2YgYSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xTeW1ib2x9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gT25seSByZW1vdmUgdGhlIGxpc3RlbmVycyB0aGF0IG1hdGNoIHRoaXMgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IE9ubHkgcmVtb3ZlIHRoZSBsaXN0ZW5lcnMgdGhhdCBoYXZlIHRoaXMgY29udGV4dC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IHJlbW92ZSBvbmUtdGltZSBsaXN0ZW5lcnMuXG4gKiBAcmV0dXJucyB7RXZlbnRFbWl0dGVyfSBgdGhpc2AuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiB0aGlzO1xuICBpZiAoIWZuKSB7XG4gICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApIHRoaXMuX2V2ZW50cyA9IG5ldyBFdmVudHMoKTtcbiAgICBlbHNlIGRlbGV0ZSB0aGlzLl9ldmVudHNbZXZ0XTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XTtcblxuICBpZiAobGlzdGVuZXJzLmZuKSB7XG4gICAgaWYgKFxuICAgICAgICAgbGlzdGVuZXJzLmZuID09PSBmblxuICAgICAgJiYgKCFvbmNlIHx8IGxpc3RlbmVycy5vbmNlKVxuICAgICAgJiYgKCFjb250ZXh0IHx8IGxpc3RlbmVycy5jb250ZXh0ID09PSBjb250ZXh0KVxuICAgICkge1xuICAgICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApIHRoaXMuX2V2ZW50cyA9IG5ldyBFdmVudHMoKTtcbiAgICAgIGVsc2UgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBmb3IgKHZhciBpID0gMCwgZXZlbnRzID0gW10sIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKFxuICAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4gIT09IGZuXG4gICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnNbaV0ub25jZSlcbiAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzW2ldLmNvbnRleHQgIT09IGNvbnRleHQpXG4gICAgICApIHtcbiAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL1xuICAgIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cbiAgICAvL1xuICAgIGlmIChldmVudHMubGVuZ3RoKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGV2ZW50cy5sZW5ndGggPT09IDEgPyBldmVudHNbMF0gOiBldmVudHM7XG4gICAgZWxzZSBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMCkgdGhpcy5fZXZlbnRzID0gbmV3IEV2ZW50cygpO1xuICAgIGVsc2UgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzLCBvciB0aG9zZSBvZiB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfFN5bWJvbH0gW2V2ZW50XSBUaGUgZXZlbnQgbmFtZS5cbiAqIEByZXR1cm5zIHtFdmVudEVtaXR0ZXJ9IGB0aGlzYC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50KSB7XG4gIHZhciBldnQ7XG5cbiAgaWYgKGV2ZW50KSB7XG4gICAgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcbiAgICBpZiAodGhpcy5fZXZlbnRzW2V2dF0pIHtcbiAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKSB0aGlzLl9ldmVudHMgPSBuZXcgRXZlbnRzKCk7XG4gICAgICBlbHNlIGRlbGV0ZSB0aGlzLl9ldmVudHNbZXZ0XTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZXZlbnRzID0gbmV3IEV2ZW50cygpO1xuICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEFsaWFzIG1ldGhvZHMgbmFtZXMgYmVjYXVzZSBwZW9wbGUgcm9sbCBsaWtlIHRoYXQuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XG5cbi8vXG4vLyBUaGlzIGZ1bmN0aW9uIGRvZXNuJ3QgYXBwbHkgYW55bW9yZS5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBwcmVmaXguXG4vL1xuRXZlbnRFbWl0dGVyLnByZWZpeGVkID0gcHJlZml4O1xuXG4vL1xuLy8gQWxsb3cgYEV2ZW50RW1pdHRlcmAgdG8gYmUgaW1wb3J0ZWQgYXMgbW9kdWxlIG5hbWVzcGFjZS5cbi8vXG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXG4vL1xuaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgbW9kdWxlKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xufVxuIiwiLyoqXG4gKiBUaGUgZGlzcGF0Y2hlciBmb3Igd2Vib3MuXG4gKiBAbW9kdWxlIGNvcmUvZGlzcGF0Y2hlclxuICovXG5pbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuXG5jb25zdCBsb2cgPSBkZWJ1ZygnZGlzcGF0Y2hlcjpsb2cnKTtcbi8vIERpc2FibGUgbG9nZ2luZyBpbiBwcm9kdWN0aW9uXG5pZiAoRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgZGVidWcuZW5hYmxlKCcqJyk7XG59IGVsc2Uge1xuICBkZWJ1Zy5kaXNhYmxlKCk7XG59XG5cbmltcG9ydCBFRSBmcm9tICdldmVudGVtaXR0ZXIzJztcblxuLyoqIENsYXNzIHJlcHJlc2VudGluZyBhIG1haW4gZGlzcGF0Y2hlciBmb3Igd2Vib3MuXG4gKiAgQGV4dGVuZHMgRXZlbnRFbW1pdGVyM1xuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpc3BhdGNoZXIgZXh0ZW5kcyBFRSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgbG9nKCdEaXNwYXRjaGVyIENyZWF0ZScpO1xuICB9XG59IiwiLyoqXG4gKiBEZWZhdWx0IGhhbmRsZXIgZm9yIFByb3h5aW5nLlxuICogQG1vZHVsZSBsaWJzL2FwcC5wcm94eS5oYW5kbGVyXG4gKiBAc2VlIG1vZHVsZTpsaWJzL3Byb3h5aW5nXG4gKi9cblxuLyoqIENsYXNzIHJlcHJlc2VudGluZyBhIGRlZmF1bHQgaGFuZGxlciBmb3IgYXBwbGljYXRpb25zIFByb3h5aW5nLiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBwUHJveHlIYW5kbGVyIHtcbiAgLyoqXG4gICAqIEdldHRlci5cbiAgICogQHJldHVybiB7IGFueSB9IHRhcmdldFtwcm9wXSAtIFJldHVybiB0cnVlIHdoZW4gdHJ5IHRvIGdldCAndXVpZC5cbiAgICovXG4gIGdldCh0YXJnZXQsIHByb3ApIHtcbiAgICBpZiAocHJvcCA9PSAnX191dWlkJykge1xuICAgICAgcmV0dXJuIHRhcmdldC51dWlkO1xuICAgIH1cbiAgICBpZiAocHJvcCA9PSAndXVpZCcpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0W3Byb3BdO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHRlci5cbiAgICogQHJldHVybiB7IGFueSB9IHZhbHVlXG4gICAqL1xuXG4gIHNldCh0YXJnZXQsIHByb3AsIHZhbHVlKSB7XG4gICAgaWYgKHByb3AgPT0gJ3V1aWQnIHx8IHByb3AgPT0gJ25hbWUnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBjYW5cXCd0IGNoYW5nZSBcXCd1dWlkXFwnIG9yIFxcJ25hbWVcXCcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBkZWxldGVQcm9wZXJ0eSh0YXJnZXQsIHByb3ApIHtcbiAgICBpZiAocHJvcCA9PSAndXVpZCcgfHwgcHJvcCA9PSAnbmFtZScpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91IGNhblxcJ3QgZGVsZXRlIFxcJ3V1aWRcXCcgb3IgXFwnbmFtZVxcJycpO1xuICAgIH1cbiAgfVxufSIsIi8qKlxuICogTW9kdWxlIGZvciBQcm94eWluZy5cbiAqIEBtb2R1bGUgbGlicy9wcm94eWluZ1xuICovXG5cbmltcG9ydCBBcHBQcm94eUhhbmRsZXIgZnJvbSAnLi9hcHAucHJveHkuaGFuZGxlci5qcyc7XG5cbi8qKlxuICogV3JhcCBvbiBwcm94eSBvYmplY3QuXG4gKiBAcGFyYW0geyBvYmplY3QgfSBhcHAgLSBUaGUgYXBwbGljYXRpb24gd2hpY2ggbXVzdCB3cmFwIG9uIHByb3h5IG9iamVjdC5cbiAqIEBwYXJhbSB7IE9iamVjdCB9IG9wdGlvbnMgLSBUaGUgb3B0aW9ucyB3aGljaCBjYW4gY29udGFpbiBwcm94eSBoYW5kbGVyLlxuICogQHJldHVybiB7IFByb3h5IG9iamVjdCB9IC0gUHJveHkgb2JqZWN0IHdpdGggY3VycmVudCBhcHBsaWNhdGlvbiBhbmQgaGFuZGxlciBmcm9tXG4gKiBvcHRpb25zIG9yIGRlZmF1bHQgKEBzZWUgbW9kdWxlOmxpYnMvYXBwLnByb3h5LmhhbmRsZXIpXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcHJveHlpbmcoYXBwLCBvcHRpb25zKSB7XG4gIGxldCBoYW5kbGVyO1xuICBpZiAoIW9wdGlvbnMgfHwgKG9wdGlvbnMgJiYgIW9wdGlvbnMuaGFuZGxlcikpIHtcbiAgICAvLyBkZWZhdWx0IGhhbmRsZXJcbiAgICBoYW5kbGVyID0gbmV3IEFwcFByb3h5SGFuZGxlcjtcbiAgfSBlbHNlIGlmIChvcHRpb25zLmhhbmRsZXIpIHtcbiAgICBoYW5kbGVyID0gT2JqZWN0LmFzc2lnbihuZXcgQXBwUHJveHlIYW5kbGVyLCBvcHRpb25zLmhhbmRsZXIpO1xuICB9XG4gIHJldHVybiBuZXcgUHJveHkoYXBwLCBoYW5kbGVyKTtcbn1cbiIsIi8qKlxuICogQXBwbGljYXRpb25zIFF1ZXVlLlxuICogQG1vZHVsZSBjb3JlL2FwcFF1ZXVlXG4gKiBAc2VlIG1vZHVsZTpjb3JlL2luaXRcbiAqL1xuXG5pbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuXG5jb25zdCBsb2cgPSBkZWJ1ZygnYXBwUXVldWU6bG9nJyk7XG4vLyBEaXNhYmxlIGxvZ2dpbmcgaW4gcHJvZHVjdGlvblxuaWYgKEVOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGRlYnVnLmVuYWJsZSgnKicpO1xufSBlbHNlIHtcbiAgZGVidWcuZGlzYWJsZSgpO1xufVxuXG5pbXBvcnQgcHJveHlpbmcgZnJvbSAnLi4vbGlicy9wcm94eWluZy5qcyc7XG5cbi8qKiBDbGFzcyBBcHBRdWV1ZSByZXByZXNlbnRpbmcgYSB3ZWJvcyBhcHBsaWNhdGlvbnMgcXVldWUuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwcHMge1xuICAvKipcbiAgICogQ3JlYXRlIGEgZGlzcGF0Y2hlciwgbmFtZSwgYWxsQXBwcywgYWN0aXZlQXBwcyBhbmQgY2FsbCBfaW5zdGFsbExpc3RlbmVycy5cbiAgICogQHBhcmFtIHsgRGlzcGF0Y2hlciB9IGRpc3BhdGNoZXIgLSBUaGUgbWFpbiBkaXNwYXRjaGVyLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZGlzcGF0Y2hlcikge1xuICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgdGhpcy5uYW1lID0gJ3dlYm9zLWFwcC1xdWV1ZSc7XG4gICAgdGhpcy5hbGxBcHBzID0gW107XG4gICAgdGhpcy5hY3RpdmVBcHBzID0gW107XG4gICAgdGhpcy5faW5zdGFsbExpc3RlbmVycygpO1xuICB9XG4gIC8qKlxuICAgKiBTZXQgdGhlIGxpc3RlbmVycy5cbiAgICovXG4gIF9pbnN0YWxsTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZGlzcGF0Y2hlci5vbignY3JlYXRlOm5ldzphcHAnLCB0aGlzLmNyZWF0ZU5ld0FwcCwgdGhpcyk7XG4gICAgdGhpcy5kaXNwYXRjaGVyLm9uKCdhcHA6dG91Y2gnLCB0aGlzLnRvdWNoQXBwLCB0aGlzKTtcbiAgICB0aGlzLmRpc3BhdGNoZXIub24oJ3JlbW92ZTphcHAnLCB0aGlzLnJlbW92ZUFwcCwgdGhpcyk7XG4gICAgdGhpcy5kaXNwYXRjaGVyLm9uKCdyZWFkeTpjb21wb25lbnQ6YXBwTGlzdCcsIHRoaXMucmVhZHlBcHBMaXN0LCB0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGRlZmF1bHQgYXBwbGljYXRpb25zLlxuICAgKi9cbiAgaW5pdERlZmF1bHRBcHBzKCkge1xuICAgIGxldCBjYWxjdWxhdG9yID0ge1xuICAgICAgbmFtZTogJ0NhbGN1bGF0b3InXG4gICAgfTtcblxuICAgIHRoaXMuY3JlYXRlTmV3QXBwKHtcbiAgICAgIGFwcDogY2FsY3VsYXRvclxuICAgIH0pO1xuXG4gICAgdGhpcy5kaXNwYXRjaGVyLmVtaXQoJ2NyZWF0ZTphcHAnLCB7XG4gICAgICBhcHA6IHRoaXMuZ2V0QXBwQnlOYW1lKGNhbGN1bGF0b3IubmFtZSlcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIHJlYWR5IGFwcGxpY2F0aW9uIGxpc3QgY29tcG9uZW50IFxuICAgKiBzZXQgdGhlIGRlZmF1bHQgYXBwbGljYXRpb25zLlxuICAgKi9cbiAgcmVhZHlBcHBMaXN0KCkge1xuICAgIHRoaXMuaW5pdERlZmF1bHRBcHBzKCk7XG4gIH1cblxuICAvKiogXG4gICAqIENoZWNrIG9wdGlvbnMgYW5kIGNhbGwgc3RhdGljIHB1c2hBcHBcbiAgICogbWV0aG9kIHdpdGggb3B0aW9uc1xuICAgKiBAcGFyYW0geyBvYmplY3QgfSBvcHRpb25zXG4gICAqL1xuXG4gIGNyZWF0ZU5ld0FwcChvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zLmFwcCkge1xuICAgICAgLy8gVE9ETyA6OjogQ3JlYXRlIEVycm9yIEhhbmRsZXJcbiAgICAgIC8vIHNlZSA9PiBsaW5rIDo6OiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9ydS9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9FcnJvclxuICAgICAgLy8gc2VlID0+IGxpbmsgOjo6IGh0dHBzOi8vbGVhcm4uamF2YXNjcmlwdC5ydS9vb3AtZXJyb3JzIFxuICAgICAgLy8gc2VlID0+IGxpbmsgOjo6IGh0dHA6Ly9leHByZXNzanMuY29tL3J1L2d1aWRlL2Vycm9yLWhhbmRsaW5nLmh0bWxcbiAgICAgIHRocm93IG5ldyBFcnJvcihgV2l0aCBjcmVhdGU6bmV3OmFwcCBldmVudCBzZW5kIGFwcCBvcHRpb25zXG4gICAgICAgIGV4LiBcXCdkaXNwYXRjaGVyLmVtaXQoJ2NyZWF0ZTpuZXc6YXBwJywge2FwcDogLi4ufSlcXCdgKTtcbiAgICB9XG4gICAgdGhpcy5wdXNoQXBwKHByb3h5aW5nKG9wdGlvbnMuYXBwKSk7XG4gICAgbG9nKCdjcmVhdGUgbmV3IGFwcCcpO1xuICAgIC8vIGZ1bmN0aW9uICdwcm94eWluZycgY2FuIGdldCBzZWNvbmQgYXJndW1lbnQgd2hpY2ggeW91ciBjdXN0b21cbiAgICAvLyBQcm94eSBoYW5kbGVyXG4gICAgLy8gVE9ETyA6OjogQ3JlYXRlIHJlc3RyaWN0aW5nIGxvZ2ljIGZvciBtYXJnZSBjdXN0b20gYW5kXG4gICAgLy8gZGVmYXVsdCBQcm94eSBoYW5kbGVyXG4gICAgLy8gPT4gc2VlIDo6OiAvbGlicy9wcm94eWluZy5qc1xuICB9XG5cbiAgLyoqIFxuICAgKiBSZW1vdmUgYXBwbGljYXRpb24gZnJvbSAndGhpcy5hbGxBcHBzJ1xuICAgKiBAcGFyYW0geyBvYmplY3QgfSBvcHRpb25zXG4gICAqL1xuXG4gIHJlbW92ZUFwcChvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zIHx8IChvcHRpb25zICYmICFvcHRpb25zLmFwcCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgV2l0aCBjcmVhdGU6bmV3OmFwcCBldmVudCBzZW5kIGFwcCBvcHRpb25zXG4gICAgICAgIGV4LiBcXCdkaXNwYXRjaGVyLmVtaXQoJ2NyZWF0ZTpuZXc6YXBwJywge2FwcDogLi4ufSlcXCdgKTsgICAgICBcbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMuYXBwKSB7XG4gICAgICB0aGlzLmFsbEFwcHMuc3BsaWNlKHRoaXMuYWxsQXBwcy5pbmRleE9mKHRoaXMuZ2V0QXBwQnlVdWlkKG9wdGlvbnMuYXBwLnV1aWQpKSwgMSk7XG4gICAgICBsb2coJ3JlbW92ZSBhcHAnKTtcbiAgICB9XG4gIH1cblxuICAvKiogXG4gICAqIEdldCBhcHBsaWNhdGlvbiBieSBVVUlEIGZyb20gJ3RoaXMuYWxsQXBwcydcbiAgICogQHBhcmFtIHsgc3RyaW5nIH0gdXVpZFxuICAgKiBAcmV0dXJuIHsgb2JqZWN0IH0gYXBwbGljYXRpb25cbiAgICovXG5cbiAgZ2V0QXBwQnlVdWlkKHV1aWQpIHtcbiAgICByZXR1cm4gdGhpcy5hbGxBcHBzLmZpbmQoYXBwID0+IGFwcC5fX3V1aWQgPT0gdXVpZCk7XG4gIH1cblxuICAvKiogXG4gICAqIEdldCBhcHBsaWNhdGlvbiBieSBOQU1FIGZyb20gJ3RoaXMuYWxsQXBwcycgYnkgZGVmYXVsdFxuICAgKiBhbmQgZnJvbSAnYXJyJyB3aGVuICdhcnInIGlzIGV4aXN0c1xuICAgKiBAcGFyYW0geyBzdHJpbmcgfSBuYW1lXG4gICAqIEBwYXJhbSB7IGFycmF5IH0gYXJyXG4gICAqIEByZXR1cm4geyBvYmplY3QgfSBhcHBsaWNhdGlvblxuICAgKi9cblxuICBnZXRBcHBCeU5hbWUobmFtZSwgYXJyKSB7XG4gICAgbGV0IHF1ZXVlO1xuICAgIGlmIChhcnIpIHtcbiAgICAgIHF1ZXVlID0gYXJyO1xuICAgIH0gZWxzZSB7XG4gICAgICBxdWV1ZSA9IHRoaXMuYWxsQXBwcztcbiAgICB9XG4gICAgcmV0dXJuIHF1ZXVlLmZpbmQoYXBwID0+IGFwcC5uYW1lID09IG5hbWUpO1xuICB9XG5cbiAgLyoqIFxuICAgKiBBZGQgYXBsaWNhdGlvbiBwcm94eSBpbiAndGhpcy5hbGxBcHBzJ1xuICAgKiBAcGFyYW0geyBwcm94eSBvYmplY3QgfSBwcm94eVxuICAgKi9cblxuICBwdXNoQXBwKHByb3h5KSB7XG4gICAgbGV0IGlzTm90VW5pcXVlID0gdGhpcy5nZXRBcHBCeVV1aWQocHJveHkuX191dWlkKTtcbiAgICBpZiAoaXNOb3RVbmlxdWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRHVibGljYXRlIGFwcGxpY2F0aW9uIHV1aWQnKTtcbiAgICB9XG4gICAgaXNOb3RVbmlxdWUgPSB0aGlzLmdldEFwcEJ5TmFtZShwcm94eS5uYW1lKTtcbiAgICBpZiAoaXNOb3RVbmlxdWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRHVibGljYXRlIGFwcGxpY2F0aW9uIG5hbWUnKTtcbiAgICB9XG4gICAgdGhpcy5hbGxBcHBzLnB1c2gocHJveHkpO1xuICB9XG5cbiAgLyoqIFxuICAgKiBDYWxsZWQgd2hlbiB1c2VyIHRvdWNoIGFwcGxpY2F0aW9uIGljb25cbiAgICogSW4gYXBwbGljYXRpb24gbGlzdFxuICAgKiBAcGFyYW0geyBvYmplY3QgfSBvcHRpb25zXG4gICAqLyAgXG5cbiAgdG91Y2hBcHAob3B0aW9ucykge1xuICAgIGxldCBjdXJyZW50QXBwID0gdGhpcy5nZXRBcHBCeU5hbWUob3B0aW9ucy5uYW1lKTtcbiAgICBpZiAoY3VycmVudEFwcCkge1xuICAgICAgaWYgKCF0aGlzLmdldEFwcEJ5TmFtZShjdXJyZW50QXBwLm5hbWUsIHRoaXMuYWN0aXZlQXBwcykpIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmVtaXQoJ29wZW46YXBwJywgY3VycmVudEFwcCk7XG4gICAgICAgIHRoaXMuYWN0aXZlQXBwcy5wdXNoKGN1cnJlbnRBcHApO1xuICAgICAgfVxuICAgICAgLy8gY3JlYXRlIGxvZ2ljIGZvciBvcGVuIGFwcFxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gYXBwbGljYXRpb24nKTtcbiAgICB9XG4gIH1cbn0iLCIvKipcbiAqIE1vZHVsZSBmb3IgbWFrZSB3b3JrZXIgc291cmNlLlxuICogQG1vZHVsZSBsaWJzL3dvcmtlclNvdXJjZS5tYWtlclxuICogQHNlZSBtb2R1bGU6Y29yZS9wcm9jZXNzXG4gKi9cblxuLyoqIENsYXNzIHJlcHJlc2VudGluZyBhIHdvcmtlciBzb3VyY2UgbWFrZXIuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1ha2VXb3JrZXJTb3VyY2Uge1xuICAvKipcbiAgICogQ2hlY2sgb3B0aW9ucyBhbmQgY2FsbCAnd29ya2VyU291cmNlJyBtZXRob2QuXG4gICAqIEBwYXJhbSB7IG9iamVjdCB9IG9wdGlvbnMgLSBPcHRpb25zIGZvciB3b3JrZXIgYm9keS4gQ2FuIGNvbnRhaW4gd29ya2VyIGRlcGVuZGVuY3kgYW5kIGZuLlxuICAgKi9cblxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICBpZiAob3B0aW9ucy5kZXBzKSB7XG4gICAgICB0aGlzLmRlcHMgPSBvcHRpb25zLmRlcHMuam9pbignLCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRlcHMgPSAnJztcbiAgICB9XG5cbiAgICB0aGlzLmRlcHMgPSBcIlxcJ1wiICsgdGhpcy5kZXBzICsgXCJcXCdcIjtcbiAgICB0aGlzLndvcmtlclNvdXJjZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ha2Ugd29ya2VyIHNvdXJjZS5cbiAgICogQHJldHVybiB7IEZ1bmN0aW9uIH1cbiAgICovXG5cbiAgd29ya2VyU291cmNlKCkge1xuICAgIC8vIFRPRE8gOjo6IE9wdGltaXplIHRoaXMgY2FzZVxuICAgIHJldHVybiBGdW5jdGlvbihcbiAgICAgIGBcbiAgICAgIGltcG9ydFNjcmlwdHMoJHt0aGlzLmRlcHN9KTtcbiAgICAgIGxldCBmbiA9ICR7dGhpcy5vcHRpb25zLmZufTtcbiAgICAgIGZuKCk7XG4gICAgICBgXG4gICAgKTtcbiAgfVxufSIsIi8qKlxuICogVGhlIHByb2Nlc3MgZm9yIHdlYm9zLlxuICogQG1vZHVsZSBjb3JlL3Byb2Nlc3NcbiAqL1xuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcblxuaW1wb3J0IE1ha2VXb3JrZXJTb3VyY2UgZnJvbSAnLi4vbGlicy93b3JrZXJTb3VyY2UubWFrZXIuanMnO1xuXG5jb25zdCBsb2cgPSBkZWJ1ZygncHJvY2Vzczpsb2cnKTtcbi8vIERpc2FibGUgbG9nZ2luZyBpbiBwcm9kdWN0aW9uXG5pZiAoRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgZGVidWcuZW5hYmxlKCcqJyk7XG59IGVsc2Uge1xuICBkZWJ1Zy5kaXNhYmxlKCk7XG59XG5cbi8qKiBDbGFzcyByZXByZXNlbnRpbmcgYSBwcm9jZXNzIGZvciB3ZWJvcy5cbiAqICBAZXh0ZW5kcyBFdmVudEVtbWl0ZXIzXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvY2VzcyB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBkaXNwYXRjaGVyLCBwcm9jZXNzZXMgYW5kIF9pbnN0YWxsTGlzdGVuZXJzLlxuICAgKiBAcGFyYW0geyBEaXNwYXRjaGVyIH0gZGlzcGF0Y2hlciAtIFRoZSBtYWluIGRpc3BhdGNoZXIuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihkaXNwYXRjaGVyKSB7XG4gICAgdGhpcy5kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcbiAgICB0aGlzLnByb2Nlc3NlcyA9IFtdO1xuICAgIGxvZygncnVuIFByb2Nlc3MgY2xhc3MnKTtcbiAgICB0aGlzLl9pbnN0YWxsTGlzdGVuZXJzKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBsaXN0ZW5lcnMuXG4gICAqL1xuXG4gIF9pbnN0YWxsTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZGlzcGF0Y2hlci5vbignY3JlYXRlOm5ldzpwcm9jZXNzJywgdGhpcy5uZXdQcm9jZXNzLCB0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXRob2QgZm9yIGNyZWF0ZSBuZXcgcHJvY2VzcyBpbiB3ZWJvcy5cbiAgICogQHBhcmFtIHsgb2JqZWN0IH0gcHJvY2Vzc0JvZHkgLSBQcm9jZXNzIGJvZHkgY2FuIGNvbnRhaW4gcHJvY2VzcyBkZXBlbmRlbmNpZXMgYW5kIGZuXG4gICAqIEBwYXJhbSB7IG9iamVjdCB9IG9wdGlvbnMgLSBvcHRpb25zIGNhbiBjb250YWluIG9ubWVzc2FnZSBhbmQgb25lcnJvciBjYWxsYmFja3MgYW5kIHRlcm1pbmF0ZSBmbGFnXG4gICAqIEByZXR1cm4geyB3b3JrZXIgb2JqZWN0IH0gd29ya2VyIC0gcmV0dXJuICdydW5Xb3JrZXInIG1ldGhvZCB3aXRoICdwcm9jZXNzQm9keSwgb3B0aW9ucywgdHJ1ZSdcbiAgICogVGhlIDN0aCBwYXJhbSBpbiAncnVuV29ya2VyJyBtZXRob2QgaXMgcHJvbWlzaWZ5IGZsYWcuIERpZmZlcmVudCBiZXR3ZWVuIHdpdGggJ2NyZWF0ZScgYW5kICduZXdQcm9jZXNzJ1xuICAgKiBpcyB0aGVpcnMgcmV0dXJuZWQgdmFsdWUuIE5PVEXWiSAnbmV3UHJvY2VzcycgbWV0aG9kIG5vdGhpbmcgcmV0dXJuZWQuIFxuICAgKi9cblxuICBjcmVhdGUocHJvY2Vzc0JvZHksIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5ydW5Xb3JrZXIocHJvY2Vzc0JvZHksIG9wdGlvbnMsIHRydWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ldGhvZCBmb3IgY3JlYXRlIG5ldyBwcm9jZXNzIGluIHdlYm9zLlxuICAgKiBAcGFyYW0geyBvYmplY3QgfSBwcm9jZXNzQm9keSAtIFByb2Nlc3MgYm9keSBjYW4gY29udGFpbiBwcm9jZXNzIGRlcGVuZGVuY2llcyBhbmQgZm5cbiAgICogQHBhcmFtIHsgb2JqZWN0IH0gb3B0aW9ucyAtIG9wdGlvbnMgY2FuIGNvbnRhaW4gb25tZXNzYWdlIGFuZCBvbmVycm9yIGNhbGxiYWNrcyBhbmQgdGVybWluYXRlIGZsYWdcbiAgICovXG5cbiAgbmV3UHJvY2Vzcyhwcm9jZXNzQm9keSwgb3B0aW9ucykge1xuICAgIHRoaXMucnVuV29ya2VyKHByb2Nlc3NCb2R5LCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXRob2QgZm9yIGNyZWF0ZSBuZXcgcHJvY2VzcyBpbiB3ZWJvcy5cbiAgICogQHBhcmFtIHsgb2JqZWN0IH0gcHJvY2Vzc0JvZHkgLSBQcm9jZXNzIGJvZHkgY2FuIGNvbnRhaW4gcHJvY2VzcyBkZXBlbmRlbmNpZXMgYW5kIGZuXG4gICAqIEBwYXJhbSB7IG9iamVjdCB9IG9wdGlvbnMgLSBvcHRpb25zIGNhbiBjb250YWluIG9ubWVzc2FnZSBhbmQgb25lcnJvciBjYWxsYmFja3MgYW5kIHRlcm1pbmF0ZSBmbGFnXG4gICAqL1xuXG4gIHJ1bldvcmtlcihwcm9jZXNzQm9keSwgb3B0aW9ucywgcHJvbWlzaWZ5KSB7XG4gICAgbGV0IHdvcmtlcjtcbiAgICBpZiAoIXByb2Nlc3NCb2R5IHx8IChwcm9jZXNzQm9keSAmJiAhcHJvY2Vzc0JvZHkuZm4pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgXG4gICAgICAgIFdpdGggJ2NyZWF0ZTpuZXc6cHJvY2VzcycgZXZlbnQgeW91IHNob3VsZCBzZW5kIHByb2Nlc3NCb2R5XG4gICAgICAgIGV4LlxuICAgICAgICAuLi5kaXNwYXRjaGVyLmVtaXQoXG4gICAgICAgICAgICAnY3JlYXRlOm5ldzpwcm9jZXNzJywgLy8gb3Igd2ViT3MucHJvY2Vzcy5jcmVhdGUoLi4uKTtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgZGVwczogQXJyYXkgOjo6IChvcHRpb25hbCkgOjo6IEluIHRoaXMgY2FzZSB5b3Ugc2hvdWxkIHdyaXRlIGFsbCBkZXBlbmRlbmN5IHBhdGhzLFxuICAgICAgICAgICAgICBmbjogRnVuY3Rpb24gOjo6IChyZXF1aXJlcykgOjo6IEl0IGlzIHRoaXMgZnVuY3Rpb24gd2l0Y2ggd2lsbCBydW4gaW4gbmV3IHByb2Nlc3MgICAgICAgICAgXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBvbm1lc3NhZ2U6IEZ1bmN0aW9uIDo6OiAob3B0aW9uYWwpIDo6OiBJdCBpcyB3b3JrZXIgb25tZXNzYWdlIGNhbGxiYWNrLFxuICAgICAgICAgICAgICBvbmVycm9yOiBGdW5jdGlvbiA6OjogKG9wdGlvbmFsKSA6OjogaXQgaXMgd29ya2VyIG9uZXJyb3IgY2FsbGJhY2ssXG4gICAgICAgICAgICAgIHRlcm1pbmF0ZTogQm9vbGVhbiA6OjogKG9wdGlvbmFsKSA6OjogZGVmYXVsdCA9PiBmYWxzZSA6OjogSWYgdGhpcyBmbGFnIGlzIHRydWUgYW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeW91IGhhdmUgb25tZXNzYWdlIHRoZW4gYWZ0ZXIgcHJvY2VzcyBqb2IgaXQgd2lsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlIHRlcm1pbmF0ZWQsIGJ1dCB3aGVuIHlvdSBoYXZuJ3Qgb25tZXNzYWdlIGFuZCB3YW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVybWluYXRlIHByb2Nlc3MgeW91IGNhbiBraWxsIGl0IHlvdXJzZWxmIGluIGZuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sgOilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApXG4gICAgICBgKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9jZXNzQm9keS5mbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAnZm4nIGluIG5ldyBwcm9jZXNzIHNob3VsZCBiZSBGdW5jdGlvbmApO1xuICAgIH0gZWxzZSBpZiAocHJvY2Vzc0JvZHkuZGVwcyAmJiAhQXJyYXkuaXNBcnJheShwcm9jZXNzQm9keS5kZXBzKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAnZGVwcycgaW4gbmV3IHByb2Nlc3Mgc2hvdWxkIGJlIEFycmF5YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCB3b3JrZXJTb3VyY2UgPSBuZXcgTWFrZVdvcmtlclNvdXJjZShwcm9jZXNzQm9keSkud29ya2VyU291cmNlKCk7XG5cbiAgICAgIGxldCBjb2RlID0gd29ya2VyU291cmNlLnRvU3RyaW5nKCk7XG5cbiAgICAgIGNvZGUgPSBjb2RlLnN1YnN0cmluZyhjb2RlLmluZGV4T2YoJ3snKSArIDEsIGNvZGUubGFzdEluZGV4T2YoJ30nKSk7XG5cbiAgICAgIGxldCBibG9iID0gbmV3IEJsb2IoW2NvZGVdLCB7dHlwZTogJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnfSk7XG4gICAgICB3b3JrZXIgPSBuZXcgV29ya2VyKFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikpO1xuICAgICAgLy8gY3JlYXRlIGluIHByb2Nlc3Nlc1xuICAgICAgdGhpcy5wcm9jZXNzZXMucHVzaCh3b3JrZXIpO1xuXG4gICAgICBpZiAob3B0aW9ucy5vbm1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLm9ubWVzc2FnZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGlmIChvcHRpb25zLnRlcm1pbmF0ZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLnRlcm1pbmF0ZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICAgIHdvcmtlci5vbm1lc3NhZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLm9ubWVzc2FnZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIHdvcmtlci50ZXJtaW5hdGUoKTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJ3Rlcm1pbmF0ZScgaW4gbmV3IHByb2Nlc3Mgc2hvdWxkIGJlIEJvb2xlYW5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd29ya2VyLm9ubWVzc2FnZSA9IG9wdGlvbnMub25tZXNzYWdlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCdvbm1lc3NhZ2UnIGluIG5ldyBwcm9jZXNzIHNob3VsZCBiZSBGdW5jdGlvbmApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLm9uZXJyb3IpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLm9uZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB3b3JrZXIub25lcnJvciA9IG9wdGlvbnMub25lcnJvcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCdvbmVycm9yJyBpbiBuZXcgcHJvY2VzcyBzaG91bGQgYmUgRnVuY3Rpb25gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwcm9taXNpZnkgJiYgd29ya2VyKSB7XG4gICAgICByZXR1cm4gd29ya2VyO1xuICAgIH1cbiAgfVxufSIsIi8qKlxuICogTWFpbiBjb3JlIG1vZHVsZS5cbiAqIEBtb2R1bGUgY29yZS9pbml0XG4gKi9cbmltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4vZGlzcGF0Y2hlci5qcyc7XG5cbmltcG9ydCBBcHBzIGZyb20gJy4vYXBwcy5qcyc7XG5cbmltcG9ydCBQcm9jZXNzIGZyb20gJy4vcHJvY2Vzcyc7XG5cbmxldCB3ZWJPcyA9IHt9O1xuXG53ZWJPcy5kaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXI7XG5cbndlYk9zLmFwcHMgPSBuZXcgQXBwcyh3ZWJPcy5kaXNwYXRjaGVyKTtcblxud2ViT3MucHJvY2VzcyA9IG5ldyBQcm9jZXNzKHdlYk9zLmRpc3BhdGNoZXIpO1xuXG5leHBvcnQgZGVmYXVsdCB3ZWJPczsiLCIvLyBBZGQgYSBkZWJ1Z2dlclxuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcblxuY29uc3QgbG9nID0gZGVidWcoJ2FwcDpsb2cnKTtcbi8vIERpc2FibGUgbG9nZ2luZyBpbiBwcm9kdWN0aW9uXG5pZiAoRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgZGVidWcuZW5hYmxlKCcqJyk7XG5cbiAgLy8gRm9yIGxpdmUgcmVsb2FkXG4gIGRvY3VtZW50LndyaXRlKCc8c2NyaXB0IHNyYz1cImh0dHA6Ly8nICsgKGxvY2F0aW9uLmhvc3QgfHwgJ2xvY2FsaG9zdCcpLnNwbGl0KCc6JylbMF0gK1xuICAnOjM1NzI5L2xpdmVyZWxvYWQuanM/c25pcHZlcj0xXCI+PC8nICsgJ3NjcmlwdD4nKTtcbn0gZWxzZSB7XG4gIGRlYnVnLmRpc2FibGUoKTtcbn1cblxubG9nKCc6OjogQXBwIFN0YXJ0IDo6OicpO1xuXG5pbXBvcnQgd2ViT3MgZnJvbSAnLi9jb3JlL2luaXQnO1xuXG53aW5kb3cud2ViT3MgPSB3ZWJPcztcblxuLy8gSW1wb3J0IHN0eWxlc1xuaW1wb3J0ICcuLi9jc3MvbWFpbi5jc3MnO1xuXG4vLyB0ZXN0IGZvciBjcmVhdGUgYXBwbGljYXRpb25cbndlYk9zLmRpc3BhdGNoZXIuZW1pdCgnY3JlYXRlOm5ldzphcHAnLCB7XG4gIGFwcDoge1xuICAgIG5hbWU6ICd3ZWJvcy10ZXJtaW5hbCcsXG4gICAgdXVpZDogJzIyZTFkJ1xuICB9XG59KTtcblxuLy8gdGVzdCBmb3IgY3JlYXRlIGFwcGxpY2F0aW9uXG53ZWJPcy5kaXNwYXRjaGVyLmVtaXQoJ2NyZWF0ZTpuZXc6YXBwJywge1xuICBhcHA6IHtcbiAgICBuYW1lOiAnd2Vib3MtdGVybWluYWwtZmFjZScsXG4gICAgdXVpZDogJzMxcXdhJyxcbiAgICAvLyB0ZXN0XG4gICAgcHJvY2Vzczoge1xuICAgICAgbmV3OiB0cnVlLFxuICAgICAgLy8gLi4uLlxuICAgIH1cbiAgfVxufSk7XG5cbi8vIHRlc3QgZm9yIHJlbW92ZSBhcHBsaWNhdGlvblxud2ViT3MuYXBwcy5yZW1vdmVBcHAoe1xuICBhcHA6IHtcbiAgICB1dWlkOiAnMjJlMWQnXG4gIH1cbn0pO1xuXG4vLyB0ZXN0IGZvciBjcmVhdGUgbmV3IHByb2Nlc3Mgd2l0aCBkZXBlbmRlY2llcyxcbi8vIGZ1Y250aW9uIGFuZCBvbm1lc3NhZ2UgY2FsbGJhY2suXG4vLyBmb3IgLi4uZGlzcGF0Y2hlci5lbWl0KCdjcmVhdGU6bmV3OnByb2Nlc3MnLCAuLi4pIFxud2ViT3MuZGlzcGF0Y2hlci5lbWl0KFxuICAnY3JlYXRlOm5ldzpwcm9jZXNzJyxcbiAgLy8gcHJvY2VzcyBib2R5XG4gIHtcbiAgICBkZXBzOiBbJ2h0dHBzOi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL3VuZGVyc2NvcmUuanMvMS44LjMvdW5kZXJzY29yZS1taW4uanMnXSxcbiAgICBmbjogKCkgPT4ge1xuICAgICAgbGV0IGFyciA9IFtdO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDAwMDAwOyBpKyspIHtcbiAgICAgICAgYXJyLnB1c2goaSk7XG4gICAgICB9XG4gICAgICBsZXQgb2RkcyA9IF8uZmlsdGVyKGFyciwgKGl0ZW0pID0+IHtcbiAgICAgICAgaWYgKGl0ZW0gJSAyICE9IDApIHtcbiAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHBvc3RNZXNzYWdlKHtvZGRzOiBvZGRzfSk7XG5cbiAgICAgIC8vIHRoaXMgZXhhbXBsZSBmb3IgaW1wbGVtZW50YXRpb24gcHJvY2VzcyB3b3JrIGZyb20gZGV2dG9vbHMgYnkgd2ViT3MucHJvY2Vzcy5xdWV1ZVxuICAgICAgLy8gZm9yIHJlcHJvZHVjZSB0aGlzIHdyaXRlIHRoaXMgbGluZSBpbiBkZXZ0b29sc1xuICAgICAgLy8gd2ViT3MucHJvY2Vzcy5xdWV1ZVswXS5wb3N0TWVzc2FnZShbMSwgMiwgMywgNF0pO1xuICAgICAgLy8gTk9URSDWidaJ1okgUGxlYXNlIGJlIGF0dGVudGl2ZSBpdCB3aWxsIGJlIHdvcmsgd2hlbiB0ZXJtaW5hdGUgZmxhZyBpcyBmYWxzZSBcblxuICAgICAgb25tZXNzYWdlID0gKGUpID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IF8uZmlsdGVyKGUuZGF0YSwgKGl0ZW0pID0+IHtcbiAgICAgICAgICBpZiAoaXRlbSAlIDIgPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBwb3N0TWVzc2FnZSh7ZXZlbnM6IHJlc3VsdH0pO1xuICAgICAgfTtcbiAgICB9XG4gIH0sXG4gIC8vIG9wdGlvbnNcbiAge1xuICAgIC8vIG9ubWVzc2FnZVxuICAgIG9ubWVzc2FnZShlKSB7XG4gICAgICBsb2coJ0Zyb20gYW5vdGhlciBwcm9jZXNzIDo6OiAnLCBlLmRhdGEpO1xuICAgIH0sXG4gICAgLy8gb25lcnJvclxuICAgIG9uZXJyb3IoZXJyKSB7XG4gICAgICBsb2coJ0Zyb20gYW5vdGhlciBwcm9jZXNzIDo6OiAnLCBlcnIpO1xuICAgIH0sXG5cbiAgICB0ZXJtaW5hdGU6IGZhbHNlXG4gIH1cbik7XG5cbi8vIHRlc3QgZm9yIGNyZWF0ZSBuZXcgcHJvY2VzcyB3aXRoIGRlcGVuZGVjaWVzLFxuLy8gZnVjbnRpb24gYW5kIG9ubWVzc2FnZSBjYWxsYmFjay5cbi8vIGZvciB3ZWJPcy5wcm9jZXNzLmNyZWF0ZSguLi4pXG53ZWJPcy5wcm9jZXNzLmNyZWF0ZShcbiAgLy8gcHJvY2VzcyBib2R5XG4gIHtcbiAgICBkZXBzOiBbJ2h0dHBzOi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL3VuZGVyc2NvcmUuanMvMS44LjMvdW5kZXJzY29yZS1taW4uanMnXSxcbiAgICBmbjogKCkgPT4ge1xuICAgICAgbGV0IGFyciA9IFtdO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDAwMDAwOyBpKyspIHtcbiAgICAgICAgYXJyLnB1c2goaSk7XG4gICAgICB9XG4gICAgICBsZXQgb2RkcyA9IF8uZmlsdGVyKGFyciwgKGl0ZW0pID0+IHtcbiAgICAgICAgaWYgKGl0ZW0gJSAyICE9IDApIHtcbiAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHBvc3RNZXNzYWdlKHtvZGRzOiBvZGRzfSk7XG5cbiAgICAgIC8vIHRoaXMgZXhhbXBsZSBmb3IgaW1wbGVtZW50YXRpb24gcHJvY2VzcyB3b3JrIGZyb20gZGV2dG9vbHMgYnkgd2ViT3MucHJvY2Vzcy5xdWV1ZVxuICAgICAgLy8gZm9yIHJlcHJvZHVjZSB0aGlzIHdyaXRlIHRoaXMgbGluZSBpbiBkZXZ0b29sc1xuICAgICAgLy8gd2ViT3MucHJvY2Vzcy5xdWV1ZVswXS5wb3N0TWVzc2FnZShbMSwgMiwgMywgNF0pO1xuICAgICAgLy8gTk9URSDWidaJ1okgUGxlYXNlIGJlIGF0dGVudGl2ZSBpdCB3aWxsIGJlIHdvcmsgd2hlbiB0ZXJtaW5hdGUgZmxhZyBpcyBmYWxzZSBcblxuICAgICAgb25tZXNzYWdlID0gKGUpID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IF8uZmlsdGVyKGUuZGF0YSwgKGl0ZW0pID0+IHtcbiAgICAgICAgICBpZiAoaXRlbSAlIDIgPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBwb3N0TWVzc2FnZSh7ZXZlbnM6IHJlc3VsdH0pO1xuICAgICAgfTtcbiAgICB9XG4gIH0sXG4gIC8vIG9wdGlvbnNcbiAge1xuICAgIC8vIG9ubWVzc2FnZVxuICAgIG9ubWVzc2FnZShlKSB7XG4gICAgICBsb2coJ0Zyb20gYW5vdGhlciBwcm9jZXNzIDo6OiAnLCBlLmRhdGEpO1xuICAgIH0sXG4gICAgLy8gb25lcnJvclxuICAgIG9uZXJyb3IoZXJyKSB7XG4gICAgICBsb2coJ0Zyb20gYW5vdGhlciBwcm9jZXNzIDo6OiAnLCBlcnIpO1xuICAgIH0sXG5cbiAgICB0ZXJtaW5hdGU6IGZhbHNlXG4gIH1cbik7XG5cbi8vIENyZWF0ZSBtYWluIHdvcmtlcnNcbi8vIC4uLlxuXG4vLyBUZXN0IGZvciBuZXcgYXBwbGljYXRpb24gd2l0aCBhbm90aGVyIHByb2Nlc3MgY2FsYyBsb2dpY1xuLy8gLi4uIl0sIm5hbWVzIjpbInJlcXVpcmUkJDAiLCJpbmRleCIsImxvZyIsImRlYnVnIiwiRUUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBSUEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFBO0FBQ1osSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQUNkLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7QUFDZCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO0FBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQTs7Ozs7Ozs7Ozs7Ozs7OztBQWdCbEIsU0FBYyxHQUFHLFVBQVUsR0FBRyxFQUFFLE9BQU8sRUFBRTtFQUN2QyxPQUFPLEdBQUcs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O0lBRXBDLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNsRSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztHQUN6Qjs7RUFFRCxLQUFLLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztFQUM1QixLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7RUFDM0MsS0FBSyxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUM7RUFDdEMsS0FBSyxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7OztFQUdyQyxJQUFJLFVBQVUsS0FBSyxPQUFPLE9BQU8sQ0FBQyxJQUFJLEVBQUU7SUFDdEMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNyQjs7RUFFRCxPQUFPLEtBQUssQ0FBQztDQUNkOzs7Ozs7Ozs7O0FBVUQsU0FBUyxNQUFNLENBQUMsVUFBVSxFQUFFO0VBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7O0VBRXpCLElBQUksS0FBSyxHQUFHLENBQUMsVUFBVSxJQUFJLEVBQUUsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7RUFDL0MsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQzs7RUFFdkIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtJQUM1QixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVM7SUFDeEIsVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzVDLElBQUksVUFBVSxDQUFDLENBQUMsQ0FB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QUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO01BQ2xFLEtBQUssQ0FBQyxFQUFFLE9BQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztNQUN0RSxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO01BQzFFLEtBQUssQ0FBQyxFQUFFLE9BQU8sU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDO0tBQy9FOztJQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7TUFDbEQsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDNUI7O0lBRUQsU0FBUyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztHQUM3QyxNQUFNO0lBQ0wsSUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU07UUFDekIsQ0FBQyxDQUFDOztJQUVOLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO01BQzNCLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7TUFFcEYsUUFBUSxHQUFHO1FBQ1QsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTTtRQUMxRCxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTTtRQUM5RCxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDbEUsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTTtRQUN0RTtVQUNFLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM3RCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztXQUM1Qjs7VUFFRCxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO09BQ3JEO0tBQ0Y7R0FDRjs7RUFFRCxPQUFPLElBQUksQ0FBQztDQUNiLENBQUM7Ozs7Ozs7Ozs7O0FBV0YsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUU7RUFDMUQsSUFBSSxRQUFRLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sSUFBSSxJQUFJLENBQUM7TUFDdEMsR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQzs7RUFFMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO09BQ3JFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztPQUM1RCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQzs7RUFFdkQsT0FBTyxJQUFJLENBQUM7Q0FDYixDQUFDOzs7Ozs7Ozs7OztBQVdGLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFO0VBQzlELElBQUksUUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLElBQUksSUFBSSxFQUFFLElBQUksQ0FBQztNQUM1QyxHQUFHLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDOztFQUUxQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7T0FDckUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQzVELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDOztFQUV2RCxPQUFPLElBQUksQ0FBQztDQUNiLENBQUM7Ozs7Ozs7Ozs7OztBQVlGLFlBQVksQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFHLFNBQVMsY0FBYyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTtFQUN4RixJQUFJLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7O0VBRTFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sSUFBSSxDQUFDO0VBQ3BDLElBQUksQ0FBQyxFQUFFLEVBQUU7SUFDUCxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO1NBQ3RELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM5QixPQUFPLElBQUksQ0FBQztHQUNiOztFQUVELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7O0VBRWxDLElBQUksU0FBUyxDQUFDLEVBQUUsRUFBRTtJQUNoQjtTQUNLLFNBQVMsQ0FBQyxFQUFFLEtBQUssRUFBRTtVQUNsQixDQUFDLElBQUksSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDO1VBQ3hCLENBQUMsT0FBTyxJQUFJLFNBQVMsQ0FBQyxPQUFPLEtBQUssT0FBTyxDQUFDO01BQzlDO01BQ0EsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztXQUN0RCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDL0I7R0FDRixNQUFNO0lBQ0wsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLEVBQUUsRUFBRSxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO01BQ3ZFO1dBQ0ssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFO1lBQ3JCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDM0IsT0FBTyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssT0FBTyxDQUFDO1FBQ2hEO1FBQ0EsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUMzQjtLQUNGOzs7OztJQUtELElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7U0FDM0UsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztTQUMzRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7R0FDL0I7O0VBRUQsT0FBTyxJQUFJLENBQUM7Q0FDYixDQUFDOzs7Ozs7Ozs7QUFTRixZQUFZLENBQUMsU0FBUyxDQUFDLGtCQUFrQixHQUFHLFNBQVMsa0JBQWtCLENBQUMsS0FBSyxFQUFFO0VBQzdFLElBQUksR0FBRyxDQUFDOztFQUVSLElBQUksS0FBSyxFQUFFO0lBQ1QsR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUN0QyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7TUFDckIsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztXQUN0RCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDL0I7R0FDRixNQUFNO0lBQ0wsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO0lBQzVCLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO0dBQ3ZCOztFQUVELE9BQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQzs7Ozs7QUFLRixZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQztBQUNuRSxZQUFZLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQzs7Ozs7QUFLL0QsWUFBWSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEdBQUcsU0FBUyxlQUFlLEdBQUc7RUFDbEUsT0FBTyxJQUFJLENBQUM7Q0FDYixDQUFDOzs7OztBQUtGLFlBQVksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDOzs7OztBQUsvQixZQUFZLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQzs7Ozs7QUFLekMsQUFBSSxBQUE2QixBQUFFO0VBQ2pDLGNBQWMsR0FBRyxZQUFZLENBQUM7Q0FDL0I7OztBQ3RURDs7OztBQUlBLEFBRUEsTUFBTUUsS0FBRyxHQUFHQyxTQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7QUFFcEMsQUFBSSxBQUFvQixBQUFFO0VBQ3hCQSxTQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ25CLEFBRUE7O0FBRUQsQUFNQSxBQUFlLE1BQU0sVUFBVSxTQUFTQyxPQUFFLENBQUM7RUFDekMsV0FBVyxHQUFHO0lBQ1osS0FBSyxFQUFFLENBQUM7SUFDUkYsS0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7R0FDMUI7OztBQ3hCSDs7Ozs7OztBQU9BLEFBQWUsTUFBTSxlQUFlLENBQUM7Ozs7O0VBS25DLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFO0lBQ2hCLElBQUksSUFBSSxJQUFJLFFBQVEsRUFBRTtNQUNwQixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUM7S0FDcEI7SUFDRCxJQUFJLElBQUksSUFBSSxNQUFNLEVBQUU7TUFDbEIsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUNELE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3JCOzs7Ozs7O0VBT0QsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFO0lBQ3ZCLElBQUksSUFBSSxJQUFJLE1BQU0sSUFBSSxJQUFJLElBQUksTUFBTSxFQUFFO01BQ3BDLE1BQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztLQUMzRCxNQUFNO01BQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQztNQUNyQixPQUFPLElBQUksQ0FBQztLQUNiO0dBQ0Y7O0VBRUQsY0FBYyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7SUFDM0IsSUFBSSxJQUFJLElBQUksTUFBTSxJQUFJLElBQUksSUFBSSxNQUFNLEVBQUU7TUFDcEMsTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0tBQzNEO0dBQ0Y7OztBQ3hDSDs7Ozs7QUFLQSxBQVVBLEFBQWUsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRTtFQUM3QyxJQUFJLE9BQU8sQ0FBQztFQUNaLElBQUksQ0FBQyxPQUFPLEtBQUssT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFOztJQUU3QyxPQUFPLEdBQUcsSUFBSSxlQUFlLENBQUM7R0FDL0IsTUFBTSxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7SUFDMUIsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxlQUFlLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQy9EO0VBQ0QsT0FBTyxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7Q0FDaEM7O0FDeEJEOzs7Ozs7QUFNQSxBQUVBLE1BQU1BLEtBQUcsR0FBR0MsU0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDOztBQUVsQyxBQUFJLEFBQW9CLEFBQUU7RUFDeEJBLFNBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDbkIsQUFFQTs7QUFFRCxBQUlBLEFBQWUsTUFBTSxJQUFJLENBQUM7Ozs7O0VBS3hCLFdBQVcsQ0FBQyxVQUFVLEVBQUU7SUFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDN0IsSUFBSSxDQUFDLElBQUksR0FBRyxpQkFBaUIsQ0FBQztJQUM5QixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUNsQixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUNyQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztHQUMxQjs7OztFQUlELGlCQUFpQixHQUFHO0lBQ2xCLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDOUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDckQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdkQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztHQUN4RTs7Ozs7RUFLRCxlQUFlLEdBQUc7SUFDaEIsSUFBSSxVQUFVLEdBQUc7TUFDZixJQUFJLEVBQUUsWUFBWTtLQUNuQixDQUFDOztJQUVGLElBQUksQ0FBQyxZQUFZLENBQUM7TUFDaEIsR0FBRyxFQUFFLFVBQVU7S0FDaEIsQ0FBQyxDQUFDOztJQUVILElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtNQUNqQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO0tBQ3hDLENBQUMsQ0FBQztHQUNKOzs7Ozs7RUFNRCxZQUFZLEdBQUc7SUFDYixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7R0FDeEI7Ozs7Ozs7O0VBUUQsWUFBWSxDQUFDLE9BQU8sRUFBRTtJQUNwQixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTs7Ozs7TUFLaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDOzZEQUNzQyxDQUFDLENBQUMsQ0FBQztLQUMzRDtJQUNELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3BDRCxLQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7Ozs7O0dBTXZCOzs7Ozs7O0VBT0QsU0FBUyxDQUFDLE9BQU8sRUFBRTtJQUNqQixJQUFJLENBQUMsT0FBTyxLQUFLLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtNQUN6QyxNQUFNLElBQUksS0FBSyxDQUFDLENBQUM7NkRBQ3NDLENBQUMsQ0FBQyxDQUFDO0tBQzNELE1BQU0sSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFO01BQ3RCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO01BQ2xGQSxLQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7S0FDbkI7R0FDRjs7Ozs7Ozs7RUFRRCxZQUFZLENBQUMsSUFBSSxFQUFFO0lBQ2pCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLENBQUM7R0FDckQ7Ozs7Ozs7Ozs7RUFVRCxZQUFZLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRTtJQUN0QixJQUFJLEtBQUssQ0FBQztJQUNWLElBQUksR0FBRyxFQUFFO01BQ1AsS0FBSyxHQUFHLEdBQUcsQ0FBQztLQUNiLE1BQU07TUFDTCxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztLQUN0QjtJQUNELE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQztHQUM1Qzs7Ozs7OztFQU9ELE9BQU8sQ0FBQyxLQUFLLEVBQUU7SUFDYixJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsRCxJQUFJLFdBQVcsRUFBRTtNQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQztLQUMvQztJQUNELFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QyxJQUFJLFdBQVcsRUFBRTtNQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQztLQUMvQztJQUNELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQzFCOzs7Ozs7OztFQVFELFFBQVEsQ0FBQyxPQUFPLEVBQUU7SUFDaEIsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDakQsSUFBSSxVQUFVLEVBQUU7TUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtRQUN4RCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7T0FDbEM7O0tBRUYsTUFBTTtNQUNMLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztLQUN4QztHQUNGOzs7QUN4S0g7Ozs7Ozs7O0FBUUEsQUFBZSxNQUFNLGdCQUFnQixDQUFDOzs7Ozs7RUFNcEMsV0FBVyxDQUFDLE9BQU8sRUFBRTtJQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUN2QixJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUU7TUFDaEIsSUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNwQyxNQUFNO01BQ0wsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7S0FDaEI7O0lBRUQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDcEMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0dBQ3JCOzs7Ozs7O0VBT0QsWUFBWSxHQUFHOztJQUViLE9BQU8sUUFBUTtNQUNiLENBQUM7b0JBQ2EsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO2VBQ2pCLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7O01BRTNCLENBQUM7S0FDRixDQUFDO0dBQ0g7OztBQ3hDSDs7OztBQUlBLEFBRUEsQUFFQSxNQUFNQSxLQUFHLEdBQUdDLFNBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFakMsQUFBSSxBQUFvQixBQUFFO0VBQ3hCQSxTQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ25CLEFBRUE7Ozs7OztBQU1ELEFBQWUsTUFBTSxPQUFPLENBQUM7Ozs7O0VBSzNCLFdBQVcsQ0FBQyxVQUFVLEVBQUU7SUFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDcEJELEtBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ3pCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0dBQzFCOzs7Ozs7RUFNRCxpQkFBaUIsR0FBRztJQUNsQixJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQ2pFOzs7Ozs7Ozs7OztFQVdELE1BQU0sQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFO0lBQzNCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQ25EOzs7Ozs7OztFQVFELFVBQVUsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFO0lBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQ3RDOzs7Ozs7OztFQVFELFNBQVMsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRTtJQUN6QyxJQUFJLE1BQU0sQ0FBQztJQUNYLElBQUksQ0FBQyxXQUFXLEtBQUssV0FBVyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxFQUFFO01BQ3BELE1BQU0sSUFBSSxLQUFLO01BQ2YsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQW1CRCxDQUFDLENBQUMsQ0FBQztLQUNKLE1BQU0sSUFBSSxPQUFPLFdBQVcsQ0FBQyxFQUFFLEtBQUssVUFBVSxFQUFFO01BQy9DLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDLENBQUM7S0FDM0QsTUFBTSxJQUFJLFdBQVcsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtNQUMvRCxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMscUNBQXFDLENBQUMsQ0FBQyxDQUFDO0tBQzFELE1BQU07TUFDTCxJQUFJLFlBQVksR0FBRyxJQUFJLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDOztNQUVwRSxJQUFJLElBQUksR0FBRyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7O01BRW5DLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs7TUFFcEUsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7TUFDOUQsTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7TUFFL0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7O01BRTVCLElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRTtRQUNyQixJQUFJLE9BQU8sT0FBTyxDQUFDLFNBQVMsS0FBSyxVQUFVLEVBQUU7VUFDM0MsSUFBSSxPQUFPLENBQUMsU0FBUyxFQUFFO1lBQ3JCLElBQUksT0FBTyxPQUFPLENBQUMsU0FBUyxLQUFLLFNBQVMsRUFBRTtjQUMxQyxNQUFNLENBQUMsU0FBUyxHQUFHLFdBQVc7Z0JBQzVCLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDekMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO2VBQ3BCLENBQUM7YUFDSCxNQUFNO2NBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLDRDQUE0QyxDQUFDLENBQUMsQ0FBQzthQUNqRTtXQUNGLE1BQU07WUFDTCxNQUFNLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7V0FDdEM7U0FDRixNQUFNO1VBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLDZDQUE2QyxDQUFDLENBQUMsQ0FBQztTQUNsRTtPQUNGOztNQUVELElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRTtRQUNuQixJQUFJLE9BQU8sT0FBTyxDQUFDLE9BQU8sS0FBSyxVQUFVLEVBQUU7VUFDekMsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO1NBQ2xDLE1BQU07VUFDTCxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsMkNBQTJDLENBQUMsQ0FBQyxDQUFDO1NBQ2hFO09BQ0Y7S0FDRjs7SUFFRCxJQUFJLFNBQVMsSUFBSSxNQUFNLEVBQUU7TUFDdkIsT0FBTyxNQUFNLENBQUM7S0FDZjtHQUNGOzs7QUM1SUg7Ozs7QUFJQSxBQUVBLEFBRUEsQUFFQSxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7O0FBRWYsS0FBSyxDQUFDLFVBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBQzs7QUFFbEMsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRXhDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEFBRTlDOzs7O0FDbEJBO0FBQ0EsQUFFQSxNQUFNQSxNQUFHLEdBQUdDLFNBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFN0IsQUFBSSxBQUFvQixBQUFFO0VBQ3hCQSxTQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzs7RUFHbEIsUUFBUSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksV0FBVyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDcEYsb0NBQW9DLEdBQUcsU0FBUyxDQUFDLENBQUM7Q0FDbkQsQUFFQTs7QUFFREQsTUFBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7O0FBRXpCLEFBRUEsTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7OztBQUdyQixBQUdBLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFO0VBQ3RDLEdBQUcsRUFBRTtJQUNILElBQUksRUFBRSxnQkFBZ0I7SUFDdEIsSUFBSSxFQUFFLE9BQU87R0FDZDtDQUNGLENBQUMsQ0FBQzs7O0FBR0gsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7RUFDdEMsR0FBRyxFQUFFO0lBQ0gsSUFBSSxFQUFFLHFCQUFxQjtJQUMzQixJQUFJLEVBQUUsT0FBTzs7SUFFYixPQUFPLEVBQUU7TUFDUCxHQUFHLEVBQUUsSUFBSTs7S0FFVjtHQUNGO0NBQ0YsQ0FBQyxDQUFDOzs7QUFHSCxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztFQUNuQixHQUFHLEVBQUU7SUFDSCxJQUFJLEVBQUUsT0FBTztHQUNkO0NBQ0YsQ0FBQyxDQUFDOzs7OztBQUtILEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSTtFQUNuQixvQkFBb0I7O0VBRXBCO0lBQ0UsSUFBSSxFQUFFLENBQUMsOEVBQThFLENBQUM7SUFDdEYsRUFBRSxFQUFFLE1BQU07TUFDUixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7TUFDYixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ2hDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDYjtNQUNELElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxLQUFLO1FBQ2pDLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7VUFDakIsT0FBTyxJQUFJLENBQUM7U0FDYjtPQUNGLENBQUMsQ0FBQzs7TUFFSCxXQUFXLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzs7Ozs7OztNQU8xQixTQUFTLEdBQUcsQ0FBQyxDQUFDLEtBQUs7UUFDakIsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLO1VBQ3RDLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDakIsT0FBTyxJQUFJLENBQUM7V0FDYjtTQUNGLENBQUMsQ0FBQzs7UUFFSCxXQUFXLENBQUMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztPQUM5QixDQUFDO0tBQ0g7R0FDRjs7RUFFRDs7SUFFRSxTQUFTLENBQUMsQ0FBQyxFQUFFO01BQ1hBLE1BQUcsQ0FBQywyQkFBMkIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDMUM7O0lBRUQsT0FBTyxDQUFDLEdBQUcsRUFBRTtNQUNYQSxNQUFHLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDdkM7O0lBRUQsU0FBUyxFQUFFLEtBQUs7R0FDakI7Q0FDRixDQUFDOzs7OztBQUtGLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTTs7RUFFbEI7SUFDRSxJQUFJLEVBQUUsQ0FBQyw4RUFBOEUsQ0FBQztJQUN0RixFQUFFLEVBQUUsTUFBTTtNQUNSLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztNQUNiLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDaEMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUNiO01BQ0QsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEtBQUs7UUFDakMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtVQUNqQixPQUFPLElBQUksQ0FBQztTQUNiO09BQ0YsQ0FBQyxDQUFDOztNQUVILFdBQVcsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDOzs7Ozs7O01BTzFCLFNBQVMsR0FBRyxDQUFDLENBQUMsS0FBSztRQUNqQixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUs7VUFDdEMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNqQixPQUFPLElBQUksQ0FBQztXQUNiO1NBQ0YsQ0FBQyxDQUFDOztRQUVILFdBQVcsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO09BQzlCLENBQUM7S0FDSDtHQUNGOztFQUVEOztJQUVFLFNBQVMsQ0FBQyxDQUFDLEVBQUU7TUFDWEEsTUFBRyxDQUFDLDJCQUEyQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMxQzs7SUFFRCxPQUFPLENBQUMsR0FBRyxFQUFFO01BQ1hBLE1BQUcsQ0FBQywyQkFBMkIsRUFBRSxHQUFHLENBQUMsQ0FBQztLQUN2Qzs7SUFFRCxTQUFTLEVBQUUsS0FBSztHQUNqQjtDQUNGLENBQUM7Ozs7Ozs7OyJ9
