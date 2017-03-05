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

/** Class representing a process for webos. */

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
   * The 3th param in 'runWorker' method is promisify flag. Different between 'create' and 'newProcess'
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9ub2RlX21vZHVsZXMvbXMvaW5kZXguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZGVidWcvc3JjL2RlYnVnLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2RlYnVnL3NyYy9icm93c2VyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2V2ZW50ZW1pdHRlcjMvaW5kZXguanMiLCIuLi9qcy9jb3JlL2Rpc3BhdGNoZXIuanMiLCIuLi9qcy9saWJzL2FwcC5wcm94eS5oYW5kbGVyLmpzIiwiLi4vanMvbGlicy9wcm94eWluZy5qcyIsIi4uL2pzL2NvcmUvYXBwcy5qcyIsIi4uL2pzL2xpYnMvd29ya2VyU291cmNlLm1ha2VyLmpzIiwiLi4vanMvY29yZS9wcm9jZXNzLmpzIiwiLi4vanMvY29yZS9pbml0LmpzIiwiLi4vanMvbWFpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEhlbHBlcnMuXG4gKi9cblxudmFyIHMgPSAxMDAwXG52YXIgbSA9IHMgKiA2MFxudmFyIGggPSBtICogNjBcbnZhciBkID0gaCAqIDI0XG52YXIgeSA9IGQgKiAzNjUuMjVcblxuLyoqXG4gKiBQYXJzZSBvciBmb3JtYXQgdGhlIGdpdmVuIGB2YWxgLlxuICpcbiAqIE9wdGlvbnM6XG4gKlxuICogIC0gYGxvbmdgIHZlcmJvc2UgZm9ybWF0dGluZyBbZmFsc2VdXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8TnVtYmVyfSB2YWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAdGhyb3dzIHtFcnJvcn0gdGhyb3cgYW4gZXJyb3IgaWYgdmFsIGlzIG5vdCBhIG5vbi1lbXB0eSBzdHJpbmcgb3IgYSBudW1iZXJcbiAqIEByZXR1cm4ge1N0cmluZ3xOdW1iZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHZhbCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWxcbiAgaWYgKHR5cGUgPT09ICdzdHJpbmcnICYmIHZhbC5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIHBhcnNlKHZhbClcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiBpc05hTih2YWwpID09PSBmYWxzZSkge1xuICAgIHJldHVybiBvcHRpb25zLmxvbmcgP1xuXHRcdFx0Zm10TG9uZyh2YWwpIDpcblx0XHRcdGZtdFNob3J0KHZhbClcbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoJ3ZhbCBpcyBub3QgYSBub24tZW1wdHkgc3RyaW5nIG9yIGEgdmFsaWQgbnVtYmVyLiB2YWw9JyArIEpTT04uc3RyaW5naWZ5KHZhbCkpXG59XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGBzdHJgIGFuZCByZXR1cm4gbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICBzdHIgPSBTdHJpbmcoc3RyKVxuICBpZiAoc3RyLmxlbmd0aCA+IDEwMDAwKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgdmFyIG1hdGNoID0gL14oKD86XFxkKyk/XFwuP1xcZCspICoobWlsbGlzZWNvbmRzP3xtc2Vjcz98bXN8c2Vjb25kcz98c2Vjcz98c3xtaW51dGVzP3xtaW5zP3xtfGhvdXJzP3xocnM/fGh8ZGF5cz98ZHx5ZWFycz98eXJzP3x5KT8kL2kuZXhlYyhzdHIpXG4gIGlmICghbWF0Y2gpIHtcbiAgICByZXR1cm5cbiAgfVxuICB2YXIgbiA9IHBhcnNlRmxvYXQobWF0Y2hbMV0pXG4gIHZhciB0eXBlID0gKG1hdGNoWzJdIHx8ICdtcycpLnRvTG93ZXJDYXNlKClcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAneWVhcnMnOlxuICAgIGNhc2UgJ3llYXInOlxuICAgIGNhc2UgJ3lycyc6XG4gICAgY2FzZSAneXInOlxuICAgIGNhc2UgJ3knOlxuICAgICAgcmV0dXJuIG4gKiB5XG4gICAgY2FzZSAnZGF5cyc6XG4gICAgY2FzZSAnZGF5JzpcbiAgICBjYXNlICdkJzpcbiAgICAgIHJldHVybiBuICogZFxuICAgIGNhc2UgJ2hvdXJzJzpcbiAgICBjYXNlICdob3VyJzpcbiAgICBjYXNlICdocnMnOlxuICAgIGNhc2UgJ2hyJzpcbiAgICBjYXNlICdoJzpcbiAgICAgIHJldHVybiBuICogaFxuICAgIGNhc2UgJ21pbnV0ZXMnOlxuICAgIGNhc2UgJ21pbnV0ZSc6XG4gICAgY2FzZSAnbWlucyc6XG4gICAgY2FzZSAnbWluJzpcbiAgICBjYXNlICdtJzpcbiAgICAgIHJldHVybiBuICogbVxuICAgIGNhc2UgJ3NlY29uZHMnOlxuICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgY2FzZSAnc2Vjcyc6XG4gICAgY2FzZSAnc2VjJzpcbiAgICBjYXNlICdzJzpcbiAgICAgIHJldHVybiBuICogc1xuICAgIGNhc2UgJ21pbGxpc2Vjb25kcyc6XG4gICAgY2FzZSAnbWlsbGlzZWNvbmQnOlxuICAgIGNhc2UgJ21zZWNzJzpcbiAgICBjYXNlICdtc2VjJzpcbiAgICBjYXNlICdtcyc6XG4gICAgICByZXR1cm4gblxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cbn1cblxuLyoqXG4gKiBTaG9ydCBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBmbXRTaG9ydChtcykge1xuICBpZiAobXMgPj0gZCkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gZCkgKyAnZCdcbiAgfVxuICBpZiAobXMgPj0gaCkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gaCkgKyAnaCdcbiAgfVxuICBpZiAobXMgPj0gbSkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gbSkgKyAnbSdcbiAgfVxuICBpZiAobXMgPj0gcykge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gcykgKyAncydcbiAgfVxuICByZXR1cm4gbXMgKyAnbXMnXG59XG5cbi8qKlxuICogTG9uZyBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBmbXRMb25nKG1zKSB7XG4gIHJldHVybiBwbHVyYWwobXMsIGQsICdkYXknKSB8fFxuICAgIHBsdXJhbChtcywgaCwgJ2hvdXInKSB8fFxuICAgIHBsdXJhbChtcywgbSwgJ21pbnV0ZScpIHx8XG4gICAgcGx1cmFsKG1zLCBzLCAnc2Vjb25kJykgfHxcbiAgICBtcyArICcgbXMnXG59XG5cbi8qKlxuICogUGx1cmFsaXphdGlvbiBoZWxwZXIuXG4gKi9cblxuZnVuY3Rpb24gcGx1cmFsKG1zLCBuLCBuYW1lKSB7XG4gIGlmIChtcyA8IG4pIHtcbiAgICByZXR1cm5cbiAgfVxuICBpZiAobXMgPCBuICogMS41KSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IobXMgLyBuKSArICcgJyArIG5hbWVcbiAgfVxuICByZXR1cm4gTWF0aC5jZWlsKG1zIC8gbikgKyAnICcgKyBuYW1lICsgJ3MnXG59XG4iLCJcbi8qKlxuICogVGhpcyBpcyB0aGUgY29tbW9uIGxvZ2ljIGZvciBib3RoIHRoZSBOb2RlLmpzIGFuZCB3ZWIgYnJvd3NlclxuICogaW1wbGVtZW50YXRpb25zIG9mIGBkZWJ1ZygpYC5cbiAqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gY3JlYXRlRGVidWcuZGVidWcgPSBjcmVhdGVEZWJ1Zy5kZWZhdWx0ID0gY3JlYXRlRGVidWc7XG5leHBvcnRzLmNvZXJjZSA9IGNvZXJjZTtcbmV4cG9ydHMuZGlzYWJsZSA9IGRpc2FibGU7XG5leHBvcnRzLmVuYWJsZSA9IGVuYWJsZTtcbmV4cG9ydHMuZW5hYmxlZCA9IGVuYWJsZWQ7XG5leHBvcnRzLmh1bWFuaXplID0gcmVxdWlyZSgnbXMnKTtcblxuLyoqXG4gKiBUaGUgY3VycmVudGx5IGFjdGl2ZSBkZWJ1ZyBtb2RlIG5hbWVzLCBhbmQgbmFtZXMgdG8gc2tpcC5cbiAqL1xuXG5leHBvcnRzLm5hbWVzID0gW107XG5leHBvcnRzLnNraXBzID0gW107XG5cbi8qKlxuICogTWFwIG9mIHNwZWNpYWwgXCIlblwiIGhhbmRsaW5nIGZ1bmN0aW9ucywgZm9yIHRoZSBkZWJ1ZyBcImZvcm1hdFwiIGFyZ3VtZW50LlxuICpcbiAqIFZhbGlkIGtleSBuYW1lcyBhcmUgYSBzaW5nbGUsIGxvd2VyIG9yIHVwcGVyLWNhc2UgbGV0dGVyLCBpLmUuIFwiblwiIGFuZCBcIk5cIi5cbiAqL1xuXG5leHBvcnRzLmZvcm1hdHRlcnMgPSB7fTtcblxuLyoqXG4gKiBQcmV2aW91cyBsb2cgdGltZXN0YW1wLlxuICovXG5cbnZhciBwcmV2VGltZTtcblxuLyoqXG4gKiBTZWxlY3QgYSBjb2xvci5cbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlbGVjdENvbG9yKG5hbWVzcGFjZSkge1xuICB2YXIgaGFzaCA9IDAsIGk7XG5cbiAgZm9yIChpIGluIG5hbWVzcGFjZSkge1xuICAgIGhhc2ggID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgKyBuYW1lc3BhY2UuY2hhckNvZGVBdChpKTtcbiAgICBoYXNoIHw9IDA7IC8vIENvbnZlcnQgdG8gMzJiaXQgaW50ZWdlclxuICB9XG5cbiAgcmV0dXJuIGV4cG9ydHMuY29sb3JzW01hdGguYWJzKGhhc2gpICUgZXhwb3J0cy5jb2xvcnMubGVuZ3RoXTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBkZWJ1Z2dlciB3aXRoIHRoZSBnaXZlbiBgbmFtZXNwYWNlYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gY3JlYXRlRGVidWcobmFtZXNwYWNlKSB7XG5cbiAgZnVuY3Rpb24gZGVidWcoKSB7XG4gICAgLy8gZGlzYWJsZWQ/XG4gICAgaWYgKCFkZWJ1Zy5lbmFibGVkKSByZXR1cm47XG5cbiAgICB2YXIgc2VsZiA9IGRlYnVnO1xuXG4gICAgLy8gc2V0IGBkaWZmYCB0aW1lc3RhbXBcbiAgICB2YXIgY3VyciA9ICtuZXcgRGF0ZSgpO1xuICAgIHZhciBtcyA9IGN1cnIgLSAocHJldlRpbWUgfHwgY3Vycik7XG4gICAgc2VsZi5kaWZmID0gbXM7XG4gICAgc2VsZi5wcmV2ID0gcHJldlRpbWU7XG4gICAgc2VsZi5jdXJyID0gY3VycjtcbiAgICBwcmV2VGltZSA9IGN1cnI7XG5cbiAgICAvLyB0dXJuIHRoZSBgYXJndW1lbnRzYCBpbnRvIGEgcHJvcGVyIEFycmF5XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGFyZ3NbMF0gPSBleHBvcnRzLmNvZXJjZShhcmdzWzBdKTtcblxuICAgIGlmICgnc3RyaW5nJyAhPT0gdHlwZW9mIGFyZ3NbMF0pIHtcbiAgICAgIC8vIGFueXRoaW5nIGVsc2UgbGV0J3MgaW5zcGVjdCB3aXRoICVPXG4gICAgICBhcmdzLnVuc2hpZnQoJyVPJyk7XG4gICAgfVxuXG4gICAgLy8gYXBwbHkgYW55IGBmb3JtYXR0ZXJzYCB0cmFuc2Zvcm1hdGlvbnNcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIGFyZ3NbMF0gPSBhcmdzWzBdLnJlcGxhY2UoLyUoW2EtekEtWiVdKS9nLCBmdW5jdGlvbihtYXRjaCwgZm9ybWF0KSB7XG4gICAgICAvLyBpZiB3ZSBlbmNvdW50ZXIgYW4gZXNjYXBlZCAlIHRoZW4gZG9uJ3QgaW5jcmVhc2UgdGhlIGFycmF5IGluZGV4XG4gICAgICBpZiAobWF0Y2ggPT09ICclJScpIHJldHVybiBtYXRjaDtcbiAgICAgIGluZGV4Kys7XG4gICAgICB2YXIgZm9ybWF0dGVyID0gZXhwb3J0cy5mb3JtYXR0ZXJzW2Zvcm1hdF07XG4gICAgICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGZvcm1hdHRlcikge1xuICAgICAgICB2YXIgdmFsID0gYXJnc1tpbmRleF07XG4gICAgICAgIG1hdGNoID0gZm9ybWF0dGVyLmNhbGwoc2VsZiwgdmFsKTtcblxuICAgICAgICAvLyBub3cgd2UgbmVlZCB0byByZW1vdmUgYGFyZ3NbaW5kZXhdYCBzaW5jZSBpdCdzIGlubGluZWQgaW4gdGhlIGBmb3JtYXRgXG4gICAgICAgIGFyZ3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgaW5kZXgtLTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9KTtcblxuICAgIC8vIGFwcGx5IGVudi1zcGVjaWZpYyBmb3JtYXR0aW5nIChjb2xvcnMsIGV0Yy4pXG4gICAgZXhwb3J0cy5mb3JtYXRBcmdzLmNhbGwoc2VsZiwgYXJncyk7XG5cbiAgICB2YXIgbG9nRm4gPSBkZWJ1Zy5sb2cgfHwgZXhwb3J0cy5sb2cgfHwgY29uc29sZS5sb2cuYmluZChjb25zb2xlKTtcbiAgICBsb2dGbi5hcHBseShzZWxmLCBhcmdzKTtcbiAgfVxuXG4gIGRlYnVnLm5hbWVzcGFjZSA9IG5hbWVzcGFjZTtcbiAgZGVidWcuZW5hYmxlZCA9IGV4cG9ydHMuZW5hYmxlZChuYW1lc3BhY2UpO1xuICBkZWJ1Zy51c2VDb2xvcnMgPSBleHBvcnRzLnVzZUNvbG9ycygpO1xuICBkZWJ1Zy5jb2xvciA9IHNlbGVjdENvbG9yKG5hbWVzcGFjZSk7XG5cbiAgLy8gZW52LXNwZWNpZmljIGluaXRpYWxpemF0aW9uIGxvZ2ljIGZvciBkZWJ1ZyBpbnN0YW5jZXNcbiAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBleHBvcnRzLmluaXQpIHtcbiAgICBleHBvcnRzLmluaXQoZGVidWcpO1xuICB9XG5cbiAgcmV0dXJuIGRlYnVnO1xufVxuXG4vKipcbiAqIEVuYWJsZXMgYSBkZWJ1ZyBtb2RlIGJ5IG5hbWVzcGFjZXMuIFRoaXMgY2FuIGluY2x1ZGUgbW9kZXNcbiAqIHNlcGFyYXRlZCBieSBhIGNvbG9uIGFuZCB3aWxkY2FyZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZW5hYmxlKG5hbWVzcGFjZXMpIHtcbiAgZXhwb3J0cy5zYXZlKG5hbWVzcGFjZXMpO1xuXG4gIHZhciBzcGxpdCA9IChuYW1lc3BhY2VzIHx8ICcnKS5zcGxpdCgvW1xccyxdKy8pO1xuICB2YXIgbGVuID0gc3BsaXQubGVuZ3RoO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoIXNwbGl0W2ldKSBjb250aW51ZTsgLy8gaWdub3JlIGVtcHR5IHN0cmluZ3NcbiAgICBuYW1lc3BhY2VzID0gc3BsaXRbaV0ucmVwbGFjZSgvXFwqL2csICcuKj8nKTtcbiAgICBpZiAobmFtZXNwYWNlc1swXSA9PT0gJy0nKSB7XG4gICAgICBleHBvcnRzLnNraXBzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lc3BhY2VzLnN1YnN0cigxKSArICckJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleHBvcnRzLm5hbWVzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lc3BhY2VzICsgJyQnKSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRGlzYWJsZSBkZWJ1ZyBvdXRwdXQuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkaXNhYmxlKCkge1xuICBleHBvcnRzLmVuYWJsZSgnJyk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBtb2RlIG5hbWUgaXMgZW5hYmxlZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBlbmFibGVkKG5hbWUpIHtcbiAgdmFyIGksIGxlbjtcbiAgZm9yIChpID0gMCwgbGVuID0gZXhwb3J0cy5za2lwcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChleHBvcnRzLnNraXBzW2ldLnRlc3QobmFtZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgZm9yIChpID0gMCwgbGVuID0gZXhwb3J0cy5uYW1lcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChleHBvcnRzLm5hbWVzW2ldLnRlc3QobmFtZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogQ29lcmNlIGB2YWxgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBjb2VyY2UodmFsKSB7XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBFcnJvcikgcmV0dXJuIHZhbC5zdGFjayB8fCB2YWwubWVzc2FnZTtcbiAgcmV0dXJuIHZhbDtcbn1cbiIsIi8qKlxuICogVGhpcyBpcyB0aGUgd2ViIGJyb3dzZXIgaW1wbGVtZW50YXRpb24gb2YgYGRlYnVnKClgLlxuICpcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2RlYnVnJyk7XG5leHBvcnRzLmxvZyA9IGxvZztcbmV4cG9ydHMuZm9ybWF0QXJncyA9IGZvcm1hdEFyZ3M7XG5leHBvcnRzLnNhdmUgPSBzYXZlO1xuZXhwb3J0cy5sb2FkID0gbG9hZDtcbmV4cG9ydHMudXNlQ29sb3JzID0gdXNlQ29sb3JzO1xuZXhwb3J0cy5zdG9yYWdlID0gJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZVxuICAgICAgICAgICAgICAgJiYgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZS5zdG9yYWdlXG4gICAgICAgICAgICAgICAgICA/IGNocm9tZS5zdG9yYWdlLmxvY2FsXG4gICAgICAgICAgICAgICAgICA6IGxvY2Fsc3RvcmFnZSgpO1xuXG4vKipcbiAqIENvbG9ycy5cbiAqL1xuXG5leHBvcnRzLmNvbG9ycyA9IFtcbiAgJ2xpZ2h0c2VhZ3JlZW4nLFxuICAnZm9yZXN0Z3JlZW4nLFxuICAnZ29sZGVucm9kJyxcbiAgJ2RvZGdlcmJsdWUnLFxuICAnZGFya29yY2hpZCcsXG4gICdjcmltc29uJ1xuXTtcblxuLyoqXG4gKiBDdXJyZW50bHkgb25seSBXZWJLaXQtYmFzZWQgV2ViIEluc3BlY3RvcnMsIEZpcmVmb3ggPj0gdjMxLFxuICogYW5kIHRoZSBGaXJlYnVnIGV4dGVuc2lvbiAoYW55IEZpcmVmb3ggdmVyc2lvbikgYXJlIGtub3duXG4gKiB0byBzdXBwb3J0IFwiJWNcIiBDU1MgY3VzdG9taXphdGlvbnMuXG4gKlxuICogVE9ETzogYWRkIGEgYGxvY2FsU3RvcmFnZWAgdmFyaWFibGUgdG8gZXhwbGljaXRseSBlbmFibGUvZGlzYWJsZSBjb2xvcnNcbiAqL1xuXG5mdW5jdGlvbiB1c2VDb2xvcnMoKSB7XG4gIC8vIE5COiBJbiBhbiBFbGVjdHJvbiBwcmVsb2FkIHNjcmlwdCwgZG9jdW1lbnQgd2lsbCBiZSBkZWZpbmVkIGJ1dCBub3QgZnVsbHlcbiAgLy8gaW5pdGlhbGl6ZWQuIFNpbmNlIHdlIGtub3cgd2UncmUgaW4gQ2hyb21lLCB3ZSdsbCBqdXN0IGRldGVjdCB0aGlzIGNhc2VcbiAgLy8gZXhwbGljaXRseVxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93ICYmIHR5cGVvZiB3aW5kb3cucHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnByb2Nlc3MudHlwZSA9PT0gJ3JlbmRlcmVyJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gaXMgd2Via2l0PyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNjQ1OTYwNi8zNzY3NzNcbiAgLy8gZG9jdW1lbnQgaXMgdW5kZWZpbmVkIGluIHJlYWN0LW5hdGl2ZTogaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlYWN0LW5hdGl2ZS9wdWxsLzE2MzJcbiAgcmV0dXJuICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGRvY3VtZW50ICYmICdXZWJraXRBcHBlYXJhbmNlJyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUpIHx8XG4gICAgLy8gaXMgZmlyZWJ1Zz8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzk4MTIwLzM3Njc3M1xuICAgICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cgJiYgd2luZG93LmNvbnNvbGUgJiYgKGNvbnNvbGUuZmlyZWJ1ZyB8fCAoY29uc29sZS5leGNlcHRpb24gJiYgY29uc29sZS50YWJsZSkpKSB8fFxuICAgIC8vIGlzIGZpcmVmb3ggPj0gdjMxP1xuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvVG9vbHMvV2ViX0NvbnNvbGUjU3R5bGluZ19tZXNzYWdlc1xuICAgICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkubWF0Y2goL2ZpcmVmb3hcXC8oXFxkKykvKSAmJiBwYXJzZUludChSZWdFeHAuJDEsIDEwKSA+PSAzMSkgfHxcbiAgICAvLyBkb3VibGUgY2hlY2sgd2Via2l0IGluIHVzZXJBZ2VudCBqdXN0IGluIGNhc2Ugd2UgYXJlIGluIGEgd29ya2VyXG4gICAgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIG5hdmlnYXRvciAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvYXBwbGV3ZWJraXRcXC8oXFxkKykvKSk7XG59XG5cbi8qKlxuICogTWFwICVqIHRvIGBKU09OLnN0cmluZ2lmeSgpYCwgc2luY2Ugbm8gV2ViIEluc3BlY3RvcnMgZG8gdGhhdCBieSBkZWZhdWx0LlxuICovXG5cbmV4cG9ydHMuZm9ybWF0dGVycy5qID0gZnVuY3Rpb24odikge1xuICB0cnkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuICdbVW5leHBlY3RlZEpTT05QYXJzZUVycm9yXTogJyArIGVyci5tZXNzYWdlO1xuICB9XG59O1xuXG5cbi8qKlxuICogQ29sb3JpemUgbG9nIGFyZ3VtZW50cyBpZiBlbmFibGVkLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZm9ybWF0QXJncyhhcmdzKSB7XG4gIHZhciB1c2VDb2xvcnMgPSB0aGlzLnVzZUNvbG9ycztcblxuICBhcmdzWzBdID0gKHVzZUNvbG9ycyA/ICclYycgOiAnJylcbiAgICArIHRoaXMubmFtZXNwYWNlXG4gICAgKyAodXNlQ29sb3JzID8gJyAlYycgOiAnICcpXG4gICAgKyBhcmdzWzBdXG4gICAgKyAodXNlQ29sb3JzID8gJyVjICcgOiAnICcpXG4gICAgKyAnKycgKyBleHBvcnRzLmh1bWFuaXplKHRoaXMuZGlmZik7XG5cbiAgaWYgKCF1c2VDb2xvcnMpIHJldHVybjtcblxuICB2YXIgYyA9ICdjb2xvcjogJyArIHRoaXMuY29sb3I7XG4gIGFyZ3Muc3BsaWNlKDEsIDAsIGMsICdjb2xvcjogaW5oZXJpdCcpXG5cbiAgLy8gdGhlIGZpbmFsIFwiJWNcIiBpcyBzb21ld2hhdCB0cmlja3ksIGJlY2F1c2UgdGhlcmUgY291bGQgYmUgb3RoZXJcbiAgLy8gYXJndW1lbnRzIHBhc3NlZCBlaXRoZXIgYmVmb3JlIG9yIGFmdGVyIHRoZSAlYywgc28gd2UgbmVlZCB0b1xuICAvLyBmaWd1cmUgb3V0IHRoZSBjb3JyZWN0IGluZGV4IHRvIGluc2VydCB0aGUgQ1NTIGludG9cbiAgdmFyIGluZGV4ID0gMDtcbiAgdmFyIGxhc3RDID0gMDtcbiAgYXJnc1swXS5yZXBsYWNlKC8lW2EtekEtWiVdL2csIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgaWYgKCclJScgPT09IG1hdGNoKSByZXR1cm47XG4gICAgaW5kZXgrKztcbiAgICBpZiAoJyVjJyA9PT0gbWF0Y2gpIHtcbiAgICAgIC8vIHdlIG9ubHkgYXJlIGludGVyZXN0ZWQgaW4gdGhlICpsYXN0KiAlY1xuICAgICAgLy8gKHRoZSB1c2VyIG1heSBoYXZlIHByb3ZpZGVkIHRoZWlyIG93bilcbiAgICAgIGxhc3RDID0gaW5kZXg7XG4gICAgfVxuICB9KTtcblxuICBhcmdzLnNwbGljZShsYXN0QywgMCwgYyk7XG59XG5cbi8qKlxuICogSW52b2tlcyBgY29uc29sZS5sb2coKWAgd2hlbiBhdmFpbGFibGUuXG4gKiBOby1vcCB3aGVuIGBjb25zb2xlLmxvZ2AgaXMgbm90IGEgXCJmdW5jdGlvblwiLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gbG9nKCkge1xuICAvLyB0aGlzIGhhY2tlcnkgaXMgcmVxdWlyZWQgZm9yIElFOC85LCB3aGVyZVxuICAvLyB0aGUgYGNvbnNvbGUubG9nYCBmdW5jdGlvbiBkb2Vzbid0IGhhdmUgJ2FwcGx5J1xuICByZXR1cm4gJ29iamVjdCcgPT09IHR5cGVvZiBjb25zb2xlXG4gICAgJiYgY29uc29sZS5sb2dcbiAgICAmJiBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKTtcbn1cblxuLyoqXG4gKiBTYXZlIGBuYW1lc3BhY2VzYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2F2ZShuYW1lc3BhY2VzKSB7XG4gIHRyeSB7XG4gICAgaWYgKG51bGwgPT0gbmFtZXNwYWNlcykge1xuICAgICAgZXhwb3J0cy5zdG9yYWdlLnJlbW92ZUl0ZW0oJ2RlYnVnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4cG9ydHMuc3RvcmFnZS5kZWJ1ZyA9IG5hbWVzcGFjZXM7XG4gICAgfVxuICB9IGNhdGNoKGUpIHt9XG59XG5cbi8qKlxuICogTG9hZCBgbmFtZXNwYWNlc2AuXG4gKlxuICogQHJldHVybiB7U3RyaW5nfSByZXR1cm5zIHRoZSBwcmV2aW91c2x5IHBlcnNpc3RlZCBkZWJ1ZyBtb2Rlc1xuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbG9hZCgpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZXhwb3J0cy5zdG9yYWdlLmRlYnVnO1xuICB9IGNhdGNoKGUpIHt9XG5cbiAgLy8gSWYgZGVidWcgaXNuJ3Qgc2V0IGluIExTLCBhbmQgd2UncmUgaW4gRWxlY3Ryb24sIHRyeSB0byBsb2FkICRERUJVR1xuICBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmICdlbnYnIGluIHByb2Nlc3MpIHtcbiAgICByZXR1cm4gcHJvY2Vzcy5lbnYuREVCVUc7XG4gIH1cbn1cblxuLyoqXG4gKiBFbmFibGUgbmFtZXNwYWNlcyBsaXN0ZWQgaW4gYGxvY2FsU3RvcmFnZS5kZWJ1Z2AgaW5pdGlhbGx5LlxuICovXG5cbmV4cG9ydHMuZW5hYmxlKGxvYWQoKSk7XG5cbi8qKlxuICogTG9jYWxzdG9yYWdlIGF0dGVtcHRzIHRvIHJldHVybiB0aGUgbG9jYWxzdG9yYWdlLlxuICpcbiAqIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2Ugc2FmYXJpIHRocm93c1xuICogd2hlbiBhIHVzZXIgZGlzYWJsZXMgY29va2llcy9sb2NhbHN0b3JhZ2VcbiAqIGFuZCB5b3UgYXR0ZW1wdCB0byBhY2Nlc3MgaXQuXG4gKlxuICogQHJldHVybiB7TG9jYWxTdG9yYWdlfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbG9jYWxzdG9yYWdlKCkge1xuICB0cnkge1xuICAgIHJldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlO1xuICB9IGNhdGNoIChlKSB7fVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxuICAsIHByZWZpeCA9ICd+JztcblxuLyoqXG4gKiBDb25zdHJ1Y3RvciB0byBjcmVhdGUgYSBzdG9yYWdlIGZvciBvdXIgYEVFYCBvYmplY3RzLlxuICogQW4gYEV2ZW50c2AgaW5zdGFuY2UgaXMgYSBwbGFpbiBvYmplY3Qgd2hvc2UgcHJvcGVydGllcyBhcmUgZXZlbnQgbmFtZXMuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gRXZlbnRzKCkge31cblxuLy9cbi8vIFdlIHRyeSB0byBub3QgaW5oZXJpdCBmcm9tIGBPYmplY3QucHJvdG90eXBlYC4gSW4gc29tZSBlbmdpbmVzIGNyZWF0aW5nIGFuXG4vLyBpbnN0YW5jZSBpbiB0aGlzIHdheSBpcyBmYXN0ZXIgdGhhbiBjYWxsaW5nIGBPYmplY3QuY3JlYXRlKG51bGwpYCBkaXJlY3RseS5cbi8vIElmIGBPYmplY3QuY3JlYXRlKG51bGwpYCBpcyBub3Qgc3VwcG9ydGVkIHdlIHByZWZpeCB0aGUgZXZlbnQgbmFtZXMgd2l0aCBhXG4vLyBjaGFyYWN0ZXIgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIGJ1aWx0LWluIG9iamVjdCBwcm9wZXJ0aWVzIGFyZSBub3Rcbi8vIG92ZXJyaWRkZW4gb3IgdXNlZCBhcyBhbiBhdHRhY2sgdmVjdG9yLlxuLy9cbmlmIChPYmplY3QuY3JlYXRlKSB7XG4gIEV2ZW50cy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIC8vXG4gIC8vIFRoaXMgaGFjayBpcyBuZWVkZWQgYmVjYXVzZSB0aGUgYF9fcHJvdG9fX2AgcHJvcGVydHkgaXMgc3RpbGwgaW5oZXJpdGVkIGluXG4gIC8vIHNvbWUgb2xkIGJyb3dzZXJzIGxpa2UgQW5kcm9pZCA0LCBpUGhvbmUgNS4xLCBPcGVyYSAxMSBhbmQgU2FmYXJpIDUuXG4gIC8vXG4gIGlmICghbmV3IEV2ZW50cygpLl9fcHJvdG9fXykgcHJlZml4ID0gZmFsc2U7XG59XG5cbi8qKlxuICogUmVwcmVzZW50YXRpb24gb2YgYSBzaW5nbGUgZXZlbnQgbGlzdGVuZXIuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCB0byBpbnZva2UgdGhlIGxpc3RlbmVyIHdpdGguXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvbmNlPWZhbHNlXSBTcGVjaWZ5IGlmIHRoZSBsaXN0ZW5lciBpcyBhIG9uZS10aW1lIGxpc3RlbmVyLlxuICogQGNvbnN0cnVjdG9yXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gRUUoZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdGhpcy5mbiA9IGZuO1xuICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICB0aGlzLm9uY2UgPSBvbmNlIHx8IGZhbHNlO1xufVxuXG4vKipcbiAqIE1pbmltYWwgYEV2ZW50RW1pdHRlcmAgaW50ZXJmYWNlIHRoYXQgaXMgbW9sZGVkIGFnYWluc3QgdGhlIE5vZGUuanNcbiAqIGBFdmVudEVtaXR0ZXJgIGludGVyZmFjZS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBhcGkgcHVibGljXG4gKi9cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gbmV3IEV2ZW50cygpO1xuICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG59XG5cbi8qKlxuICogUmV0dXJuIGFuIGFycmF5IGxpc3RpbmcgdGhlIGV2ZW50cyBmb3Igd2hpY2ggdGhlIGVtaXR0ZXIgaGFzIHJlZ2lzdGVyZWRcbiAqIGxpc3RlbmVycy5cbiAqXG4gKiBAcmV0dXJucyB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmV2ZW50TmFtZXMgPSBmdW5jdGlvbiBldmVudE5hbWVzKCkge1xuICB2YXIgbmFtZXMgPSBbXVxuICAgICwgZXZlbnRzXG4gICAgLCBuYW1lO1xuXG4gIGlmICh0aGlzLl9ldmVudHNDb3VudCA9PT0gMCkgcmV0dXJuIG5hbWVzO1xuXG4gIGZvciAobmFtZSBpbiAoZXZlbnRzID0gdGhpcy5fZXZlbnRzKSkge1xuICAgIGlmIChoYXMuY2FsbChldmVudHMsIG5hbWUpKSBuYW1lcy5wdXNoKHByZWZpeCA/IG5hbWUuc2xpY2UoMSkgOiBuYW1lKTtcbiAgfVxuXG4gIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG4gICAgcmV0dXJuIG5hbWVzLmNvbmNhdChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKGV2ZW50cykpO1xuICB9XG5cbiAgcmV0dXJuIG5hbWVzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGxpc3RlbmVycyByZWdpc3RlcmVkIGZvciBhIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfFN5bWJvbH0gZXZlbnQgVGhlIGV2ZW50IG5hbWUuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGV4aXN0cyBPbmx5IGNoZWNrIGlmIHRoZXJlIGFyZSBsaXN0ZW5lcnMuXG4gKiBAcmV0dXJucyB7QXJyYXl8Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24gbGlzdGVuZXJzKGV2ZW50LCBleGlzdHMpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnRcbiAgICAsIGF2YWlsYWJsZSA9IHRoaXMuX2V2ZW50c1tldnRdO1xuXG4gIGlmIChleGlzdHMpIHJldHVybiAhIWF2YWlsYWJsZTtcbiAgaWYgKCFhdmFpbGFibGUpIHJldHVybiBbXTtcbiAgaWYgKGF2YWlsYWJsZS5mbikgcmV0dXJuIFthdmFpbGFibGUuZm5dO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXZhaWxhYmxlLmxlbmd0aCwgZWUgPSBuZXcgQXJyYXkobCk7IGkgPCBsOyBpKyspIHtcbiAgICBlZVtpXSA9IGF2YWlsYWJsZVtpXS5mbjtcbiAgfVxuXG4gIHJldHVybiBlZTtcbn07XG5cbi8qKlxuICogQ2FsbHMgZWFjaCBvZiB0aGUgbGlzdGVuZXJzIHJlZ2lzdGVyZWQgZm9yIGEgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8U3ltYm9sfSBldmVudCBUaGUgZXZlbnQgbmFtZS5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGV2ZW50IGhhZCBsaXN0ZW5lcnMsIGVsc2UgYGZhbHNlYC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIGVtaXQoZXZlbnQsIGExLCBhMiwgYTMsIGE0LCBhNSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gZmFsc2U7XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdXG4gICAgLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBhcmdzXG4gICAgLCBpO1xuXG4gIGlmIChsaXN0ZW5lcnMuZm4pIHtcbiAgICBpZiAobGlzdGVuZXJzLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVycy5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCksIHRydWU7XG4gICAgICBjYXNlIDI6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEpLCB0cnVlO1xuICAgICAgY2FzZSAzOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiksIHRydWU7XG4gICAgICBjYXNlIDQ6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMyksIHRydWU7XG4gICAgICBjYXNlIDU6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQpLCB0cnVlO1xuICAgICAgY2FzZSA2OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0LCBhNSksIHRydWU7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGxpc3RlbmVycy5mbi5hcHBseShsaXN0ZW5lcnMuY29udGV4dCwgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGhcbiAgICAgICwgajtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnNbaV0uZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICAgIGNhc2UgMTogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQpOyBicmVhaztcbiAgICAgICAgY2FzZSAyOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEpOyBicmVhaztcbiAgICAgICAgY2FzZSAzOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEsIGEyKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgNDogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMiwgYTMpOyBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBpZiAoIWFyZ3MpIGZvciAoaiA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgICAgICBhcmdzW2ogLSAxXSA9IGFyZ3VtZW50c1tqXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4uYXBwbHkobGlzdGVuZXJzW2ldLmNvbnRleHQsIGFyZ3MpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBBZGQgYSBsaXN0ZW5lciBmb3IgYSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xTeW1ib2x9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gW2NvbnRleHQ9dGhpc10gVGhlIGNvbnRleHQgdG8gaW52b2tlIHRoZSBsaXN0ZW5lciB3aXRoLlxuICogQHJldHVybnMge0V2ZW50RW1pdHRlcn0gYHRoaXNgLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIG9uKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcylcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lciwgdGhpcy5fZXZlbnRzQ291bnQrKztcbiAgZWxzZSBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFt0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGQgYSBvbmUtdGltZSBsaXN0ZW5lciBmb3IgYSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xTeW1ib2x9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gVGhlIGxpc3RlbmVyIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gW2NvbnRleHQ9dGhpc10gVGhlIGNvbnRleHQgdG8gaW52b2tlIHRoZSBsaXN0ZW5lciB3aXRoLlxuICogQHJldHVybnMge0V2ZW50RW1pdHRlcn0gYHRoaXNgLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZShldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMsIHRydWUpXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXIsIHRoaXMuX2V2ZW50c0NvdW50Kys7XG4gIGVsc2UgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBsaXN0ZW5lcnMgb2YgYSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xTeW1ib2x9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gT25seSByZW1vdmUgdGhlIGxpc3RlbmVycyB0aGF0IG1hdGNoIHRoaXMgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IE9ubHkgcmVtb3ZlIHRoZSBsaXN0ZW5lcnMgdGhhdCBoYXZlIHRoaXMgY29udGV4dC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IHJlbW92ZSBvbmUtdGltZSBsaXN0ZW5lcnMuXG4gKiBAcmV0dXJucyB7RXZlbnRFbWl0dGVyfSBgdGhpc2AuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiB0aGlzO1xuICBpZiAoIWZuKSB7XG4gICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApIHRoaXMuX2V2ZW50cyA9IG5ldyBFdmVudHMoKTtcbiAgICBlbHNlIGRlbGV0ZSB0aGlzLl9ldmVudHNbZXZ0XTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XTtcblxuICBpZiAobGlzdGVuZXJzLmZuKSB7XG4gICAgaWYgKFxuICAgICAgICAgbGlzdGVuZXJzLmZuID09PSBmblxuICAgICAgJiYgKCFvbmNlIHx8IGxpc3RlbmVycy5vbmNlKVxuICAgICAgJiYgKCFjb250ZXh0IHx8IGxpc3RlbmVycy5jb250ZXh0ID09PSBjb250ZXh0KVxuICAgICkge1xuICAgICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApIHRoaXMuX2V2ZW50cyA9IG5ldyBFdmVudHMoKTtcbiAgICAgIGVsc2UgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBmb3IgKHZhciBpID0gMCwgZXZlbnRzID0gW10sIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKFxuICAgICAgICAgICBsaXN0ZW5lcnNbaV0uZm4gIT09IGZuXG4gICAgICAgIHx8IChvbmNlICYmICFsaXN0ZW5lcnNbaV0ub25jZSlcbiAgICAgICAgfHwgKGNvbnRleHQgJiYgbGlzdGVuZXJzW2ldLmNvbnRleHQgIT09IGNvbnRleHQpXG4gICAgICApIHtcbiAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL1xuICAgIC8vIFJlc2V0IHRoZSBhcnJheSwgb3IgcmVtb3ZlIGl0IGNvbXBsZXRlbHkgaWYgd2UgaGF2ZSBubyBtb3JlIGxpc3RlbmVycy5cbiAgICAvL1xuICAgIGlmIChldmVudHMubGVuZ3RoKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGV2ZW50cy5sZW5ndGggPT09IDEgPyBldmVudHNbMF0gOiBldmVudHM7XG4gICAgZWxzZSBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMCkgdGhpcy5fZXZlbnRzID0gbmV3IEV2ZW50cygpO1xuICAgIGVsc2UgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBhbGwgbGlzdGVuZXJzLCBvciB0aG9zZSBvZiB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfFN5bWJvbH0gW2V2ZW50XSBUaGUgZXZlbnQgbmFtZS5cbiAqIEByZXR1cm5zIHtFdmVudEVtaXR0ZXJ9IGB0aGlzYC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50KSB7XG4gIHZhciBldnQ7XG5cbiAgaWYgKGV2ZW50KSB7XG4gICAgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcbiAgICBpZiAodGhpcy5fZXZlbnRzW2V2dF0pIHtcbiAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKSB0aGlzLl9ldmVudHMgPSBuZXcgRXZlbnRzKCk7XG4gICAgICBlbHNlIGRlbGV0ZSB0aGlzLl9ldmVudHNbZXZ0XTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZXZlbnRzID0gbmV3IEV2ZW50cygpO1xuICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEFsaWFzIG1ldGhvZHMgbmFtZXMgYmVjYXVzZSBwZW9wbGUgcm9sbCBsaWtlIHRoYXQuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUub247XG5cbi8vXG4vLyBUaGlzIGZ1bmN0aW9uIGRvZXNuJ3QgYXBwbHkgYW55bW9yZS5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBwcmVmaXguXG4vL1xuRXZlbnRFbWl0dGVyLnByZWZpeGVkID0gcHJlZml4O1xuXG4vL1xuLy8gQWxsb3cgYEV2ZW50RW1pdHRlcmAgdG8gYmUgaW1wb3J0ZWQgYXMgbW9kdWxlIG5hbWVzcGFjZS5cbi8vXG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXG4vL1xuaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgbW9kdWxlKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xufVxuIiwiLyoqXG4gKiBUaGUgZGlzcGF0Y2hlciBmb3Igd2Vib3MuXG4gKiBAbW9kdWxlIGNvcmUvZGlzcGF0Y2hlclxuICovXG5pbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuXG5jb25zdCBsb2cgPSBkZWJ1ZygnZGlzcGF0Y2hlcjpsb2cnKTtcbi8vIERpc2FibGUgbG9nZ2luZyBpbiBwcm9kdWN0aW9uXG5pZiAoRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgZGVidWcuZW5hYmxlKCcqJyk7XG59IGVsc2Uge1xuICBkZWJ1Zy5kaXNhYmxlKCk7XG59XG5cbmltcG9ydCBFRSBmcm9tICdldmVudGVtaXR0ZXIzJztcblxuLyoqIENsYXNzIHJlcHJlc2VudGluZyBhIG1haW4gZGlzcGF0Y2hlciBmb3Igd2Vib3MuXG4gKiAgQGV4dGVuZHMgRXZlbnRFbW1pdGVyM1xuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpc3BhdGNoZXIgZXh0ZW5kcyBFRSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgbG9nKCdEaXNwYXRjaGVyIENyZWF0ZScpO1xuICB9XG59IiwiLyoqXG4gKiBEZWZhdWx0IGhhbmRsZXIgZm9yIFByb3h5aW5nLlxuICogQG1vZHVsZSBsaWJzL2FwcC5wcm94eS5oYW5kbGVyXG4gKiBAc2VlIG1vZHVsZTpsaWJzL3Byb3h5aW5nXG4gKi9cblxuLyoqIENsYXNzIHJlcHJlc2VudGluZyBhIGRlZmF1bHQgaGFuZGxlciBmb3IgYXBwbGljYXRpb25zIFByb3h5aW5nLiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBwUHJveHlIYW5kbGVyIHtcbiAgLyoqXG4gICAqIEdldHRlci5cbiAgICogQHJldHVybiB7IGFueSB9IHRhcmdldFtwcm9wXSAtIFJldHVybiB0cnVlIHdoZW4gdHJ5IHRvIGdldCAndXVpZC5cbiAgICovXG4gIGdldCh0YXJnZXQsIHByb3ApIHtcbiAgICBpZiAocHJvcCA9PSAnX191dWlkJykge1xuICAgICAgcmV0dXJuIHRhcmdldC51dWlkO1xuICAgIH1cbiAgICBpZiAocHJvcCA9PSAndXVpZCcpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0W3Byb3BdO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHRlci5cbiAgICogQHJldHVybiB7IGFueSB9IHZhbHVlXG4gICAqL1xuXG4gIHNldCh0YXJnZXQsIHByb3AsIHZhbHVlKSB7XG4gICAgaWYgKHByb3AgPT0gJ3V1aWQnIHx8IHByb3AgPT0gJ25hbWUnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBjYW5cXCd0IGNoYW5nZSBcXCd1dWlkXFwnIG9yIFxcJ25hbWVcXCcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBkZWxldGVQcm9wZXJ0eSh0YXJnZXQsIHByb3ApIHtcbiAgICBpZiAocHJvcCA9PSAndXVpZCcgfHwgcHJvcCA9PSAnbmFtZScpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91IGNhblxcJ3QgZGVsZXRlIFxcJ3V1aWRcXCcgb3IgXFwnbmFtZVxcJycpO1xuICAgIH1cbiAgfVxufSIsIi8qKlxuICogTW9kdWxlIGZvciBQcm94eWluZy5cbiAqIEBtb2R1bGUgbGlicy9wcm94eWluZ1xuICovXG5cbmltcG9ydCBBcHBQcm94eUhhbmRsZXIgZnJvbSAnLi9hcHAucHJveHkuaGFuZGxlci5qcyc7XG5cbi8qKlxuICogV3JhcCBvbiBwcm94eSBvYmplY3QuXG4gKiBAcGFyYW0geyBvYmplY3QgfSBhcHAgLSBUaGUgYXBwbGljYXRpb24gd2hpY2ggbXVzdCB3cmFwIG9uIHByb3h5IG9iamVjdC5cbiAqIEBwYXJhbSB7IE9iamVjdCB9IG9wdGlvbnMgLSBUaGUgb3B0aW9ucyB3aGljaCBjYW4gY29udGFpbiBwcm94eSBoYW5kbGVyLlxuICogQHJldHVybiB7IFByb3h5IG9iamVjdCB9IC0gUHJveHkgb2JqZWN0IHdpdGggY3VycmVudCBhcHBsaWNhdGlvbiBhbmQgaGFuZGxlciBmcm9tXG4gKiBvcHRpb25zIG9yIGRlZmF1bHQgKEBzZWUgbW9kdWxlOmxpYnMvYXBwLnByb3h5LmhhbmRsZXIpXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcHJveHlpbmcoYXBwLCBvcHRpb25zKSB7XG4gIGxldCBoYW5kbGVyO1xuICBpZiAoIW9wdGlvbnMgfHwgKG9wdGlvbnMgJiYgIW9wdGlvbnMuaGFuZGxlcikpIHtcbiAgICAvLyBkZWZhdWx0IGhhbmRsZXJcbiAgICBoYW5kbGVyID0gbmV3IEFwcFByb3h5SGFuZGxlcjtcbiAgfSBlbHNlIGlmIChvcHRpb25zLmhhbmRsZXIpIHtcbiAgICBoYW5kbGVyID0gT2JqZWN0LmFzc2lnbihuZXcgQXBwUHJveHlIYW5kbGVyLCBvcHRpb25zLmhhbmRsZXIpO1xuICB9XG4gIHJldHVybiBuZXcgUHJveHkoYXBwLCBoYW5kbGVyKTtcbn1cbiIsIi8qKlxuICogQXBwbGljYXRpb25zIFF1ZXVlLlxuICogQG1vZHVsZSBjb3JlL2FwcFF1ZXVlXG4gKiBAc2VlIG1vZHVsZTpjb3JlL2luaXRcbiAqL1xuXG5pbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuXG5jb25zdCBsb2cgPSBkZWJ1ZygnYXBwUXVldWU6bG9nJyk7XG4vLyBEaXNhYmxlIGxvZ2dpbmcgaW4gcHJvZHVjdGlvblxuaWYgKEVOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGRlYnVnLmVuYWJsZSgnKicpO1xufSBlbHNlIHtcbiAgZGVidWcuZGlzYWJsZSgpO1xufVxuXG5pbXBvcnQgcHJveHlpbmcgZnJvbSAnLi4vbGlicy9wcm94eWluZy5qcyc7XG5cbi8qKiBDbGFzcyBBcHBRdWV1ZSByZXByZXNlbnRpbmcgYSB3ZWJvcyBhcHBsaWNhdGlvbnMgcXVldWUuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwcHMge1xuICAvKipcbiAgICogQ3JlYXRlIGEgZGlzcGF0Y2hlciwgbmFtZSwgYWxsQXBwcywgYWN0aXZlQXBwcyBhbmQgY2FsbCBfaW5zdGFsbExpc3RlbmVycy5cbiAgICogQHBhcmFtIHsgRGlzcGF0Y2hlciB9IGRpc3BhdGNoZXIgLSBUaGUgbWFpbiBkaXNwYXRjaGVyLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZGlzcGF0Y2hlcikge1xuICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgdGhpcy5uYW1lID0gJ3dlYm9zLWFwcC1xdWV1ZSc7XG4gICAgdGhpcy5hbGxBcHBzID0gW107XG4gICAgdGhpcy5hY3RpdmVBcHBzID0gW107XG4gICAgdGhpcy5faW5zdGFsbExpc3RlbmVycygpO1xuICB9XG4gIC8qKlxuICAgKiBTZXQgdGhlIGxpc3RlbmVycy5cbiAgICovXG4gIF9pbnN0YWxsTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZGlzcGF0Y2hlci5vbignY3JlYXRlOm5ldzphcHAnLCB0aGlzLmNyZWF0ZU5ld0FwcCwgdGhpcyk7XG4gICAgdGhpcy5kaXNwYXRjaGVyLm9uKCdhcHA6dG91Y2gnLCB0aGlzLnRvdWNoQXBwLCB0aGlzKTtcbiAgICB0aGlzLmRpc3BhdGNoZXIub24oJ3JlbW92ZTphcHAnLCB0aGlzLnJlbW92ZUFwcCwgdGhpcyk7XG4gICAgdGhpcy5kaXNwYXRjaGVyLm9uKCdyZWFkeTpjb21wb25lbnQ6YXBwTGlzdCcsIHRoaXMucmVhZHlBcHBMaXN0LCB0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGRlZmF1bHQgYXBwbGljYXRpb25zLlxuICAgKi9cbiAgaW5pdERlZmF1bHRBcHBzKCkge1xuICAgIGxldCBjYWxjdWxhdG9yID0ge1xuICAgICAgbmFtZTogJ0NhbGN1bGF0b3InXG4gICAgfTtcblxuICAgIHRoaXMuY3JlYXRlTmV3QXBwKHtcbiAgICAgIGFwcDogY2FsY3VsYXRvclxuICAgIH0pO1xuXG4gICAgdGhpcy5kaXNwYXRjaGVyLmVtaXQoJ2NyZWF0ZTphcHAnLCB7XG4gICAgICBhcHA6IHRoaXMuZ2V0QXBwQnlOYW1lKGNhbGN1bGF0b3IubmFtZSlcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIHJlYWR5IGFwcGxpY2F0aW9uIGxpc3QgY29tcG9uZW50IFxuICAgKiBzZXQgdGhlIGRlZmF1bHQgYXBwbGljYXRpb25zLlxuICAgKi9cbiAgcmVhZHlBcHBMaXN0KCkge1xuICAgIHRoaXMuaW5pdERlZmF1bHRBcHBzKCk7XG4gIH1cblxuICAvKiogXG4gICAqIENoZWNrIG9wdGlvbnMgYW5kIGNhbGwgc3RhdGljIHB1c2hBcHBcbiAgICogbWV0aG9kIHdpdGggb3B0aW9uc1xuICAgKiBAcGFyYW0geyBvYmplY3QgfSBvcHRpb25zXG4gICAqL1xuXG4gIGNyZWF0ZU5ld0FwcChvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zLmFwcCkge1xuICAgICAgLy8gVE9ETyA6OjogQ3JlYXRlIEVycm9yIEhhbmRsZXJcbiAgICAgIC8vIHNlZSA9PiBsaW5rIDo6OiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9ydS9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9FcnJvclxuICAgICAgLy8gc2VlID0+IGxpbmsgOjo6IGh0dHBzOi8vbGVhcm4uamF2YXNjcmlwdC5ydS9vb3AtZXJyb3JzIFxuICAgICAgLy8gc2VlID0+IGxpbmsgOjo6IGh0dHA6Ly9leHByZXNzanMuY29tL3J1L2d1aWRlL2Vycm9yLWhhbmRsaW5nLmh0bWxcbiAgICAgIHRocm93IG5ldyBFcnJvcihgV2l0aCBjcmVhdGU6bmV3OmFwcCBldmVudCBzZW5kIGFwcCBvcHRpb25zXG4gICAgICAgIGV4LiBcXCdkaXNwYXRjaGVyLmVtaXQoJ2NyZWF0ZTpuZXc6YXBwJywge2FwcDogLi4ufSlcXCdgKTtcbiAgICB9XG4gICAgdGhpcy5wdXNoQXBwKHByb3h5aW5nKG9wdGlvbnMuYXBwKSk7XG4gICAgbG9nKCdjcmVhdGUgbmV3IGFwcCcpO1xuICAgIC8vIGZ1bmN0aW9uICdwcm94eWluZycgY2FuIGdldCBzZWNvbmQgYXJndW1lbnQgd2hpY2ggeW91ciBjdXN0b21cbiAgICAvLyBQcm94eSBoYW5kbGVyXG4gICAgLy8gVE9ETyA6OjogQ3JlYXRlIHJlc3RyaWN0aW5nIGxvZ2ljIGZvciBtYXJnZSBjdXN0b20gYW5kXG4gICAgLy8gZGVmYXVsdCBQcm94eSBoYW5kbGVyXG4gICAgLy8gPT4gc2VlIDo6OiAvbGlicy9wcm94eWluZy5qc1xuICB9XG5cbiAgLyoqIFxuICAgKiBSZW1vdmUgYXBwbGljYXRpb24gZnJvbSAndGhpcy5hbGxBcHBzJ1xuICAgKiBAcGFyYW0geyBvYmplY3QgfSBvcHRpb25zXG4gICAqL1xuXG4gIHJlbW92ZUFwcChvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zIHx8IChvcHRpb25zICYmICFvcHRpb25zLmFwcCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgV2l0aCBjcmVhdGU6bmV3OmFwcCBldmVudCBzZW5kIGFwcCBvcHRpb25zXG4gICAgICAgIGV4LiBcXCdkaXNwYXRjaGVyLmVtaXQoJ2NyZWF0ZTpuZXc6YXBwJywge2FwcDogLi4ufSlcXCdgKTsgICAgICBcbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMuYXBwKSB7XG4gICAgICB0aGlzLmFsbEFwcHMuc3BsaWNlKHRoaXMuYWxsQXBwcy5pbmRleE9mKHRoaXMuZ2V0QXBwQnlVdWlkKG9wdGlvbnMuYXBwLnV1aWQpKSwgMSk7XG4gICAgICBsb2coJ3JlbW92ZSBhcHAnKTtcbiAgICB9XG4gIH1cblxuICAvKiogXG4gICAqIEdldCBhcHBsaWNhdGlvbiBieSBVVUlEIGZyb20gJ3RoaXMuYWxsQXBwcydcbiAgICogQHBhcmFtIHsgc3RyaW5nIH0gdXVpZFxuICAgKiBAcmV0dXJuIHsgb2JqZWN0IH0gYXBwbGljYXRpb25cbiAgICovXG5cbiAgZ2V0QXBwQnlVdWlkKHV1aWQpIHtcbiAgICByZXR1cm4gdGhpcy5hbGxBcHBzLmZpbmQoYXBwID0+IGFwcC5fX3V1aWQgPT0gdXVpZCk7XG4gIH1cblxuICAvKiogXG4gICAqIEdldCBhcHBsaWNhdGlvbiBieSBOQU1FIGZyb20gJ3RoaXMuYWxsQXBwcycgYnkgZGVmYXVsdFxuICAgKiBhbmQgZnJvbSAnYXJyJyB3aGVuICdhcnInIGlzIGV4aXN0c1xuICAgKiBAcGFyYW0geyBzdHJpbmcgfSBuYW1lXG4gICAqIEBwYXJhbSB7IGFycmF5IH0gYXJyXG4gICAqIEByZXR1cm4geyBvYmplY3QgfSBhcHBsaWNhdGlvblxuICAgKi9cblxuICBnZXRBcHBCeU5hbWUobmFtZSwgYXJyKSB7XG4gICAgbGV0IHF1ZXVlO1xuICAgIGlmIChhcnIpIHtcbiAgICAgIHF1ZXVlID0gYXJyO1xuICAgIH0gZWxzZSB7XG4gICAgICBxdWV1ZSA9IHRoaXMuYWxsQXBwcztcbiAgICB9XG4gICAgcmV0dXJuIHF1ZXVlLmZpbmQoYXBwID0+IGFwcC5uYW1lID09IG5hbWUpO1xuICB9XG5cbiAgLyoqIFxuICAgKiBBZGQgYXBsaWNhdGlvbiBwcm94eSBpbiAndGhpcy5hbGxBcHBzJ1xuICAgKiBAcGFyYW0geyBwcm94eSBvYmplY3QgfSBwcm94eVxuICAgKi9cblxuICBwdXNoQXBwKHByb3h5KSB7XG4gICAgbGV0IGlzTm90VW5pcXVlID0gdGhpcy5nZXRBcHBCeVV1aWQocHJveHkuX191dWlkKTtcbiAgICBpZiAoaXNOb3RVbmlxdWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRHVibGljYXRlIGFwcGxpY2F0aW9uIHV1aWQnKTtcbiAgICB9XG4gICAgaXNOb3RVbmlxdWUgPSB0aGlzLmdldEFwcEJ5TmFtZShwcm94eS5uYW1lKTtcbiAgICBpZiAoaXNOb3RVbmlxdWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRHVibGljYXRlIGFwcGxpY2F0aW9uIG5hbWUnKTtcbiAgICB9XG4gICAgdGhpcy5hbGxBcHBzLnB1c2gocHJveHkpO1xuICB9XG5cbiAgLyoqIFxuICAgKiBDYWxsZWQgd2hlbiB1c2VyIHRvdWNoIGFwcGxpY2F0aW9uIGljb25cbiAgICogSW4gYXBwbGljYXRpb24gbGlzdFxuICAgKiBAcGFyYW0geyBvYmplY3QgfSBvcHRpb25zXG4gICAqLyAgXG5cbiAgdG91Y2hBcHAob3B0aW9ucykge1xuICAgIGxldCBjdXJyZW50QXBwID0gdGhpcy5nZXRBcHBCeU5hbWUob3B0aW9ucy5uYW1lKTtcbiAgICBpZiAoY3VycmVudEFwcCkge1xuICAgICAgaWYgKCF0aGlzLmdldEFwcEJ5TmFtZShjdXJyZW50QXBwLm5hbWUsIHRoaXMuYWN0aXZlQXBwcykpIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLmVtaXQoJ29wZW46YXBwJywgY3VycmVudEFwcCk7XG4gICAgICAgIHRoaXMuYWN0aXZlQXBwcy5wdXNoKGN1cnJlbnRBcHApO1xuICAgICAgfVxuICAgICAgLy8gY3JlYXRlIGxvZ2ljIGZvciBvcGVuIGFwcFxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gYXBwbGljYXRpb24nKTtcbiAgICB9XG4gIH1cbn0iLCIvKipcbiAqIE1vZHVsZSBmb3IgbWFrZSB3b3JrZXIgc291cmNlLlxuICogQG1vZHVsZSBsaWJzL3dvcmtlclNvdXJjZS5tYWtlclxuICogQHNlZSBtb2R1bGU6Y29yZS9wcm9jZXNzXG4gKi9cblxuLyoqIENsYXNzIHJlcHJlc2VudGluZyBhIHdvcmtlciBzb3VyY2UgbWFrZXIuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1ha2VXb3JrZXJTb3VyY2Uge1xuICAvKipcbiAgICogQ2hlY2sgb3B0aW9ucyBhbmQgY2FsbCAnd29ya2VyU291cmNlJyBtZXRob2QuXG4gICAqIEBwYXJhbSB7IG9iamVjdCB9IG9wdGlvbnMgLSBPcHRpb25zIGZvciB3b3JrZXIgYm9keS4gQ2FuIGNvbnRhaW4gd29ya2VyIGRlcGVuZGVuY3kgYW5kIGZuLlxuICAgKi9cblxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICBpZiAob3B0aW9ucy5kZXBzKSB7XG4gICAgICB0aGlzLmRlcHMgPSBvcHRpb25zLmRlcHMuam9pbignLCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRlcHMgPSAnJztcbiAgICB9XG5cbiAgICB0aGlzLmRlcHMgPSBcIlxcJ1wiICsgdGhpcy5kZXBzICsgXCJcXCdcIjtcbiAgICB0aGlzLndvcmtlclNvdXJjZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ha2Ugd29ya2VyIHNvdXJjZS5cbiAgICogQHJldHVybiB7IEZ1bmN0aW9uIH1cbiAgICovXG5cbiAgd29ya2VyU291cmNlKCkge1xuICAgIC8vIFRPRE8gOjo6IE9wdGltaXplIHRoaXMgY2FzZVxuICAgIHJldHVybiBGdW5jdGlvbihcbiAgICAgIGBcbiAgICAgIGltcG9ydFNjcmlwdHMoJHt0aGlzLmRlcHN9KTtcbiAgICAgIGxldCBmbiA9ICR7dGhpcy5vcHRpb25zLmZufTtcbiAgICAgIGZuKCk7XG4gICAgICBgXG4gICAgKTtcbiAgfVxufSIsIi8qKlxuICogVGhlIHByb2Nlc3MgZm9yIHdlYm9zLlxuICogQG1vZHVsZSBjb3JlL3Byb2Nlc3NcbiAqL1xuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcblxuaW1wb3J0IE1ha2VXb3JrZXJTb3VyY2UgZnJvbSAnLi4vbGlicy93b3JrZXJTb3VyY2UubWFrZXIuanMnO1xuXG5jb25zdCBsb2cgPSBkZWJ1ZygncHJvY2Vzczpsb2cnKTtcbi8vIERpc2FibGUgbG9nZ2luZyBpbiBwcm9kdWN0aW9uXG5pZiAoRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgZGVidWcuZW5hYmxlKCcqJyk7XG59IGVsc2Uge1xuICBkZWJ1Zy5kaXNhYmxlKCk7XG59XG5cbi8qKiBDbGFzcyByZXByZXNlbnRpbmcgYSBwcm9jZXNzIGZvciB3ZWJvcy4gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvY2VzcyB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBkaXNwYXRjaGVyLCBwcm9jZXNzZXMgYW5kIF9pbnN0YWxsTGlzdGVuZXJzLlxuICAgKiBAcGFyYW0geyBEaXNwYXRjaGVyIH0gZGlzcGF0Y2hlciAtIFRoZSBtYWluIGRpc3BhdGNoZXIuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihkaXNwYXRjaGVyKSB7XG4gICAgdGhpcy5kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcbiAgICB0aGlzLnByb2Nlc3NlcyA9IFtdO1xuICAgIGxvZygncnVuIFByb2Nlc3MgY2xhc3MnKTtcbiAgICB0aGlzLl9pbnN0YWxsTGlzdGVuZXJzKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBsaXN0ZW5lcnMuXG4gICAqL1xuXG4gIF9pbnN0YWxsTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZGlzcGF0Y2hlci5vbignY3JlYXRlOm5ldzpwcm9jZXNzJywgdGhpcy5uZXdQcm9jZXNzLCB0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXRob2QgZm9yIGNyZWF0ZSBuZXcgcHJvY2VzcyBpbiB3ZWJvcy5cbiAgICogQHBhcmFtIHsgb2JqZWN0IH0gcHJvY2Vzc0JvZHkgLSBQcm9jZXNzIGJvZHkgY2FuIGNvbnRhaW4gcHJvY2VzcyBkZXBlbmRlbmNpZXMgYW5kIGZuXG4gICAqIEBwYXJhbSB7IG9iamVjdCB9IG9wdGlvbnMgLSBvcHRpb25zIGNhbiBjb250YWluIG9ubWVzc2FnZSBhbmQgb25lcnJvciBjYWxsYmFja3MgYW5kIHRlcm1pbmF0ZSBmbGFnXG4gICAqIEByZXR1cm4geyB3b3JrZXIgb2JqZWN0IH0gd29ya2VyIC0gcmV0dXJuICdydW5Xb3JrZXInIG1ldGhvZCB3aXRoICdwcm9jZXNzQm9keSwgb3B0aW9ucywgdHJ1ZSdcbiAgICogVGhlIDN0aCBwYXJhbSBpbiAncnVuV29ya2VyJyBtZXRob2QgaXMgcHJvbWlzaWZ5IGZsYWcuIERpZmZlcmVudCBiZXR3ZWVuICdjcmVhdGUnIGFuZCAnbmV3UHJvY2VzcydcbiAgICogaXMgdGhlaXJzIHJldHVybmVkIHZhbHVlLiBOT1RF1okgJ25ld1Byb2Nlc3MnIG1ldGhvZCBub3RoaW5nIHJldHVybmVkLiBcbiAgICovXG5cbiAgY3JlYXRlKHByb2Nlc3NCb2R5LCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMucnVuV29ya2VyKHByb2Nlc3NCb2R5LCBvcHRpb25zLCB0cnVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXRob2QgZm9yIGNyZWF0ZSBuZXcgcHJvY2VzcyBpbiB3ZWJvcy5cbiAgICogQHBhcmFtIHsgb2JqZWN0IH0gcHJvY2Vzc0JvZHkgLSBQcm9jZXNzIGJvZHkgY2FuIGNvbnRhaW4gcHJvY2VzcyBkZXBlbmRlbmNpZXMgYW5kIGZuXG4gICAqIEBwYXJhbSB7IG9iamVjdCB9IG9wdGlvbnMgLSBvcHRpb25zIGNhbiBjb250YWluIG9ubWVzc2FnZSBhbmQgb25lcnJvciBjYWxsYmFja3MgYW5kIHRlcm1pbmF0ZSBmbGFnXG4gICAqL1xuXG4gIG5ld1Byb2Nlc3MocHJvY2Vzc0JvZHksIG9wdGlvbnMpIHtcbiAgICB0aGlzLnJ1bldvcmtlcihwcm9jZXNzQm9keSwgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogTWV0aG9kIGZvciBjcmVhdGUgbmV3IHByb2Nlc3MgaW4gd2Vib3MuXG4gICAqIEBwYXJhbSB7IG9iamVjdCB9IHByb2Nlc3NCb2R5IC0gUHJvY2VzcyBib2R5IGNhbiBjb250YWluIHByb2Nlc3MgZGVwZW5kZW5jaWVzIGFuZCBmblxuICAgKiBAcGFyYW0geyBvYmplY3QgfSBvcHRpb25zIC0gb3B0aW9ucyBjYW4gY29udGFpbiBvbm1lc3NhZ2UgYW5kIG9uZXJyb3IgY2FsbGJhY2tzIGFuZCB0ZXJtaW5hdGUgZmxhZ1xuICAgKi9cblxuICBydW5Xb3JrZXIocHJvY2Vzc0JvZHksIG9wdGlvbnMsIHByb21pc2lmeSkge1xuICAgIGxldCB3b3JrZXI7XG4gICAgaWYgKCFwcm9jZXNzQm9keSB8fCAocHJvY2Vzc0JvZHkgJiYgIXByb2Nlc3NCb2R5LmZuKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYFxuICAgICAgICBXaXRoICdjcmVhdGU6bmV3OnByb2Nlc3MnIGV2ZW50IHlvdSBzaG91bGQgc2VuZCBwcm9jZXNzQm9keVxuICAgICAgICBleC5cbiAgICAgICAgLi4uZGlzcGF0Y2hlci5lbWl0KFxuICAgICAgICAgICAgJ2NyZWF0ZTpuZXc6cHJvY2VzcycsIC8vIG9yIHdlYk9zLnByb2Nlc3MuY3JlYXRlKC4uLik7XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGRlcHM6IEFycmF5IDo6OiAob3B0aW9uYWwpIDo6OiBJbiB0aGlzIGNhc2UgeW91IHNob3VsZCB3cml0ZSBhbGwgZGVwZW5kZW5jeSBwYXRocyxcbiAgICAgICAgICAgICAgZm46IEZ1bmN0aW9uIDo6OiAocmVxdWlyZXMpIDo6OiBJdCBpcyB0aGlzIGZ1bmN0aW9uIHdpdGNoIHdpbGwgcnVuIGluIG5ldyBwcm9jZXNzICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgb25tZXNzYWdlOiBGdW5jdGlvbiA6OjogKG9wdGlvbmFsKSA6OjogSXQgaXMgd29ya2VyIG9ubWVzc2FnZSBjYWxsYmFjayxcbiAgICAgICAgICAgICAgb25lcnJvcjogRnVuY3Rpb24gOjo6IChvcHRpb25hbCkgOjo6IGl0IGlzIHdvcmtlciBvbmVycm9yIGNhbGxiYWNrLFxuICAgICAgICAgICAgICB0ZXJtaW5hdGU6IEJvb2xlYW4gOjo6IChvcHRpb25hbCkgOjo6IGRlZmF1bHQgPT4gZmFsc2UgOjo6IElmIHRoaXMgZmxhZyBpcyB0cnVlIGFuZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlvdSBoYXZlIG9ubWVzc2FnZSB0aGVuIGFmdGVyIHByb2Nlc3Mgam9iIGl0IHdpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZSB0ZXJtaW5hdGVkLCBidXQgd2hlbiB5b3UgaGF2bid0IG9ubWVzc2FnZSBhbmQgd2FudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlcm1pbmF0ZSBwcm9jZXNzIHlvdSBjYW4ga2lsbCBpdCB5b3Vyc2VsZiBpbiBmblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrIDopXG4gICAgICAgICAgICB9XG4gICAgICAgICAgKVxuICAgICAgYCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcHJvY2Vzc0JvZHkuZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJ2ZuJyBpbiBuZXcgcHJvY2VzcyBzaG91bGQgYmUgRnVuY3Rpb25gKTtcbiAgICB9IGVsc2UgaWYgKHByb2Nlc3NCb2R5LmRlcHMgJiYgIUFycmF5LmlzQXJyYXkocHJvY2Vzc0JvZHkuZGVwcykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJ2RlcHMnIGluIG5ldyBwcm9jZXNzIHNob3VsZCBiZSBBcnJheWApO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgd29ya2VyU291cmNlID0gbmV3IE1ha2VXb3JrZXJTb3VyY2UocHJvY2Vzc0JvZHkpLndvcmtlclNvdXJjZSgpO1xuXG4gICAgICBsZXQgY29kZSA9IHdvcmtlclNvdXJjZS50b1N0cmluZygpO1xuXG4gICAgICBjb2RlID0gY29kZS5zdWJzdHJpbmcoY29kZS5pbmRleE9mKCd7JykgKyAxLCBjb2RlLmxhc3RJbmRleE9mKCd9JykpO1xuXG4gICAgICBsZXQgYmxvYiA9IG5ldyBCbG9iKFtjb2RlXSwge3R5cGU6ICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0J30pO1xuICAgICAgd29ya2VyID0gbmV3IFdvcmtlcihVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpKTtcbiAgICAgIC8vIGNyZWF0ZSBpbiBwcm9jZXNzZXNcbiAgICAgIHRoaXMucHJvY2Vzc2VzLnB1c2god29ya2VyKTtcblxuICAgICAgaWYgKG9wdGlvbnMub25tZXNzYWdlKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5vbm1lc3NhZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBpZiAob3B0aW9ucy50ZXJtaW5hdGUpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy50ZXJtaW5hdGUgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgICB3b3JrZXIub25tZXNzYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5vbm1lc3NhZ2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB3b3JrZXIudGVybWluYXRlKCk7XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCd0ZXJtaW5hdGUnIGluIG5ldyBwcm9jZXNzIHNob3VsZCBiZSBCb29sZWFuYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdvcmtlci5vbm1lc3NhZ2UgPSBvcHRpb25zLm9ubWVzc2FnZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnb25tZXNzYWdlJyBpbiBuZXcgcHJvY2VzcyBzaG91bGQgYmUgRnVuY3Rpb25gKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5vbmVycm9yKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5vbmVycm9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgd29ya2VyLm9uZXJyb3IgPSBvcHRpb25zLm9uZXJyb3I7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnb25lcnJvcicgaW4gbmV3IHByb2Nlc3Mgc2hvdWxkIGJlIEZ1bmN0aW9uYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocHJvbWlzaWZ5ICYmIHdvcmtlcikge1xuICAgICAgcmV0dXJuIHdvcmtlcjtcbiAgICB9XG4gIH1cbn0iLCIvKipcbiAqIE1haW4gY29yZSBtb2R1bGUuXG4gKiBAbW9kdWxlIGNvcmUvaW5pdFxuICovXG5pbXBvcnQgRGlzcGF0Y2hlciBmcm9tICcuL2Rpc3BhdGNoZXIuanMnO1xuXG5pbXBvcnQgQXBwcyBmcm9tICcuL2FwcHMuanMnO1xuXG5pbXBvcnQgUHJvY2VzcyBmcm9tICcuL3Byb2Nlc3MnO1xuXG5sZXQgd2ViT3MgPSB7fTtcblxud2ViT3MuZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyO1xuXG53ZWJPcy5hcHBzID0gbmV3IEFwcHMod2ViT3MuZGlzcGF0Y2hlcik7XG5cbndlYk9zLnByb2Nlc3MgPSBuZXcgUHJvY2Vzcyh3ZWJPcy5kaXNwYXRjaGVyKTtcblxuZXhwb3J0IGRlZmF1bHQgd2ViT3M7IiwiLy8gQWRkIGEgZGVidWdnZXJcbmltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5cbmNvbnN0IGxvZyA9IGRlYnVnKCdhcHA6bG9nJyk7XG4vLyBEaXNhYmxlIGxvZ2dpbmcgaW4gcHJvZHVjdGlvblxuaWYgKEVOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGRlYnVnLmVuYWJsZSgnKicpO1xuXG4gIC8vIEZvciBsaXZlIHJlbG9hZFxuICBkb2N1bWVudC53cml0ZSgnPHNjcmlwdCBzcmM9XCJodHRwOi8vJyArIChsb2NhdGlvbi5ob3N0IHx8ICdsb2NhbGhvc3QnKS5zcGxpdCgnOicpWzBdICtcbiAgJzozNTcyOS9saXZlcmVsb2FkLmpzP3NuaXB2ZXI9MVwiPjwvJyArICdzY3JpcHQ+Jyk7XG59IGVsc2Uge1xuICBkZWJ1Zy5kaXNhYmxlKCk7XG59XG5cbmxvZygnOjo6IEFwcCBTdGFydCA6OjonKTtcblxuaW1wb3J0IHdlYk9zIGZyb20gJy4vY29yZS9pbml0Jztcblxud2luZG93LndlYk9zID0gd2ViT3M7XG5cbi8vIEltcG9ydCBzdHlsZXNcbmltcG9ydCAnLi4vY3NzL21haW4uY3NzJztcblxuLy8gdGVzdCBmb3IgY3JlYXRlIGFwcGxpY2F0aW9uXG53ZWJPcy5kaXNwYXRjaGVyLmVtaXQoJ2NyZWF0ZTpuZXc6YXBwJywge1xuICBhcHA6IHtcbiAgICBuYW1lOiAnd2Vib3MtdGVybWluYWwnLFxuICAgIHV1aWQ6ICcyMmUxZCdcbiAgfVxufSk7XG5cbi8vIHRlc3QgZm9yIGNyZWF0ZSBhcHBsaWNhdGlvblxud2ViT3MuZGlzcGF0Y2hlci5lbWl0KCdjcmVhdGU6bmV3OmFwcCcsIHtcbiAgYXBwOiB7XG4gICAgbmFtZTogJ3dlYm9zLXRlcm1pbmFsLWZhY2UnLFxuICAgIHV1aWQ6ICczMXF3YScsXG4gICAgLy8gdGVzdFxuICAgIHByb2Nlc3M6IHtcbiAgICAgIG5ldzogdHJ1ZSxcbiAgICAgIC8vIC4uLi5cbiAgICB9XG4gIH1cbn0pO1xuXG4vLyB0ZXN0IGZvciByZW1vdmUgYXBwbGljYXRpb25cbndlYk9zLmFwcHMucmVtb3ZlQXBwKHtcbiAgYXBwOiB7XG4gICAgdXVpZDogJzIyZTFkJ1xuICB9XG59KTtcblxuLy8gdGVzdCBmb3IgY3JlYXRlIG5ldyBwcm9jZXNzIHdpdGggZGVwZW5kZWNpZXMsXG4vLyBmdWNudGlvbiBhbmQgb25tZXNzYWdlIGNhbGxiYWNrLlxuLy8gZm9yIC4uLmRpc3BhdGNoZXIuZW1pdCgnY3JlYXRlOm5ldzpwcm9jZXNzJywgLi4uKSBcbndlYk9zLmRpc3BhdGNoZXIuZW1pdChcbiAgJ2NyZWF0ZTpuZXc6cHJvY2VzcycsXG4gIC8vIHByb2Nlc3MgYm9keVxuICB7XG4gICAgZGVwczogWydodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy91bmRlcnNjb3JlLmpzLzEuOC4zL3VuZGVyc2NvcmUtbWluLmpzJ10sXG4gICAgZm46ICgpID0+IHtcbiAgICAgIGxldCBhcnIgPSBbXTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTAwMDAwMDsgaSsrKSB7XG4gICAgICAgIGFyci5wdXNoKGkpO1xuICAgICAgfVxuICAgICAgbGV0IG9kZHMgPSBfLmZpbHRlcihhcnIsIChpdGVtKSA9PiB7XG4gICAgICAgIGlmIChpdGVtICUgMiAhPSAwKSB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBwb3N0TWVzc2FnZSh7b2Rkczogb2Rkc30pO1xuXG4gICAgICAvLyB0aGlzIGV4YW1wbGUgZm9yIGltcGxlbWVudGF0aW9uIHByb2Nlc3Mgd29yayBmcm9tIGRldnRvb2xzIGJ5IHdlYk9zLnByb2Nlc3MucXVldWVcbiAgICAgIC8vIGZvciByZXByb2R1Y2UgdGhpcyB3cml0ZSB0aGlzIGxpbmUgaW4gZGV2dG9vbHNcbiAgICAgIC8vIHdlYk9zLnByb2Nlc3MucXVldWVbMF0ucG9zdE1lc3NhZ2UoWzEsIDIsIDMsIDRdKTtcbiAgICAgIC8vIE5PVEUg1onWidaJIFBsZWFzZSBiZSBhdHRlbnRpdmUgaXQgd2lsbCBiZSB3b3JrIHdoZW4gdGVybWluYXRlIGZsYWcgaXMgZmFsc2UgXG5cbiAgICAgIG9ubWVzc2FnZSA9IChlKSA9PiB7XG4gICAgICAgIGxldCByZXN1bHQgPSBfLmZpbHRlcihlLmRhdGEsIChpdGVtKSA9PiB7XG4gICAgICAgICAgaWYgKGl0ZW0gJSAyID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcG9zdE1lc3NhZ2Uoe2V2ZW5zOiByZXN1bHR9KTtcbiAgICAgIH07XG4gICAgfVxuICB9LFxuICAvLyBvcHRpb25zXG4gIHtcbiAgICAvLyBvbm1lc3NhZ2VcbiAgICBvbm1lc3NhZ2UoZSkge1xuICAgICAgbG9nKCdGcm9tIGFub3RoZXIgcHJvY2VzcyA6OjogJywgZS5kYXRhKTtcbiAgICB9LFxuICAgIC8vIG9uZXJyb3JcbiAgICBvbmVycm9yKGVycikge1xuICAgICAgbG9nKCdGcm9tIGFub3RoZXIgcHJvY2VzcyA6OjogJywgZXJyKTtcbiAgICB9LFxuXG4gICAgdGVybWluYXRlOiBmYWxzZVxuICB9XG4pO1xuXG4vLyB0ZXN0IGZvciBjcmVhdGUgbmV3IHByb2Nlc3Mgd2l0aCBkZXBlbmRlY2llcyxcbi8vIGZ1Y250aW9uIGFuZCBvbm1lc3NhZ2UgY2FsbGJhY2suXG4vLyBmb3Igd2ViT3MucHJvY2Vzcy5jcmVhdGUoLi4uKVxud2ViT3MucHJvY2Vzcy5jcmVhdGUoXG4gIC8vIHByb2Nlc3MgYm9keVxuICB7XG4gICAgZGVwczogWydodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy91bmRlcnNjb3JlLmpzLzEuOC4zL3VuZGVyc2NvcmUtbWluLmpzJ10sXG4gICAgZm46ICgpID0+IHtcbiAgICAgIGxldCBhcnIgPSBbXTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTAwMDAwMDsgaSsrKSB7XG4gICAgICAgIGFyci5wdXNoKGkpO1xuICAgICAgfVxuICAgICAgbGV0IG9kZHMgPSBfLmZpbHRlcihhcnIsIChpdGVtKSA9PiB7XG4gICAgICAgIGlmIChpdGVtICUgMiAhPSAwKSB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBwb3N0TWVzc2FnZSh7b2Rkczogb2Rkc30pO1xuXG4gICAgICAvLyB0aGlzIGV4YW1wbGUgZm9yIGltcGxlbWVudGF0aW9uIHByb2Nlc3Mgd29yayBmcm9tIGRldnRvb2xzIGJ5IHdlYk9zLnByb2Nlc3MucXVldWVcbiAgICAgIC8vIGZvciByZXByb2R1Y2UgdGhpcyB3cml0ZSB0aGlzIGxpbmUgaW4gZGV2dG9vbHNcbiAgICAgIC8vIHdlYk9zLnByb2Nlc3MucXVldWVbMF0ucG9zdE1lc3NhZ2UoWzEsIDIsIDMsIDRdKTtcbiAgICAgIC8vIE5PVEUg1onWidaJIFBsZWFzZSBiZSBhdHRlbnRpdmUgaXQgd2lsbCBiZSB3b3JrIHdoZW4gdGVybWluYXRlIGZsYWcgaXMgZmFsc2UgXG5cbiAgICAgIG9ubWVzc2FnZSA9IChlKSA9PiB7XG4gICAgICAgIGxldCByZXN1bHQgPSBfLmZpbHRlcihlLmRhdGEsIChpdGVtKSA9PiB7XG4gICAgICAgICAgaWYgKGl0ZW0gJSAyID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcG9zdE1lc3NhZ2Uoe2V2ZW5zOiByZXN1bHR9KTtcbiAgICAgIH07XG4gICAgfVxuICB9LFxuICAvLyBvcHRpb25zXG4gIHtcbiAgICAvLyBvbm1lc3NhZ2VcbiAgICBvbm1lc3NhZ2UoZSkge1xuICAgICAgbG9nKCdGcm9tIGFub3RoZXIgcHJvY2VzcyA6OjogJywgZS5kYXRhKTtcbiAgICB9LFxuICAgIC8vIG9uZXJyb3JcbiAgICBvbmVycm9yKGVycikge1xuICAgICAgbG9nKCdGcm9tIGFub3RoZXIgcHJvY2VzcyA6OjogJywgZXJyKTtcbiAgICB9LFxuXG4gICAgdGVybWluYXRlOiBmYWxzZVxuICB9XG4pO1xuXG4vLyBDcmVhdGUgbWFpbiB3b3JrZXJzXG4vLyAuLi5cblxuLy8gVGVzdCBmb3IgbmV3IGFwcGxpY2F0aW9uIHdpdGggYW5vdGhlciBwcm9jZXNzIGNhbGMgbG9naWNcbi8vIC4uLiJdLCJuYW1lcyI6WyJyZXF1aXJlJCQwIiwiaW5kZXgiLCJsb2ciLCJkZWJ1ZyIsIkVFIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUlBLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQTtBQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7QUFDZCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO0FBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQUNkLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQmxCLFNBQWMsR0FBRyxVQUFVLEdBQUcsRUFBRSxPQUFPLEVBQUU7RUFDdkMsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUE7RUFDdkIsSUFBSSxJQUFJ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QUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztNQUNsRSxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7TUFDdEUsS0FBSyxDQUFDLEVBQUUsT0FBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztNQUMxRSxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztLQUMvRTs7SUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO01BQ2xELElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzVCOztJQUVELFNBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDN0MsTUFBTTtJQUNMLElBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNO1FBQ3pCLENBQUMsQ0FBQzs7SUFFTixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtNQUMzQixJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7O01BRXBGLFFBQVEsR0FBRztRQUNULEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDMUQsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDOUQsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNO1FBQ2xFLEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDdEU7VUFDRSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0QsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7V0FDNUI7O1VBRUQsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJ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
