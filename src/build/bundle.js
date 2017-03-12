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
 * Collection for make different apps collection.
 * @module core/collection/collection
 * @see module:core/apps
 */

const log$3 = browser$1('collection:log');

{
  browser$1.enable();
}

/** Class Collection representing a applications collection. */

class Collection {
  /**
   * Create a dispatcher and collection(type Array)
   * @param { Dispatcher } dispatcher - The main dispatcher.
   */
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
    this.collection = [];
    log$3('Create Collection');
  }

  /** 
   * Get application by UUID from 'this.collection'
   * @param { string } uuid - application uuid
   * @return { object } application
   */

  getByUuid(uuid) {
    return this.collection.find(app => app.__uuid == uuid);
  }

  /** 
   * Get application by NAME from 'this.collection'
   * @param { string } name - application name
   * @return { object } application
   */

  getByName(name) {
    return this.collection.find(app => app.name == name);
  }

  /** 
   * Add aplication proxy in 'this.collection'
   * @param { proxy object } proxy
   */

  push(proxy) {
    let isNotUnique = this.getByUuid(proxy.__uuid);
    if (isNotUnique) {
      throw new Error('Dublicate application uuid');
    }
    isNotUnique = this.getByName(proxy.name);
    if (isNotUnique) {
      throw new Error('Dublicate application name');
    }
    this.collection.push(proxy);
  }

  /** 
   * Remove aplication proxy from 'this.collection'
   * @param { proxy object } proxy
   */

  removeFromCollection(proxy) {
    let currentApp = this.getByName(proxy.name);
    this.collection.splice(this.collection.indexOf(currentApp), 1);
  }

  /** 
   * Remove aplication proxy from 'this.collection'
   * and make event 'remove:app:from:main' for
   * remove application from other collections.
   * @param { proxy object } proxy
   */

  remove(app) {
    this.removeFromCollection(app);
    this.dispatcher.emit('remove:app:from:main', app);
  }
}

/**
 * Collection for dick Apps.
 * @module core/collection/activeApps
 * @see module:core/apps
 */

const log$4 = browser$1('app:log');

{
  browser$1.enable();
}

class DockApps extends Collection {
  /**
   * Create a dispatcher
   * @param { Dispatcher } dispatcher - The main dispatcher.
   */
  constructor(dispatcher) {
    super(dispatcher);
    this.remove = this.removeFromCollection;
    this.dispatcher.on('remove:app:from:main', this.remove, this);
    log$4('Create Dock Apps Collection');
  }
  /** 
   * Add aplication proxy in 'this.collection'
   * Use super.push
   * And make event 'create:app:in:dock' for show application dock panel
   * @param { proxy object } proxy
   */

  push(proxy) {
    super.push(proxy);

    this.dispatcher.emit('create:app:in:dock', {
      app: this.getByName(proxy.name)
    });
  }
}

/**
 * Collection for Active Apps.
 * @module core/collection/activeApps
 * @see module:core/apps
 */

const log$5 = browser$1('active apps:log');

{
  browser$1.enable();
}

class ActiveApps extends Collection {
  /**
   * Create a dispatcher
   * @param { Dispatcher } dispatcher - The main dispatcher.
   */
  constructor(dispatcher) {
    super(dispatcher);
    this.remove = this.removeFromCollection;
    this.dispatcher.on('remove:app:from:main', this.remove, this);
    log$5('Create Active Apps Collection');
  }

  /** 
   * Add aplication proxy in 'this.collection'
   * Use super.push
   * And make event 'open:app'
   * @param { proxy object } proxy
   */

  push(proxy) {
    super.push(proxy);

    this.dispatcher.emit('open:app', {
      app: proxy
    });
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
 * Webos Application.
 * @module core/app
 * @see module:core/init
 */

const log$8 = browser$1('webos-app:log');

{
  browser$1.enable();
}

class App {
  /**
   * 
   */
  constructor(options) {
    // function 'proxying' can get second argument which your custom
    // Proxy handler
    // TODO ::: Create restricting logic for marge custom and
    // default Proxy handler
    // => see ::: /libs/proxying.js
    this.app = proxying(options, null);
    log$8('Create webos app');
  }
}

/**
 * Calculator Applications.
 * @module core/apps/calculator
 * @see module:core/apps
 */

const log$7 = browser$1('calculator-app:log');

{
  browser$1.enable();
}

class Calculator extends App {
  constructor() {
    super({
      name: 'Calculator',
      dockApp: true
    });
  }
}

/**
 * Default Applications.
 * @module core/apps/defaults
 * @see module:core/apps
 */

const log$6 = browser$1('default-apps:log');

{
  browser$1.enable();
}

var defaultApps = [
  (new Calculator).app
];

/**
 * Applications Collection.
 * @module core/apps
 * @see module:core/init
 */

const log$2 = browser$1('webos-apps:log');
// Disable logging in production
{
  browser$1.enable('*');
}

class Apps {
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
    log$2('Create webos apps');
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
const log$9 = browser$1('process:log');
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
    log$9('run Process class');
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

Object.freeze(webOs);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9ub2RlX21vZHVsZXMvbXMvaW5kZXguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZGVidWcvc3JjL2RlYnVnLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2RlYnVnL3NyYy9icm93c2VyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2V2ZW50ZW1pdHRlcjMvaW5kZXguanMiLCIuLi9qcy9jb3JlL2Rpc3BhdGNoZXIuanMiLCIuLi9qcy9jb3JlL2NvbGxlY3Rpb25zL2NvbGxlY3Rpb24uanMiLCIuLi9qcy9jb3JlL2NvbGxlY3Rpb25zL2RvY2tBcHBzLmpzIiwiLi4vanMvY29yZS9jb2xsZWN0aW9ucy9hY3RpdmVBcHBzLmpzIiwiLi4vanMvbGlicy9hcHAucHJveHkuaGFuZGxlci5qcyIsIi4uL2pzL2xpYnMvcHJveHlpbmcuanMiLCIuLi9qcy9jb3JlL2FwcC5qcyIsIi4uL2pzL2FwcHMvY2FsY3VsYXRvci5qcyIsIi4uL2pzL2FwcHMvZGVmYXVsdHMuanMiLCIuLi9qcy9jb3JlL2FwcHMuanMiLCIuLi9qcy9saWJzL3dvcmtlclNvdXJjZS5tYWtlci5qcyIsIi4uL2pzL2NvcmUvcHJvY2Vzcy5qcyIsIi4uL2pzL2NvcmUvaW5pdC5qcyIsIi4uL2pzL21haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBIZWxwZXJzLlxuICovXG5cbnZhciBzID0gMTAwMFxudmFyIG0gPSBzICogNjBcbnZhciBoID0gbSAqIDYwXG52YXIgZCA9IGggKiAyNFxudmFyIHkgPSBkICogMzY1LjI1XG5cbi8qKlxuICogUGFyc2Ugb3IgZm9ybWF0IHRoZSBnaXZlbiBgdmFsYC5cbiAqXG4gKiBPcHRpb25zOlxuICpcbiAqICAtIGBsb25nYCB2ZXJib3NlIGZvcm1hdHRpbmcgW2ZhbHNlXVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0gdmFsXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHRocm93cyB7RXJyb3J9IHRocm93IGFuIGVycm9yIGlmIHZhbCBpcyBub3QgYSBub24tZW1wdHkgc3RyaW5nIG9yIGEgbnVtYmVyXG4gKiBAcmV0dXJuIHtTdHJpbmd8TnVtYmVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh2YWwsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsXG4gIGlmICh0eXBlID09PSAnc3RyaW5nJyAmJiB2YWwubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBwYXJzZSh2YWwpXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgaXNOYU4odmFsKSA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gb3B0aW9ucy5sb25nID9cblx0XHRcdGZtdExvbmcodmFsKSA6XG5cdFx0XHRmbXRTaG9ydCh2YWwpXG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCd2YWwgaXMgbm90IGEgbm9uLWVtcHR5IHN0cmluZyBvciBhIHZhbGlkIG51bWJlci4gdmFsPScgKyBKU09OLnN0cmluZ2lmeSh2YWwpKVxufVxuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBgc3RyYCBhbmQgcmV0dXJuIG1pbGxpc2Vjb25kcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShzdHIpIHtcbiAgc3RyID0gU3RyaW5nKHN0cilcbiAgaWYgKHN0ci5sZW5ndGggPiAxMDAwMCkge1xuICAgIHJldHVyblxuICB9XG4gIHZhciBtYXRjaCA9IC9eKCg/OlxcZCspP1xcLj9cXGQrKSAqKG1pbGxpc2Vjb25kcz98bXNlY3M/fG1zfHNlY29uZHM/fHNlY3M/fHN8bWludXRlcz98bWlucz98bXxob3Vycz98aHJzP3xofGRheXM/fGR8eWVhcnM/fHlycz98eSk/JC9pLmV4ZWMoc3RyKVxuICBpZiAoIW1hdGNoKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgdmFyIG4gPSBwYXJzZUZsb2F0KG1hdGNoWzFdKVxuICB2YXIgdHlwZSA9IChtYXRjaFsyXSB8fCAnbXMnKS50b0xvd2VyQ2FzZSgpXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ3llYXJzJzpcbiAgICBjYXNlICd5ZWFyJzpcbiAgICBjYXNlICd5cnMnOlxuICAgIGNhc2UgJ3lyJzpcbiAgICBjYXNlICd5JzpcbiAgICAgIHJldHVybiBuICogeVxuICAgIGNhc2UgJ2RheXMnOlxuICAgIGNhc2UgJ2RheSc6XG4gICAgY2FzZSAnZCc6XG4gICAgICByZXR1cm4gbiAqIGRcbiAgICBjYXNlICdob3Vycyc6XG4gICAgY2FzZSAnaG91cic6XG4gICAgY2FzZSAnaHJzJzpcbiAgICBjYXNlICdocic6XG4gICAgY2FzZSAnaCc6XG4gICAgICByZXR1cm4gbiAqIGhcbiAgICBjYXNlICdtaW51dGVzJzpcbiAgICBjYXNlICdtaW51dGUnOlxuICAgIGNhc2UgJ21pbnMnOlxuICAgIGNhc2UgJ21pbic6XG4gICAgY2FzZSAnbSc6XG4gICAgICByZXR1cm4gbiAqIG1cbiAgICBjYXNlICdzZWNvbmRzJzpcbiAgICBjYXNlICdzZWNvbmQnOlxuICAgIGNhc2UgJ3NlY3MnOlxuICAgIGNhc2UgJ3NlYyc6XG4gICAgY2FzZSAncyc6XG4gICAgICByZXR1cm4gbiAqIHNcbiAgICBjYXNlICdtaWxsaXNlY29uZHMnOlxuICAgIGNhc2UgJ21pbGxpc2Vjb25kJzpcbiAgICBjYXNlICdtc2Vjcyc6XG4gICAgY2FzZSAnbXNlYyc6XG4gICAgY2FzZSAnbXMnOlxuICAgICAgcmV0dXJuIG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG59XG5cbi8qKlxuICogU2hvcnQgZm9ybWF0IGZvciBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZm10U2hvcnQobXMpIHtcbiAgaWYgKG1zID49IGQpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIGQpICsgJ2QnXG4gIH1cbiAgaWYgKG1zID49IGgpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIGgpICsgJ2gnXG4gIH1cbiAgaWYgKG1zID49IG0pIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIG0pICsgJ20nXG4gIH1cbiAgaWYgKG1zID49IHMpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIHMpICsgJ3MnXG4gIH1cbiAgcmV0dXJuIG1zICsgJ21zJ1xufVxuXG4vKipcbiAqIExvbmcgZm9ybWF0IGZvciBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZm10TG9uZyhtcykge1xuICByZXR1cm4gcGx1cmFsKG1zLCBkLCAnZGF5JykgfHxcbiAgICBwbHVyYWwobXMsIGgsICdob3VyJykgfHxcbiAgICBwbHVyYWwobXMsIG0sICdtaW51dGUnKSB8fFxuICAgIHBsdXJhbChtcywgcywgJ3NlY29uZCcpIHx8XG4gICAgbXMgKyAnIG1zJ1xufVxuXG4vKipcbiAqIFBsdXJhbGl6YXRpb24gaGVscGVyLlxuICovXG5cbmZ1bmN0aW9uIHBsdXJhbChtcywgbiwgbmFtZSkge1xuICBpZiAobXMgPCBuKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgaWYgKG1zIDwgbiAqIDEuNSkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKG1zIC8gbikgKyAnICcgKyBuYW1lXG4gIH1cbiAgcmV0dXJuIE1hdGguY2VpbChtcyAvIG4pICsgJyAnICsgbmFtZSArICdzJ1xufVxuIiwiXG4vKipcbiAqIFRoaXMgaXMgdGhlIGNvbW1vbiBsb2dpYyBmb3IgYm90aCB0aGUgTm9kZS5qcyBhbmQgd2ViIGJyb3dzZXJcbiAqIGltcGxlbWVudGF0aW9ucyBvZiBgZGVidWcoKWAuXG4gKlxuICogRXhwb3NlIGBkZWJ1ZygpYCBhcyB0aGUgbW9kdWxlLlxuICovXG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZURlYnVnLmRlYnVnID0gY3JlYXRlRGVidWcuZGVmYXVsdCA9IGNyZWF0ZURlYnVnO1xuZXhwb3J0cy5jb2VyY2UgPSBjb2VyY2U7XG5leHBvcnRzLmRpc2FibGUgPSBkaXNhYmxlO1xuZXhwb3J0cy5lbmFibGUgPSBlbmFibGU7XG5leHBvcnRzLmVuYWJsZWQgPSBlbmFibGVkO1xuZXhwb3J0cy5odW1hbml6ZSA9IHJlcXVpcmUoJ21zJyk7XG5cbi8qKlxuICogVGhlIGN1cnJlbnRseSBhY3RpdmUgZGVidWcgbW9kZSBuYW1lcywgYW5kIG5hbWVzIHRvIHNraXAuXG4gKi9cblxuZXhwb3J0cy5uYW1lcyA9IFtdO1xuZXhwb3J0cy5za2lwcyA9IFtdO1xuXG4vKipcbiAqIE1hcCBvZiBzcGVjaWFsIFwiJW5cIiBoYW5kbGluZyBmdW5jdGlvbnMsIGZvciB0aGUgZGVidWcgXCJmb3JtYXRcIiBhcmd1bWVudC5cbiAqXG4gKiBWYWxpZCBrZXkgbmFtZXMgYXJlIGEgc2luZ2xlLCBsb3dlciBvciB1cHBlci1jYXNlIGxldHRlciwgaS5lLiBcIm5cIiBhbmQgXCJOXCIuXG4gKi9cblxuZXhwb3J0cy5mb3JtYXR0ZXJzID0ge307XG5cbi8qKlxuICogUHJldmlvdXMgbG9nIHRpbWVzdGFtcC5cbiAqL1xuXG52YXIgcHJldlRpbWU7XG5cbi8qKlxuICogU2VsZWN0IGEgY29sb3IuXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZWxlY3RDb2xvcihuYW1lc3BhY2UpIHtcbiAgdmFyIGhhc2ggPSAwLCBpO1xuXG4gIGZvciAoaSBpbiBuYW1lc3BhY2UpIHtcbiAgICBoYXNoICA9ICgoaGFzaCA8PCA1KSAtIGhhc2gpICsgbmFtZXNwYWNlLmNoYXJDb2RlQXQoaSk7XG4gICAgaGFzaCB8PSAwOyAvLyBDb252ZXJ0IHRvIDMyYml0IGludGVnZXJcbiAgfVxuXG4gIHJldHVybiBleHBvcnRzLmNvbG9yc1tNYXRoLmFicyhoYXNoKSAlIGV4cG9ydHMuY29sb3JzLmxlbmd0aF07XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgZGVidWdnZXIgd2l0aCB0aGUgZ2l2ZW4gYG5hbWVzcGFjZWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZVxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGNyZWF0ZURlYnVnKG5hbWVzcGFjZSkge1xuXG4gIGZ1bmN0aW9uIGRlYnVnKCkge1xuICAgIC8vIGRpc2FibGVkP1xuICAgIGlmICghZGVidWcuZW5hYmxlZCkgcmV0dXJuO1xuXG4gICAgdmFyIHNlbGYgPSBkZWJ1ZztcblxuICAgIC8vIHNldCBgZGlmZmAgdGltZXN0YW1wXG4gICAgdmFyIGN1cnIgPSArbmV3IERhdGUoKTtcbiAgICB2YXIgbXMgPSBjdXJyIC0gKHByZXZUaW1lIHx8IGN1cnIpO1xuICAgIHNlbGYuZGlmZiA9IG1zO1xuICAgIHNlbGYucHJldiA9IHByZXZUaW1lO1xuICAgIHNlbGYuY3VyciA9IGN1cnI7XG4gICAgcHJldlRpbWUgPSBjdXJyO1xuXG4gICAgLy8gdHVybiB0aGUgYGFyZ3VtZW50c2AgaW50byBhIHByb3BlciBBcnJheVxuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG5cbiAgICBhcmdzWzBdID0gZXhwb3J0cy5jb2VyY2UoYXJnc1swXSk7XG5cbiAgICBpZiAoJ3N0cmluZycgIT09IHR5cGVvZiBhcmdzWzBdKSB7XG4gICAgICAvLyBhbnl0aGluZyBlbHNlIGxldCdzIGluc3BlY3Qgd2l0aCAlT1xuICAgICAgYXJncy51bnNoaWZ0KCclTycpO1xuICAgIH1cblxuICAgIC8vIGFwcGx5IGFueSBgZm9ybWF0dGVyc2AgdHJhbnNmb3JtYXRpb25zXG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICBhcmdzWzBdID0gYXJnc1swXS5yZXBsYWNlKC8lKFthLXpBLVolXSkvZywgZnVuY3Rpb24obWF0Y2gsIGZvcm1hdCkge1xuICAgICAgLy8gaWYgd2UgZW5jb3VudGVyIGFuIGVzY2FwZWQgJSB0aGVuIGRvbid0IGluY3JlYXNlIHRoZSBhcnJheSBpbmRleFxuICAgICAgaWYgKG1hdGNoID09PSAnJSUnKSByZXR1cm4gbWF0Y2g7XG4gICAgICBpbmRleCsrO1xuICAgICAgdmFyIGZvcm1hdHRlciA9IGV4cG9ydHMuZm9ybWF0dGVyc1tmb3JtYXRdO1xuICAgICAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBmb3JtYXR0ZXIpIHtcbiAgICAgICAgdmFyIHZhbCA9IGFyZ3NbaW5kZXhdO1xuICAgICAgICBtYXRjaCA9IGZvcm1hdHRlci5jYWxsKHNlbGYsIHZhbCk7XG5cbiAgICAgICAgLy8gbm93IHdlIG5lZWQgdG8gcmVtb3ZlIGBhcmdzW2luZGV4XWAgc2luY2UgaXQncyBpbmxpbmVkIGluIHRoZSBgZm9ybWF0YFxuICAgICAgICBhcmdzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIGluZGV4LS07XG4gICAgICB9XG4gICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfSk7XG5cbiAgICAvLyBhcHBseSBlbnYtc3BlY2lmaWMgZm9ybWF0dGluZyAoY29sb3JzLCBldGMuKVxuICAgIGV4cG9ydHMuZm9ybWF0QXJncy5jYWxsKHNlbGYsIGFyZ3MpO1xuXG4gICAgdmFyIGxvZ0ZuID0gZGVidWcubG9nIHx8IGV4cG9ydHMubG9nIHx8IGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSk7XG4gICAgbG9nRm4uYXBwbHkoc2VsZiwgYXJncyk7XG4gIH1cblxuICBkZWJ1Zy5uYW1lc3BhY2UgPSBuYW1lc3BhY2U7XG4gIGRlYnVnLmVuYWJsZWQgPSBleHBvcnRzLmVuYWJsZWQobmFtZXNwYWNlKTtcbiAgZGVidWcudXNlQ29sb3JzID0gZXhwb3J0cy51c2VDb2xvcnMoKTtcbiAgZGVidWcuY29sb3IgPSBzZWxlY3RDb2xvcihuYW1lc3BhY2UpO1xuXG4gIC8vIGVudi1zcGVjaWZpYyBpbml0aWFsaXphdGlvbiBsb2dpYyBmb3IgZGVidWcgaW5zdGFuY2VzXG4gIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgZXhwb3J0cy5pbml0KSB7XG4gICAgZXhwb3J0cy5pbml0KGRlYnVnKTtcbiAgfVxuXG4gIHJldHVybiBkZWJ1Zztcbn1cblxuLyoqXG4gKiBFbmFibGVzIGEgZGVidWcgbW9kZSBieSBuYW1lc3BhY2VzLiBUaGlzIGNhbiBpbmNsdWRlIG1vZGVzXG4gKiBzZXBhcmF0ZWQgYnkgYSBjb2xvbiBhbmQgd2lsZGNhcmRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGVuYWJsZShuYW1lc3BhY2VzKSB7XG4gIGV4cG9ydHMuc2F2ZShuYW1lc3BhY2VzKTtcblxuICB2YXIgc3BsaXQgPSAobmFtZXNwYWNlcyB8fCAnJykuc3BsaXQoL1tcXHMsXSsvKTtcbiAgdmFyIGxlbiA9IHNwbGl0Lmxlbmd0aDtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKCFzcGxpdFtpXSkgY29udGludWU7IC8vIGlnbm9yZSBlbXB0eSBzdHJpbmdzXG4gICAgbmFtZXNwYWNlcyA9IHNwbGl0W2ldLnJlcGxhY2UoL1xcKi9nLCAnLio/Jyk7XG4gICAgaWYgKG5hbWVzcGFjZXNbMF0gPT09ICctJykge1xuICAgICAgZXhwb3J0cy5za2lwcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlcy5zdWJzdHIoMSkgKyAnJCcpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXhwb3J0cy5uYW1lcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlcyArICckJykpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIERpc2FibGUgZGVidWcgb3V0cHV0LlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZGlzYWJsZSgpIHtcbiAgZXhwb3J0cy5lbmFibGUoJycpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgZ2l2ZW4gbW9kZSBuYW1lIGlzIGVuYWJsZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZW5hYmxlZChuYW1lKSB7XG4gIHZhciBpLCBsZW47XG4gIGZvciAoaSA9IDAsIGxlbiA9IGV4cG9ydHMuc2tpcHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZXhwb3J0cy5za2lwc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIGZvciAoaSA9IDAsIGxlbiA9IGV4cG9ydHMubmFtZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoZXhwb3J0cy5uYW1lc1tpXS50ZXN0KG5hbWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIENvZXJjZSBgdmFsYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge01peGVkfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gY29lcmNlKHZhbCkge1xuICBpZiAodmFsIGluc3RhbmNlb2YgRXJyb3IpIHJldHVybiB2YWwuc3RhY2sgfHwgdmFsLm1lc3NhZ2U7XG4gIHJldHVybiB2YWw7XG59XG4iLCIvKipcbiAqIFRoaXMgaXMgdGhlIHdlYiBicm93c2VyIGltcGxlbWVudGF0aW9uIG9mIGBkZWJ1ZygpYC5cbiAqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9kZWJ1ZycpO1xuZXhwb3J0cy5sb2cgPSBsb2c7XG5leHBvcnRzLmZvcm1hdEFyZ3MgPSBmb3JtYXRBcmdzO1xuZXhwb3J0cy5zYXZlID0gc2F2ZTtcbmV4cG9ydHMubG9hZCA9IGxvYWQ7XG5leHBvcnRzLnVzZUNvbG9ycyA9IHVzZUNvbG9ycztcbmV4cG9ydHMuc3RvcmFnZSA9ICd1bmRlZmluZWQnICE9IHR5cGVvZiBjaHJvbWVcbiAgICAgICAgICAgICAgICYmICd1bmRlZmluZWQnICE9IHR5cGVvZiBjaHJvbWUuc3RvcmFnZVxuICAgICAgICAgICAgICAgICAgPyBjaHJvbWUuc3RvcmFnZS5sb2NhbFxuICAgICAgICAgICAgICAgICAgOiBsb2NhbHN0b3JhZ2UoKTtcblxuLyoqXG4gKiBDb2xvcnMuXG4gKi9cblxuZXhwb3J0cy5jb2xvcnMgPSBbXG4gICdsaWdodHNlYWdyZWVuJyxcbiAgJ2ZvcmVzdGdyZWVuJyxcbiAgJ2dvbGRlbnJvZCcsXG4gICdkb2RnZXJibHVlJyxcbiAgJ2RhcmtvcmNoaWQnLFxuICAnY3JpbXNvbidcbl07XG5cbi8qKlxuICogQ3VycmVudGx5IG9ubHkgV2ViS2l0LWJhc2VkIFdlYiBJbnNwZWN0b3JzLCBGaXJlZm94ID49IHYzMSxcbiAqIGFuZCB0aGUgRmlyZWJ1ZyBleHRlbnNpb24gKGFueSBGaXJlZm94IHZlcnNpb24pIGFyZSBrbm93blxuICogdG8gc3VwcG9ydCBcIiVjXCIgQ1NTIGN1c3RvbWl6YXRpb25zLlxuICpcbiAqIFRPRE86IGFkZCBhIGBsb2NhbFN0b3JhZ2VgIHZhcmlhYmxlIHRvIGV4cGxpY2l0bHkgZW5hYmxlL2Rpc2FibGUgY29sb3JzXG4gKi9cblxuZnVuY3Rpb24gdXNlQ29sb3JzKCkge1xuICAvLyBOQjogSW4gYW4gRWxlY3Ryb24gcHJlbG9hZCBzY3JpcHQsIGRvY3VtZW50IHdpbGwgYmUgZGVmaW5lZCBidXQgbm90IGZ1bGx5XG4gIC8vIGluaXRpYWxpemVkLiBTaW5jZSB3ZSBrbm93IHdlJ3JlIGluIENocm9tZSwgd2UnbGwganVzdCBkZXRlY3QgdGhpcyBjYXNlXG4gIC8vIGV4cGxpY2l0bHlcbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdyAmJiB0eXBlb2Ygd2luZG93LnByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5wcm9jZXNzLnR5cGUgPT09ICdyZW5kZXJlcicpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIGlzIHdlYmtpdD8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTY0NTk2MDYvMzc2NzczXG4gIC8vIGRvY3VtZW50IGlzIHVuZGVmaW5lZCBpbiByZWFjdC1uYXRpdmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWFjdC1uYXRpdmUvcHVsbC8xNjMyXG4gIHJldHVybiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudCAmJiAnV2Via2l0QXBwZWFyYW5jZScgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlKSB8fFxuICAgIC8vIGlzIGZpcmVidWc/IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzM5ODEyMC8zNzY3NzNcbiAgICAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93ICYmIHdpbmRvdy5jb25zb2xlICYmIChjb25zb2xlLmZpcmVidWcgfHwgKGNvbnNvbGUuZXhjZXB0aW9uICYmIGNvbnNvbGUudGFibGUpKSkgfHxcbiAgICAvLyBpcyBmaXJlZm94ID49IHYzMT9cbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1Rvb2xzL1dlYl9Db25zb2xlI1N0eWxpbmdfbWVzc2FnZXNcbiAgICAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yICYmIG5hdmlnYXRvci51c2VyQWdlbnQgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLm1hdGNoKC9maXJlZm94XFwvKFxcZCspLykgJiYgcGFyc2VJbnQoUmVnRXhwLiQxLCAxMCkgPj0gMzEpIHx8XG4gICAgLy8gZG91YmxlIGNoZWNrIHdlYmtpdCBpbiB1c2VyQWdlbnQganVzdCBpbiBjYXNlIHdlIGFyZSBpbiBhIHdvcmtlclxuICAgICh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyAmJiBuYXZpZ2F0b3IgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkubWF0Y2goL2FwcGxld2Via2l0XFwvKFxcZCspLykpO1xufVxuXG4vKipcbiAqIE1hcCAlaiB0byBgSlNPTi5zdHJpbmdpZnkoKWAsIHNpbmNlIG5vIFdlYiBJbnNwZWN0b3JzIGRvIHRoYXQgYnkgZGVmYXVsdC5cbiAqL1xuXG5leHBvcnRzLmZvcm1hdHRlcnMuaiA9IGZ1bmN0aW9uKHYpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiAnW1VuZXhwZWN0ZWRKU09OUGFyc2VFcnJvcl06ICcgKyBlcnIubWVzc2FnZTtcbiAgfVxufTtcblxuXG4vKipcbiAqIENvbG9yaXplIGxvZyBhcmd1bWVudHMgaWYgZW5hYmxlZC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGZvcm1hdEFyZ3MoYXJncykge1xuICB2YXIgdXNlQ29sb3JzID0gdGhpcy51c2VDb2xvcnM7XG5cbiAgYXJnc1swXSA9ICh1c2VDb2xvcnMgPyAnJWMnIDogJycpXG4gICAgKyB0aGlzLm5hbWVzcGFjZVxuICAgICsgKHVzZUNvbG9ycyA/ICcgJWMnIDogJyAnKVxuICAgICsgYXJnc1swXVxuICAgICsgKHVzZUNvbG9ycyA/ICclYyAnIDogJyAnKVxuICAgICsgJysnICsgZXhwb3J0cy5odW1hbml6ZSh0aGlzLmRpZmYpO1xuXG4gIGlmICghdXNlQ29sb3JzKSByZXR1cm47XG5cbiAgdmFyIGMgPSAnY29sb3I6ICcgKyB0aGlzLmNvbG9yO1xuICBhcmdzLnNwbGljZSgxLCAwLCBjLCAnY29sb3I6IGluaGVyaXQnKVxuXG4gIC8vIHRoZSBmaW5hbCBcIiVjXCIgaXMgc29tZXdoYXQgdHJpY2t5LCBiZWNhdXNlIHRoZXJlIGNvdWxkIGJlIG90aGVyXG4gIC8vIGFyZ3VtZW50cyBwYXNzZWQgZWl0aGVyIGJlZm9yZSBvciBhZnRlciB0aGUgJWMsIHNvIHdlIG5lZWQgdG9cbiAgLy8gZmlndXJlIG91dCB0aGUgY29ycmVjdCBpbmRleCB0byBpbnNlcnQgdGhlIENTUyBpbnRvXG4gIHZhciBpbmRleCA9IDA7XG4gIHZhciBsYXN0QyA9IDA7XG4gIGFyZ3NbMF0ucmVwbGFjZSgvJVthLXpBLVolXS9nLCBmdW5jdGlvbihtYXRjaCkge1xuICAgIGlmICgnJSUnID09PSBtYXRjaCkgcmV0dXJuO1xuICAgIGluZGV4Kys7XG4gICAgaWYgKCclYycgPT09IG1hdGNoKSB7XG4gICAgICAvLyB3ZSBvbmx5IGFyZSBpbnRlcmVzdGVkIGluIHRoZSAqbGFzdCogJWNcbiAgICAgIC8vICh0aGUgdXNlciBtYXkgaGF2ZSBwcm92aWRlZCB0aGVpciBvd24pXG4gICAgICBsYXN0QyA9IGluZGV4O1xuICAgIH1cbiAgfSk7XG5cbiAgYXJncy5zcGxpY2UobGFzdEMsIDAsIGMpO1xufVxuXG4vKipcbiAqIEludm9rZXMgYGNvbnNvbGUubG9nKClgIHdoZW4gYXZhaWxhYmxlLlxuICogTm8tb3Agd2hlbiBgY29uc29sZS5sb2dgIGlzIG5vdCBhIFwiZnVuY3Rpb25cIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGxvZygpIHtcbiAgLy8gdGhpcyBoYWNrZXJ5IGlzIHJlcXVpcmVkIGZvciBJRTgvOSwgd2hlcmVcbiAgLy8gdGhlIGBjb25zb2xlLmxvZ2AgZnVuY3Rpb24gZG9lc24ndCBoYXZlICdhcHBseSdcbiAgcmV0dXJuICdvYmplY3QnID09PSB0eXBlb2YgY29uc29sZVxuICAgICYmIGNvbnNvbGUubG9nXG4gICAgJiYgRnVuY3Rpb24ucHJvdG90eXBlLmFwcGx5LmNhbGwoY29uc29sZS5sb2csIGNvbnNvbGUsIGFyZ3VtZW50cyk7XG59XG5cbi8qKlxuICogU2F2ZSBgbmFtZXNwYWNlc2AuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNhdmUobmFtZXNwYWNlcykge1xuICB0cnkge1xuICAgIGlmIChudWxsID09IG5hbWVzcGFjZXMpIHtcbiAgICAgIGV4cG9ydHMuc3RvcmFnZS5yZW1vdmVJdGVtKCdkZWJ1ZycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleHBvcnRzLnN0b3JhZ2UuZGVidWcgPSBuYW1lc3BhY2VzO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7fVxufVxuXG4vKipcbiAqIExvYWQgYG5hbWVzcGFjZXNgLlxuICpcbiAqIEByZXR1cm4ge1N0cmluZ30gcmV0dXJucyB0aGUgcHJldmlvdXNseSBwZXJzaXN0ZWQgZGVidWcgbW9kZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGxvYWQoKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGV4cG9ydHMuc3RvcmFnZS5kZWJ1ZztcbiAgfSBjYXRjaChlKSB7fVxuXG4gIC8vIElmIGRlYnVnIGlzbid0IHNldCBpbiBMUywgYW5kIHdlJ3JlIGluIEVsZWN0cm9uLCB0cnkgdG8gbG9hZCAkREVCVUdcbiAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiAnZW52JyBpbiBwcm9jZXNzKSB7XG4gICAgcmV0dXJuIHByb2Nlc3MuZW52LkRFQlVHO1xuICB9XG59XG5cbi8qKlxuICogRW5hYmxlIG5hbWVzcGFjZXMgbGlzdGVkIGluIGBsb2NhbFN0b3JhZ2UuZGVidWdgIGluaXRpYWxseS5cbiAqL1xuXG5leHBvcnRzLmVuYWJsZShsb2FkKCkpO1xuXG4vKipcbiAqIExvY2Fsc3RvcmFnZSBhdHRlbXB0cyB0byByZXR1cm4gdGhlIGxvY2Fsc3RvcmFnZS5cbiAqXG4gKiBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHNhZmFyaSB0aHJvd3NcbiAqIHdoZW4gYSB1c2VyIGRpc2FibGVzIGNvb2tpZXMvbG9jYWxzdG9yYWdlXG4gKiBhbmQgeW91IGF0dGVtcHQgdG8gYWNjZXNzIGl0LlxuICpcbiAqIEByZXR1cm4ge0xvY2FsU3RvcmFnZX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGxvY2Fsc3RvcmFnZSgpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gd2luZG93LmxvY2FsU3RvcmFnZTtcbiAgfSBjYXRjaCAoZSkge31cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhcyA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHlcbiAgLCBwcmVmaXggPSAnfic7XG5cbi8qKlxuICogQ29uc3RydWN0b3IgdG8gY3JlYXRlIGEgc3RvcmFnZSBmb3Igb3VyIGBFRWAgb2JqZWN0cy5cbiAqIEFuIGBFdmVudHNgIGluc3RhbmNlIGlzIGEgcGxhaW4gb2JqZWN0IHdob3NlIHByb3BlcnRpZXMgYXJlIGV2ZW50IG5hbWVzLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIEV2ZW50cygpIHt9XG5cbi8vXG4vLyBXZSB0cnkgdG8gbm90IGluaGVyaXQgZnJvbSBgT2JqZWN0LnByb3RvdHlwZWAuIEluIHNvbWUgZW5naW5lcyBjcmVhdGluZyBhblxuLy8gaW5zdGFuY2UgaW4gdGhpcyB3YXkgaXMgZmFzdGVyIHRoYW4gY2FsbGluZyBgT2JqZWN0LmNyZWF0ZShudWxsKWAgZGlyZWN0bHkuXG4vLyBJZiBgT2JqZWN0LmNyZWF0ZShudWxsKWAgaXMgbm90IHN1cHBvcnRlZCB3ZSBwcmVmaXggdGhlIGV2ZW50IG5hbWVzIHdpdGggYVxuLy8gY2hhcmFjdGVyIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSBidWlsdC1pbiBvYmplY3QgcHJvcGVydGllcyBhcmUgbm90XG4vLyBvdmVycmlkZGVuIG9yIHVzZWQgYXMgYW4gYXR0YWNrIHZlY3Rvci5cbi8vXG5pZiAoT2JqZWN0LmNyZWF0ZSkge1xuICBFdmVudHMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAvL1xuICAvLyBUaGlzIGhhY2sgaXMgbmVlZGVkIGJlY2F1c2UgdGhlIGBfX3Byb3RvX19gIHByb3BlcnR5IGlzIHN0aWxsIGluaGVyaXRlZCBpblxuICAvLyBzb21lIG9sZCBicm93c2VycyBsaWtlIEFuZHJvaWQgNCwgaVBob25lIDUuMSwgT3BlcmEgMTEgYW5kIFNhZmFyaSA1LlxuICAvL1xuICBpZiAoIW5ldyBFdmVudHMoKS5fX3Byb3RvX18pIHByZWZpeCA9IGZhbHNlO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudGF0aW9uIG9mIGEgc2luZ2xlIGV2ZW50IGxpc3RlbmVyLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgVGhlIGNvbnRleHQgdG8gaW52b2tlIHRoZSBsaXN0ZW5lciB3aXRoLlxuICogQHBhcmFtIHtCb29sZWFufSBbb25jZT1mYWxzZV0gU3BlY2lmeSBpZiB0aGUgbGlzdGVuZXIgaXMgYSBvbmUtdGltZSBsaXN0ZW5lci5cbiAqIEBjb25zdHJ1Y3RvclxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIEVFKGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHRoaXMuZm4gPSBmbjtcbiAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgdGhpcy5vbmNlID0gb25jZSB8fCBmYWxzZTtcbn1cblxuLyoqXG4gKiBNaW5pbWFsIGBFdmVudEVtaXR0ZXJgIGludGVyZmFjZSB0aGF0IGlzIG1vbGRlZCBhZ2FpbnN0IHRoZSBOb2RlLmpzXG4gKiBgRXZlbnRFbWl0dGVyYCBpbnRlcmZhY2UuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAYXBpIHB1YmxpY1xuICovXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IG5ldyBFdmVudHMoKTtcbiAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xufVxuXG4vKipcbiAqIFJldHVybiBhbiBhcnJheSBsaXN0aW5nIHRoZSBldmVudHMgZm9yIHdoaWNoIHRoZSBlbWl0dGVyIGhhcyByZWdpc3RlcmVkXG4gKiBsaXN0ZW5lcnMuXG4gKlxuICogQHJldHVybnMge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5ldmVudE5hbWVzID0gZnVuY3Rpb24gZXZlbnROYW1lcygpIHtcbiAgdmFyIG5hbWVzID0gW11cbiAgICAsIGV2ZW50c1xuICAgICwgbmFtZTtcblxuICBpZiAodGhpcy5fZXZlbnRzQ291bnQgPT09IDApIHJldHVybiBuYW1lcztcblxuICBmb3IgKG5hbWUgaW4gKGV2ZW50cyA9IHRoaXMuX2V2ZW50cykpIHtcbiAgICBpZiAoaGFzLmNhbGwoZXZlbnRzLCBuYW1lKSkgbmFtZXMucHVzaChwcmVmaXggPyBuYW1lLnNsaWNlKDEpIDogbmFtZSk7XG4gIH1cblxuICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykge1xuICAgIHJldHVybiBuYW1lcy5jb25jYXQoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhldmVudHMpKTtcbiAgfVxuXG4gIHJldHVybiBuYW1lcztcbn07XG5cbi8qKlxuICogUmV0dXJuIHRoZSBsaXN0ZW5lcnMgcmVnaXN0ZXJlZCBmb3IgYSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xTeW1ib2x9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHBhcmFtIHtCb29sZWFufSBleGlzdHMgT25seSBjaGVjayBpZiB0aGVyZSBhcmUgbGlzdGVuZXJzLlxuICogQHJldHVybnMge0FycmF5fEJvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyhldmVudCwgZXhpc3RzKSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50XG4gICAgLCBhdmFpbGFibGUgPSB0aGlzLl9ldmVudHNbZXZ0XTtcblxuICBpZiAoZXhpc3RzKSByZXR1cm4gISFhdmFpbGFibGU7XG4gIGlmICghYXZhaWxhYmxlKSByZXR1cm4gW107XG4gIGlmIChhdmFpbGFibGUuZm4pIHJldHVybiBbYXZhaWxhYmxlLmZuXTtcblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGF2YWlsYWJsZS5sZW5ndGgsIGVlID0gbmV3IEFycmF5KGwpOyBpIDwgbDsgaSsrKSB7XG4gICAgZWVbaV0gPSBhdmFpbGFibGVbaV0uZm47XG4gIH1cblxuICByZXR1cm4gZWU7XG59O1xuXG4vKipcbiAqIENhbGxzIGVhY2ggb2YgdGhlIGxpc3RlbmVycyByZWdpc3RlcmVkIGZvciBhIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfFN5bWJvbH0gZXZlbnQgVGhlIGV2ZW50IG5hbWUuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCBlbHNlIGBmYWxzZWAuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KGV2ZW50LCBhMSwgYTIsIGEzLCBhNCwgYTUpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIGZhbHNlO1xuXG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbZXZ0XVxuICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICwgYXJnc1xuICAgICwgaTtcblxuICBpZiAobGlzdGVuZXJzLmZuKSB7XG4gICAgaWYgKGxpc3RlbmVycy5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnMuZm4sIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cbiAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgY2FzZSAxOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQpLCB0cnVlO1xuICAgICAgY2FzZSAyOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExKSwgdHJ1ZTtcbiAgICAgIGNhc2UgMzogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIpLCB0cnVlO1xuICAgICAgY2FzZSA0OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMpLCB0cnVlO1xuICAgICAgY2FzZSA1OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgNjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCwgYTUpLCB0cnVlO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDEsIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0xKTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICB9XG5cbiAgICBsaXN0ZW5lcnMuZm4uYXBwbHkobGlzdGVuZXJzLmNvbnRleHQsIGFyZ3MpO1xuICB9IGVsc2Uge1xuICAgIHZhciBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoXG4gICAgICAsIGo7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChsaXN0ZW5lcnNbaV0ub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzW2ldLmZuLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgICBjYXNlIDE6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0KTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMjogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMzogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMik7IGJyZWFrO1xuICAgICAgICBjYXNlIDQ6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSwgYTIsIGEzKTsgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgaWYgKCFhcmdzKSBmb3IgKGogPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGogPCBsZW47IGorKykge1xuICAgICAgICAgICAgYXJnc1tqIC0gMV0gPSBhcmd1bWVudHNbal07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGlzdGVuZXJzW2ldLmZuLmFwcGx5KGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhcmdzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogQWRkIGEgbGlzdGVuZXIgZm9yIGEgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8U3ltYm9sfSBldmVudCBUaGUgZXZlbnQgbmFtZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IFtjb250ZXh0PXRoaXNdIFRoZSBjb250ZXh0IHRvIGludm9rZSB0aGUgbGlzdGVuZXIgd2l0aC5cbiAqIEByZXR1cm5zIHtFdmVudEVtaXR0ZXJ9IGB0aGlzYC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiBvbihldmVudCwgZm4sIGNvbnRleHQpIHtcbiAgdmFyIGxpc3RlbmVyID0gbmV3IEVFKGZuLCBjb250ZXh0IHx8IHRoaXMpXG4gICAgLCBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHRoaXMuX2V2ZW50c1tldnRdID0gbGlzdGVuZXIsIHRoaXMuX2V2ZW50c0NvdW50Kys7XG4gIGVsc2UgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XS5mbikgdGhpcy5fZXZlbnRzW2V2dF0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2UgdGhpcy5fZXZlbnRzW2V2dF0gPSBbdGhpcy5fZXZlbnRzW2V2dF0sIGxpc3RlbmVyXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkIGEgb25lLXRpbWUgbGlzdGVuZXIgZm9yIGEgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8U3ltYm9sfSBldmVudCBUaGUgZXZlbnQgbmFtZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIFRoZSBsaXN0ZW5lciBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IFtjb250ZXh0PXRoaXNdIFRoZSBjb250ZXh0IHRvIGludm9rZSB0aGUgbGlzdGVuZXIgd2l0aC5cbiAqIEByZXR1cm5zIHtFdmVudEVtaXR0ZXJ9IGB0aGlzYC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UoZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzLCB0cnVlKVxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyLCB0aGlzLl9ldmVudHNDb3VudCsrO1xuICBlbHNlIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW3RoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lcl07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSB0aGUgbGlzdGVuZXJzIG9mIGEgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8U3ltYm9sfSBldmVudCBUaGUgZXZlbnQgbmFtZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIE9ubHkgcmVtb3ZlIHRoZSBsaXN0ZW5lcnMgdGhhdCBtYXRjaCB0aGlzIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBPbmx5IHJlbW92ZSB0aGUgbGlzdGVuZXJzIHRoYXQgaGF2ZSB0aGlzIGNvbnRleHQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSByZW1vdmUgb25lLXRpbWUgbGlzdGVuZXJzLlxuICogQHJldHVybnMge0V2ZW50RW1pdHRlcn0gYHRoaXNgLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGV2ZW50LCBmbiwgY29udGV4dCwgb25jZSkge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSByZXR1cm4gdGhpcztcbiAgaWYgKCFmbikge1xuICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKSB0aGlzLl9ldmVudHMgPSBuZXcgRXZlbnRzKCk7XG4gICAgZWxzZSBkZWxldGUgdGhpcy5fZXZlbnRzW2V2dF07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF07XG5cbiAgaWYgKGxpc3RlbmVycy5mbikge1xuICAgIGlmIChcbiAgICAgICAgIGxpc3RlbmVycy5mbiA9PT0gZm5cbiAgICAgICYmICghb25jZSB8fCBsaXN0ZW5lcnMub25jZSlcbiAgICAgICYmICghY29udGV4dCB8fCBsaXN0ZW5lcnMuY29udGV4dCA9PT0gY29udGV4dClcbiAgICApIHtcbiAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKSB0aGlzLl9ldmVudHMgPSBuZXcgRXZlbnRzKCk7XG4gICAgICBlbHNlIGRlbGV0ZSB0aGlzLl9ldmVudHNbZXZ0XTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGV2ZW50cyA9IFtdLCBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChcbiAgICAgICAgICAgbGlzdGVuZXJzW2ldLmZuICE9PSBmblxuICAgICAgICB8fCAob25jZSAmJiAhbGlzdGVuZXJzW2ldLm9uY2UpXG4gICAgICAgIHx8IChjb250ZXh0ICYmIGxpc3RlbmVyc1tpXS5jb250ZXh0ICE9PSBjb250ZXh0KVxuICAgICAgKSB7XG4gICAgICAgIGV2ZW50cy5wdXNoKGxpc3RlbmVyc1tpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy9cbiAgICAvLyBSZXNldCB0aGUgYXJyYXksIG9yIHJlbW92ZSBpdCBjb21wbGV0ZWx5IGlmIHdlIGhhdmUgbm8gbW9yZSBsaXN0ZW5lcnMuXG4gICAgLy9cbiAgICBpZiAoZXZlbnRzLmxlbmd0aCkgdGhpcy5fZXZlbnRzW2V2dF0gPSBldmVudHMubGVuZ3RoID09PSAxID8gZXZlbnRzWzBdIDogZXZlbnRzO1xuICAgIGVsc2UgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApIHRoaXMuX2V2ZW50cyA9IG5ldyBFdmVudHMoKTtcbiAgICBlbHNlIGRlbGV0ZSB0aGlzLl9ldmVudHNbZXZ0XTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgYWxsIGxpc3RlbmVycywgb3IgdGhvc2Ugb2YgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xTeW1ib2x9IFtldmVudF0gVGhlIGV2ZW50IG5hbWUuXG4gKiBAcmV0dXJucyB7RXZlbnRFbWl0dGVyfSBgdGhpc2AuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyhldmVudCkge1xuICB2YXIgZXZ0O1xuXG4gIGlmIChldmVudCkge1xuICAgIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG4gICAgaWYgKHRoaXMuX2V2ZW50c1tldnRdKSB7XG4gICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMCkgdGhpcy5fZXZlbnRzID0gbmV3IEV2ZW50cygpO1xuICAgICAgZWxzZSBkZWxldGUgdGhpcy5fZXZlbnRzW2V2dF07XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRoaXMuX2V2ZW50cyA9IG5ldyBFdmVudHMoKTtcbiAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBBbGlhcyBtZXRob2RzIG5hbWVzIGJlY2F1c2UgcGVvcGxlIHJvbGwgbGlrZSB0aGF0LlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xuXG4vL1xuLy8gVGhpcyBmdW5jdGlvbiBkb2Vzbid0IGFwcGx5IGFueW1vcmUuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMoKSB7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEV4cG9zZSB0aGUgcHJlZml4LlxuLy9cbkV2ZW50RW1pdHRlci5wcmVmaXhlZCA9IHByZWZpeDtcblxuLy9cbi8vIEFsbG93IGBFdmVudEVtaXR0ZXJgIHRvIGJlIGltcG9ydGVkIGFzIG1vZHVsZSBuYW1lc3BhY2UuXG4vL1xuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuLy9cbi8vIEV4cG9zZSB0aGUgbW9kdWxlLlxuLy9cbmlmICgndW5kZWZpbmVkJyAhPT0gdHlwZW9mIG1vZHVsZSkge1xuICBtb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcbn1cbiIsIi8qKlxuICogVGhlIGRpc3BhdGNoZXIgZm9yIHdlYm9zLlxuICogQG1vZHVsZSBjb3JlL2Rpc3BhdGNoZXJcbiAqL1xuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcblxuY29uc3QgbG9nID0gZGVidWcoJ2Rpc3BhdGNoZXI6bG9nJyk7XG4vLyBEaXNhYmxlIGxvZ2dpbmcgaW4gcHJvZHVjdGlvblxuaWYgKEVOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGRlYnVnLmVuYWJsZSgnKicpO1xufSBlbHNlIHtcbiAgZGVidWcuZGlzYWJsZSgpO1xufVxuXG5pbXBvcnQgRUUgZnJvbSAnZXZlbnRlbWl0dGVyMyc7XG5cbi8qKiBDbGFzcyByZXByZXNlbnRpbmcgYSBtYWluIGRpc3BhdGNoZXIgZm9yIHdlYm9zLlxuICogIEBleHRlbmRzIEV2ZW50RW1taXRlcjNcbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXNwYXRjaGVyIGV4dGVuZHMgRUUge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIGxvZygnRGlzcGF0Y2hlciBDcmVhdGUnKTtcbiAgfVxufSIsIi8qKlxuICogQ29sbGVjdGlvbiBmb3IgbWFrZSBkaWZmZXJlbnQgYXBwcyBjb2xsZWN0aW9uLlxuICogQG1vZHVsZSBjb3JlL2NvbGxlY3Rpb24vY29sbGVjdGlvblxuICogQHNlZSBtb2R1bGU6Y29yZS9hcHBzXG4gKi9cblxuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcblxuY29uc3QgbG9nID0gZGVidWcoJ2NvbGxlY3Rpb246bG9nJyk7XG5cbmlmIChFTlYgIT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGRlYnVnLmVuYWJsZSgpO1xufSBlbHNlIHtcbiAgZGVidWcuZGlzYWJsZSgpO1xufVxuXG4vKiogQ2xhc3MgQ29sbGVjdGlvbiByZXByZXNlbnRpbmcgYSBhcHBsaWNhdGlvbnMgY29sbGVjdGlvbi4gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29sbGVjdGlvbiB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBkaXNwYXRjaGVyIGFuZCBjb2xsZWN0aW9uKHR5cGUgQXJyYXkpXG4gICAqIEBwYXJhbSB7IERpc3BhdGNoZXIgfSBkaXNwYXRjaGVyIC0gVGhlIG1haW4gZGlzcGF0Y2hlci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGRpc3BhdGNoZXIpIHtcbiAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgIHRoaXMuY29sbGVjdGlvbiA9IFtdO1xuICAgIGxvZygnQ3JlYXRlIENvbGxlY3Rpb24nKTtcbiAgfVxuXG4gIC8qKiBcbiAgICogR2V0IGFwcGxpY2F0aW9uIGJ5IFVVSUQgZnJvbSAndGhpcy5jb2xsZWN0aW9uJ1xuICAgKiBAcGFyYW0geyBzdHJpbmcgfSB1dWlkIC0gYXBwbGljYXRpb24gdXVpZFxuICAgKiBAcmV0dXJuIHsgb2JqZWN0IH0gYXBwbGljYXRpb25cbiAgICovXG5cbiAgZ2V0QnlVdWlkKHV1aWQpIHtcbiAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uLmZpbmQoYXBwID0+IGFwcC5fX3V1aWQgPT0gdXVpZCk7XG4gIH1cblxuICAvKiogXG4gICAqIEdldCBhcHBsaWNhdGlvbiBieSBOQU1FIGZyb20gJ3RoaXMuY29sbGVjdGlvbidcbiAgICogQHBhcmFtIHsgc3RyaW5nIH0gbmFtZSAtIGFwcGxpY2F0aW9uIG5hbWVcbiAgICogQHJldHVybiB7IG9iamVjdCB9IGFwcGxpY2F0aW9uXG4gICAqL1xuXG4gIGdldEJ5TmFtZShuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maW5kKGFwcCA9PiBhcHAubmFtZSA9PSBuYW1lKTtcbiAgfVxuXG4gIC8qKiBcbiAgICogQWRkIGFwbGljYXRpb24gcHJveHkgaW4gJ3RoaXMuY29sbGVjdGlvbidcbiAgICogQHBhcmFtIHsgcHJveHkgb2JqZWN0IH0gcHJveHlcbiAgICovXG5cbiAgcHVzaChwcm94eSkge1xuICAgIGxldCBpc05vdFVuaXF1ZSA9IHRoaXMuZ2V0QnlVdWlkKHByb3h5Ll9fdXVpZCk7XG4gICAgaWYgKGlzTm90VW5pcXVlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0R1YmxpY2F0ZSBhcHBsaWNhdGlvbiB1dWlkJyk7XG4gICAgfVxuICAgIGlzTm90VW5pcXVlID0gdGhpcy5nZXRCeU5hbWUocHJveHkubmFtZSk7XG4gICAgaWYgKGlzTm90VW5pcXVlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0R1YmxpY2F0ZSBhcHBsaWNhdGlvbiBuYW1lJyk7XG4gICAgfVxuICAgIHRoaXMuY29sbGVjdGlvbi5wdXNoKHByb3h5KTtcbiAgfVxuXG4gIC8qKiBcbiAgICogUmVtb3ZlIGFwbGljYXRpb24gcHJveHkgZnJvbSAndGhpcy5jb2xsZWN0aW9uJ1xuICAgKiBAcGFyYW0geyBwcm94eSBvYmplY3QgfSBwcm94eVxuICAgKi9cblxuICByZW1vdmVGcm9tQ29sbGVjdGlvbihwcm94eSkge1xuICAgIGxldCBjdXJyZW50QXBwID0gdGhpcy5nZXRCeU5hbWUocHJveHkubmFtZSk7XG4gICAgdGhpcy5jb2xsZWN0aW9uLnNwbGljZSh0aGlzLmNvbGxlY3Rpb24uaW5kZXhPZihjdXJyZW50QXBwKSwgMSk7XG4gIH1cblxuICAvKiogXG4gICAqIFJlbW92ZSBhcGxpY2F0aW9uIHByb3h5IGZyb20gJ3RoaXMuY29sbGVjdGlvbidcbiAgICogYW5kIG1ha2UgZXZlbnQgJ3JlbW92ZTphcHA6ZnJvbTptYWluJyBmb3JcbiAgICogcmVtb3ZlIGFwcGxpY2F0aW9uIGZyb20gb3RoZXIgY29sbGVjdGlvbnMuXG4gICAqIEBwYXJhbSB7IHByb3h5IG9iamVjdCB9IHByb3h5XG4gICAqL1xuXG4gIHJlbW92ZShhcHApIHtcbiAgICB0aGlzLnJlbW92ZUZyb21Db2xsZWN0aW9uKGFwcCk7XG4gICAgdGhpcy5kaXNwYXRjaGVyLmVtaXQoJ3JlbW92ZTphcHA6ZnJvbTptYWluJywgYXBwKTtcbiAgfVxufSIsIi8qKlxuICogQ29sbGVjdGlvbiBmb3IgZGljayBBcHBzLlxuICogQG1vZHVsZSBjb3JlL2NvbGxlY3Rpb24vYWN0aXZlQXBwc1xuICogQHNlZSBtb2R1bGU6Y29yZS9hcHBzXG4gKi9cblxuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcblxuY29uc3QgbG9nID0gZGVidWcoJ2FwcDpsb2cnKTtcblxuaWYgKEVOViAhPSAncHJvZHVjdGlvbicpIHtcbiAgZGVidWcuZW5hYmxlKCk7XG59IGVsc2Uge1xuICBkZWJ1Zy5kaXNhYmxlKCk7XG59XG5cbmltcG9ydCBDb2xsZWN0aW9uIGZyb20gJy4vY29sbGVjdGlvbi5qcyc7XG5cbi8qKlxuICogQ2xhc3MgRG9ja0FwcHMgcmVwcmVzZW50aW5nIGEgYXBwbGljYXRpb25zIGNvbGxlY3Rpb24sIHRoYXQgbXVzdCBzaG93IGluIGRvY2sgcGFuZWwuXG4gKiBAZXh0ZW5kcyBDb2xsZWN0aW9uXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRG9ja0FwcHMgZXh0ZW5kcyBDb2xsZWN0aW9uIHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhIGRpc3BhdGNoZXJcbiAgICogQHBhcmFtIHsgRGlzcGF0Y2hlciB9IGRpc3BhdGNoZXIgLSBUaGUgbWFpbiBkaXNwYXRjaGVyLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZGlzcGF0Y2hlcikge1xuICAgIHN1cGVyKGRpc3BhdGNoZXIpO1xuICAgIHRoaXMucmVtb3ZlID0gdGhpcy5yZW1vdmVGcm9tQ29sbGVjdGlvbjtcbiAgICB0aGlzLmRpc3BhdGNoZXIub24oJ3JlbW92ZTphcHA6ZnJvbTptYWluJywgdGhpcy5yZW1vdmUsIHRoaXMpO1xuICAgIGxvZygnQ3JlYXRlIERvY2sgQXBwcyBDb2xsZWN0aW9uJyk7XG4gIH1cbiAgLyoqIFxuICAgKiBBZGQgYXBsaWNhdGlvbiBwcm94eSBpbiAndGhpcy5jb2xsZWN0aW9uJ1xuICAgKiBVc2Ugc3VwZXIucHVzaFxuICAgKiBBbmQgbWFrZSBldmVudCAnY3JlYXRlOmFwcDppbjpkb2NrJyBmb3Igc2hvdyBhcHBsaWNhdGlvbiBkb2NrIHBhbmVsXG4gICAqIEBwYXJhbSB7IHByb3h5IG9iamVjdCB9IHByb3h5XG4gICAqL1xuXG4gIHB1c2gocHJveHkpIHtcbiAgICBzdXBlci5wdXNoKHByb3h5KTtcblxuICAgIHRoaXMuZGlzcGF0Y2hlci5lbWl0KCdjcmVhdGU6YXBwOmluOmRvY2snLCB7XG4gICAgICBhcHA6IHRoaXMuZ2V0QnlOYW1lKHByb3h5Lm5hbWUpXG4gICAgfSk7XG4gIH1cbn0iLCIvKipcbiAqIENvbGxlY3Rpb24gZm9yIEFjdGl2ZSBBcHBzLlxuICogQG1vZHVsZSBjb3JlL2NvbGxlY3Rpb24vYWN0aXZlQXBwc1xuICogQHNlZSBtb2R1bGU6Y29yZS9hcHBzXG4gKi9cblxuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcblxuY29uc3QgbG9nID0gZGVidWcoJ2FjdGl2ZSBhcHBzOmxvZycpO1xuXG5pZiAoRU5WICE9ICdwcm9kdWN0aW9uJykge1xuICBkZWJ1Zy5lbmFibGUoKTtcbn0gZWxzZSB7XG4gIGRlYnVnLmRpc2FibGUoKTtcbn1cblxuaW1wb3J0IENvbGxlY3Rpb24gZnJvbSAnLi9jb2xsZWN0aW9uLmpzJztcblxuLyoqXG4gKiBDbGFzcyBBY3RpdmVBcHBzIHJlcHJlc2VudGluZyBhbiBhY3RpdmUgYXBwbGljYXRpb25zIGNvbGxlY3Rpb24uXG4gKiBAZXh0ZW5kcyBDb2xsZWN0aW9uXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWN0aXZlQXBwcyBleHRlbmRzIENvbGxlY3Rpb24ge1xuICAvKipcbiAgICogQ3JlYXRlIGEgZGlzcGF0Y2hlclxuICAgKiBAcGFyYW0geyBEaXNwYXRjaGVyIH0gZGlzcGF0Y2hlciAtIFRoZSBtYWluIGRpc3BhdGNoZXIuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihkaXNwYXRjaGVyKSB7XG4gICAgc3VwZXIoZGlzcGF0Y2hlcik7XG4gICAgdGhpcy5yZW1vdmUgPSB0aGlzLnJlbW92ZUZyb21Db2xsZWN0aW9uO1xuICAgIHRoaXMuZGlzcGF0Y2hlci5vbigncmVtb3ZlOmFwcDpmcm9tOm1haW4nLCB0aGlzLnJlbW92ZSwgdGhpcyk7XG4gICAgbG9nKCdDcmVhdGUgQWN0aXZlIEFwcHMgQ29sbGVjdGlvbicpO1xuICB9XG5cbiAgLyoqIFxuICAgKiBBZGQgYXBsaWNhdGlvbiBwcm94eSBpbiAndGhpcy5jb2xsZWN0aW9uJ1xuICAgKiBVc2Ugc3VwZXIucHVzaFxuICAgKiBBbmQgbWFrZSBldmVudCAnb3BlbjphcHAnXG4gICAqIEBwYXJhbSB7IHByb3h5IG9iamVjdCB9IHByb3h5XG4gICAqL1xuXG4gIHB1c2gocHJveHkpIHtcbiAgICBzdXBlci5wdXNoKHByb3h5KTtcblxuICAgIHRoaXMuZGlzcGF0Y2hlci5lbWl0KCdvcGVuOmFwcCcsIHtcbiAgICAgIGFwcDogcHJveHlcbiAgICB9KTtcbiAgfVxufSIsIi8qKlxuICogRGVmYXVsdCBoYW5kbGVyIGZvciBQcm94eWluZy5cbiAqIEBtb2R1bGUgbGlicy9hcHAucHJveHkuaGFuZGxlclxuICogQHNlZSBtb2R1bGU6bGlicy9wcm94eWluZ1xuICovXG5cbi8qKiBDbGFzcyByZXByZXNlbnRpbmcgYSBkZWZhdWx0IGhhbmRsZXIgZm9yIGFwcGxpY2F0aW9ucyBQcm94eWluZy4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwcFByb3h5SGFuZGxlciB7XG4gIC8qKlxuICAgKiBHZXR0ZXIuXG4gICAqIEByZXR1cm4geyBhbnkgfSB0YXJnZXRbcHJvcF0gLSBSZXR1cm4gdHJ1ZSB3aGVuIHRyeSB0byBnZXQgJ3V1aWQuXG4gICAqL1xuICBnZXQodGFyZ2V0LCBwcm9wKSB7XG4gICAgaWYgKHByb3AgPT0gJ19fdXVpZCcpIHtcbiAgICAgIHJldHVybiB0YXJnZXQudXVpZDtcbiAgICB9XG4gICAgaWYgKHByb3AgPT0gJ3V1aWQnKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldFtwcm9wXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXR0ZXIuXG4gICAqIEByZXR1cm4geyBhbnkgfSB2YWx1ZVxuICAgKi9cblxuICBzZXQodGFyZ2V0LCBwcm9wLCB2YWx1ZSkge1xuICAgIGlmIChwcm9wID09ICd1dWlkJyB8fCBwcm9wID09ICduYW1lJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgY2FuXFwndCBjaGFuZ2UgXFwndXVpZFxcJyBvciBcXCduYW1lXFwnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRhcmdldFtwcm9wXSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgZGVsZXRlUHJvcGVydHkodGFyZ2V0LCBwcm9wKSB7XG4gICAgaWYgKHByb3AgPT0gJ3V1aWQnIHx8IHByb3AgPT0gJ25hbWUnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBjYW5cXCd0IGRlbGV0ZSBcXCd1dWlkXFwnIG9yIFxcJ25hbWVcXCcnKTtcbiAgICB9XG4gIH1cbn0iLCIvKipcbiAqIE1vZHVsZSBmb3IgUHJveHlpbmcuXG4gKiBAbW9kdWxlIGxpYnMvcHJveHlpbmdcbiAqL1xuXG5pbXBvcnQgQXBwUHJveHlIYW5kbGVyIGZyb20gJy4vYXBwLnByb3h5LmhhbmRsZXIuanMnO1xuXG4vKipcbiAqIFdyYXAgb24gcHJveHkgb2JqZWN0LlxuICogQHBhcmFtIHsgb2JqZWN0IH0gYXBwIC0gVGhlIGFwcGxpY2F0aW9uIHdoaWNoIG11c3Qgd3JhcCBvbiBwcm94eSBvYmplY3QuXG4gKiBAcGFyYW0geyBPYmplY3QgfSBvcHRpb25zIC0gVGhlIG9wdGlvbnMgd2hpY2ggY2FuIGNvbnRhaW4gcHJveHkgaGFuZGxlci5cbiAqIEByZXR1cm4geyBQcm94eSBvYmplY3QgfSAtIFByb3h5IG9iamVjdCB3aXRoIGN1cnJlbnQgYXBwbGljYXRpb24gYW5kIGhhbmRsZXIgZnJvbVxuICogb3B0aW9ucyBvciBkZWZhdWx0IChAc2VlIG1vZHVsZTpsaWJzL2FwcC5wcm94eS5oYW5kbGVyKVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHByb3h5aW5nKGFwcCwgb3B0aW9ucykge1xuICBsZXQgaGFuZGxlcjtcbiAgaWYgKCFvcHRpb25zIHx8IChvcHRpb25zICYmICFvcHRpb25zLmhhbmRsZXIpKSB7XG4gICAgLy8gZGVmYXVsdCBoYW5kbGVyXG4gICAgaGFuZGxlciA9IG5ldyBBcHBQcm94eUhhbmRsZXI7XG4gIH0gZWxzZSBpZiAob3B0aW9ucy5oYW5kbGVyKSB7XG4gICAgaGFuZGxlciA9IE9iamVjdC5hc3NpZ24obmV3IEFwcFByb3h5SGFuZGxlciwgb3B0aW9ucy5oYW5kbGVyKTtcbiAgfVxuICByZXR1cm4gbmV3IFByb3h5KGFwcCwgaGFuZGxlcik7XG59XG4iLCIvKipcbiAqIFdlYm9zIEFwcGxpY2F0aW9uLlxuICogQG1vZHVsZSBjb3JlL2FwcFxuICogQHNlZSBtb2R1bGU6Y29yZS9pbml0XG4gKi9cblxuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcblxuY29uc3QgbG9nID0gZGVidWcoJ3dlYm9zLWFwcDpsb2cnKTtcblxuaWYgKEVOViAhPSAncHJvZHVjdGlvbicpIHtcbiAgZGVidWcuZW5hYmxlKCk7XG59IGVsc2Uge1xuICBkZWJ1Zy5kaXNhYmxlKCk7XG59XG5cbmltcG9ydCBwcm94eWluZyBmcm9tICcuLi9saWJzL3Byb3h5aW5nLmpzJztcblxuLyoqIENsYXNzIEFwcCByZXByZXNlbnRpbmcgYSB3ZWJvcyBhcHBsaWNhdGlvbi4gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBwIHtcbiAgLyoqXG4gICAqIFxuICAgKi9cbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIC8vIGZ1bmN0aW9uICdwcm94eWluZycgY2FuIGdldCBzZWNvbmQgYXJndW1lbnQgd2hpY2ggeW91ciBjdXN0b21cbiAgICAvLyBQcm94eSBoYW5kbGVyXG4gICAgLy8gVE9ETyA6OjogQ3JlYXRlIHJlc3RyaWN0aW5nIGxvZ2ljIGZvciBtYXJnZSBjdXN0b20gYW5kXG4gICAgLy8gZGVmYXVsdCBQcm94eSBoYW5kbGVyXG4gICAgLy8gPT4gc2VlIDo6OiAvbGlicy9wcm94eWluZy5qc1xuICAgIHRoaXMuYXBwID0gcHJveHlpbmcob3B0aW9ucywgbnVsbCk7XG4gICAgbG9nKCdDcmVhdGUgd2Vib3MgYXBwJyk7XG4gIH1cbn1cbiIsIi8qKlxuICogQ2FsY3VsYXRvciBBcHBsaWNhdGlvbnMuXG4gKiBAbW9kdWxlIGNvcmUvYXBwcy9jYWxjdWxhdG9yXG4gKiBAc2VlIG1vZHVsZTpjb3JlL2FwcHNcbiAqL1xuXG5pbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuXG5jb25zdCBsb2cgPSBkZWJ1ZygnY2FsY3VsYXRvci1hcHA6bG9nJyk7XG5cbmlmIChFTlYgIT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGRlYnVnLmVuYWJsZSgpO1xufSBlbHNlIHtcbiAgZGVidWcuZGlzYWJsZSgpO1xufVxuXG5pbXBvcnQgQXBwIGZyb20gJy4uL2NvcmUvYXBwLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2FsY3VsYXRvciBleHRlbmRzIEFwcCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKHtcbiAgICAgIG5hbWU6ICdDYWxjdWxhdG9yJyxcbiAgICAgIGRvY2tBcHA6IHRydWVcbiAgICB9KTtcbiAgfVxufSIsIi8qKlxuICogRGVmYXVsdCBBcHBsaWNhdGlvbnMuXG4gKiBAbW9kdWxlIGNvcmUvYXBwcy9kZWZhdWx0c1xuICogQHNlZSBtb2R1bGU6Y29yZS9hcHBzXG4gKi9cblxuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcblxuY29uc3QgbG9nID0gZGVidWcoJ2RlZmF1bHQtYXBwczpsb2cnKTtcblxuaWYgKEVOViAhPSAncHJvZHVjdGlvbicpIHtcbiAgZGVidWcuZW5hYmxlKCk7XG59IGVsc2Uge1xuICBkZWJ1Zy5kaXNhYmxlKCk7XG59XG5cbmltcG9ydCBDYWxjdWxhdG9yIGZyb20gJy4vY2FsY3VsYXRvci5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IFtcbiAgKG5ldyBDYWxjdWxhdG9yKS5hcHBcbl07XG4iLCIvKipcbiAqIEFwcGxpY2F0aW9ucyBDb2xsZWN0aW9uLlxuICogQG1vZHVsZSBjb3JlL2FwcHNcbiAqIEBzZWUgbW9kdWxlOmNvcmUvaW5pdFxuICovXG5cbmltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5cbmNvbnN0IGxvZyA9IGRlYnVnKCd3ZWJvcy1hcHBzOmxvZycpO1xuLy8gRGlzYWJsZSBsb2dnaW5nIGluIHByb2R1Y3Rpb25cbmlmIChFTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICBkZWJ1Zy5lbmFibGUoJyonKTtcbn0gZWxzZSB7XG4gIGRlYnVnLmRpc2FibGUoKTtcbn1cblxuaW1wb3J0IENvbGxlY3Rpb24gICAgIGZyb20gJy4vY29sbGVjdGlvbnMvY29sbGVjdGlvbi5qcyc7XG5cbmltcG9ydCBEb2NrQXBwcyAgICAgICBmcm9tICcuL2NvbGxlY3Rpb25zL2RvY2tBcHBzLmpzJztcblxuaW1wb3J0IEFjdGl2ZUFwcHMgICAgIGZyb20gJy4vY29sbGVjdGlvbnMvYWN0aXZlQXBwcy5qcyc7XG5cbmltcG9ydCBkZWZhdWx0QXBwcyAgICBmcm9tICcuLi9hcHBzL2RlZmF1bHRzLmpzJztcblxuLyoqIENsYXNzIEFwcHMgcmVwcmVzZW50aW5nIGEgd2Vib3MgYXBwbGljYXRpb25zIGNvbGxlY3Rpb24uICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwcHMge1xuICAvKipcbiAgICogQ3JlYXRlIGEgZGlzcGF0Y2hlciwgbmFtZSwgYWxsQXBwcywgYWN0aXZlQXBwcywgZG9ja0FwcHMgYW5kIGNhbGwgX2luc3RhbGxMaXN0ZW5lcnMuXG4gICAqIEBwYXJhbSB7IERpc3BhdGNoZXIgfSBkaXNwYXRjaGVyIC0gVGhlIG1haW4gZGlzcGF0Y2hlci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGRpc3BhdGNoZXIpIHtcbiAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgIHRoaXMubmFtZSAgICAgICA9ICd3ZWJvcy1hcHAtY29sbGVjdGlvbic7XG4gICAgdGhpcy5hbGxBcHBzICAgID0gbmV3IENvbGxlY3Rpb24odGhpcy5kaXNwYXRjaGVyKTtcbiAgICB0aGlzLmRvY2tBcHBzICAgPSBuZXcgRG9ja0FwcHModGhpcy5kaXNwYXRjaGVyKTtcbiAgICB0aGlzLmFjdGl2ZUFwcHMgPSBuZXcgQWN0aXZlQXBwcyh0aGlzLmRpc3BhdGNoZXIpO1xuICAgIHRoaXMuX2luc3RhbGxMaXN0ZW5lcnMoKTtcbiAgICBsb2coJ0NyZWF0ZSB3ZWJvcyBhcHBzJyk7XG4gIH1cbiAgLyoqXG4gICAqIFNldCB0aGUgbGlzdGVuZXJzLlxuICAgKi9cbiAgX2luc3RhbGxMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5kaXNwYXRjaGVyLm9uKCdhcHA6dG91Y2gnLCAgICAgICAgICAgICAgIHRoaXMudG91Y2hBcHAsICAgICB0aGlzKTtcbiAgICB0aGlzLmRpc3BhdGNoZXIub24oJ3JlYWR5OmNvbXBvbmVudDphcHBMaXN0JywgdGhpcy5yZWFkeUFwcExpc3QsIHRoaXMpO1xuICAgIHRoaXMuZGlzcGF0Y2hlci5vbignY2xvc2U6YXBwJywgICAgICAgICAgICAgICB0aGlzLmNsb3NlQXBwLCAgICAgdGhpcyk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBkZWZhdWx0IGFwcGxpY2F0aW9ucy5cbiAgICovXG4gIGluaXRpYWxpemVBcHBzKCkge1xuICAgIGRlZmF1bHRBcHBzLmZvckVhY2goYXBwID0+IHtcbiAgICAgIHRoaXMuYWxsQXBwcy5wdXNoKGFwcCk7XG5cbiAgICAgIC8vIGlmIGFwcGxpY2F0aW9uIGhhdmUgZG9ja0FwcCBmbGFnIGluICd0cnVlJ1xuICAgICAgLy8gdGhhdCBhcHBsaWNhdGlvbiBhZGQgdG8gZG9ja0FwcHMgY29sbGVjdGlvblxuICAgICAgLy8gYW5kIHdpbGwgc2hvdyBpbiAnZG9jaycgcGFuZWxcblxuICAgICAgaWYgKGFwcC5kb2NrQXBwKSB7XG4gICAgICAgIHRoaXMuZG9ja0FwcHMucHVzaChhcHApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFdoZW4gcmVhZHkgYXBwbGljYXRpb24gbGlzdCBjb21wb25lbnQgKGRvY2sgcGFuZWwpIFxuICAgKiBzZXQgdGhlIGRlZmF1bHQgYXBwbGljYXRpb25zLlxuICAgKi9cbiAgcmVhZHlBcHBMaXN0KCkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZUFwcHMoKTtcbiAgfVxuXG4gIC8qKiBcbiAgICogQ2FsbGVkIHdoZW4gdXNlciB0b3VjaCBhcHBsaWNhdGlvbiBpY29uXG4gICAqIEluIGFwcGxpY2F0aW9uIGxpc3QoZG9jaylcbiAgICogQHBhcmFtIHsgb2JqZWN0IH0gb3B0aW9uc1xuICAgKi8gIFxuXG4gIHRvdWNoQXBwKG9wdGlvbnMpIHtcbiAgICBsZXQgYXBwID0gdGhpcy5hbGxBcHBzLmdldEJ5TmFtZShvcHRpb25zLm5hbWUpO1xuICAgIGlmIChhcHApIHtcbiAgICAgIGlmICghdGhpcy5hY3RpdmVBcHBzLmdldEJ5TmFtZShhcHAubmFtZSkpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVBcHBzLnB1c2goYXBwKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bmtub3duIGFwcGxpY2F0aW9uJyk7XG4gICAgfVxuICB9XG5cbiAgY2xvc2VBcHAob3B0aW9ucykge1xuICAgIGxldCBhcHAgPSB0aGlzLmFsbEFwcHMuZ2V0QnlOYW1lKG9wdGlvbnMuYXBwLm5hbWUpO1xuICAgIGlmIChhcHApIHtcbiAgICAgIHRoaXMuYWN0aXZlQXBwcy5yZW1vdmUoYXBwLm5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gYXBwbGljYXRpb24nKTtcbiAgICB9XG4gIH1cbn0iLCIvKipcbiAqIE1vZHVsZSBmb3IgbWFrZSB3b3JrZXIgc291cmNlLlxuICogQG1vZHVsZSBsaWJzL3dvcmtlclNvdXJjZS5tYWtlclxuICogQHNlZSBtb2R1bGU6Y29yZS9wcm9jZXNzXG4gKi9cblxuLyoqIENsYXNzIHJlcHJlc2VudGluZyBhIHdvcmtlciBzb3VyY2UgbWFrZXIuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1ha2VXb3JrZXJTb3VyY2Uge1xuICAvKipcbiAgICogQ2hlY2sgb3B0aW9ucyBhbmQgY2FsbCAnd29ya2VyU291cmNlJyBtZXRob2QuXG4gICAqIEBwYXJhbSB7IG9iamVjdCB9IG9wdGlvbnMgLSBPcHRpb25zIGZvciB3b3JrZXIgYm9keS4gQ2FuIGNvbnRhaW4gd29ya2VyIGRlcGVuZGVuY3kgYW5kIGZuLlxuICAgKi9cblxuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICBpZiAob3B0aW9ucy5kZXBzKSB7XG4gICAgICB0aGlzLmRlcHMgPSBvcHRpb25zLmRlcHMuam9pbignLCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRlcHMgPSAnJztcbiAgICB9XG5cbiAgICB0aGlzLmRlcHMgPSBcIlxcJ1wiICsgdGhpcy5kZXBzICsgXCJcXCdcIjtcbiAgICB0aGlzLndvcmtlclNvdXJjZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ha2Ugd29ya2VyIHNvdXJjZS5cbiAgICogQHJldHVybiB7IEZ1bmN0aW9uIH1cbiAgICovXG5cbiAgd29ya2VyU291cmNlKCkge1xuICAgIC8vIFRPRE8gOjo6IE9wdGltaXplIHRoaXMgY2FzZVxuICAgIHJldHVybiBGdW5jdGlvbihcbiAgICAgIGBcbiAgICAgIGltcG9ydFNjcmlwdHMoJHt0aGlzLmRlcHN9KTtcbiAgICAgIGxldCBmbiA9ICR7dGhpcy5vcHRpb25zLmZufTtcbiAgICAgIGZuKCk7XG4gICAgICBgXG4gICAgKTtcbiAgfVxufSIsIi8qKlxuICogVGhlIHByb2Nlc3MgZm9yIHdlYm9zLlxuICogQG1vZHVsZSBjb3JlL3Byb2Nlc3NcbiAqL1xuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcblxuaW1wb3J0IE1ha2VXb3JrZXJTb3VyY2UgZnJvbSAnLi4vbGlicy93b3JrZXJTb3VyY2UubWFrZXIuanMnO1xuXG5jb25zdCBsb2cgPSBkZWJ1ZygncHJvY2Vzczpsb2cnKTtcbi8vIERpc2FibGUgbG9nZ2luZyBpbiBwcm9kdWN0aW9uXG5pZiAoRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgZGVidWcuZW5hYmxlKCcqJyk7XG59IGVsc2Uge1xuICBkZWJ1Zy5kaXNhYmxlKCk7XG59XG5cbi8qKiBDbGFzcyByZXByZXNlbnRpbmcgYSBwcm9jZXNzIGZvciB3ZWJvcy4gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHJvY2VzcyB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBkaXNwYXRjaGVyLCBwcm9jZXNzZXMgYW5kIF9pbnN0YWxsTGlzdGVuZXJzLlxuICAgKiBAcGFyYW0geyBEaXNwYXRjaGVyIH0gZGlzcGF0Y2hlciAtIFRoZSBtYWluIGRpc3BhdGNoZXIuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihkaXNwYXRjaGVyKSB7XG4gICAgdGhpcy5kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcbiAgICB0aGlzLnByb2Nlc3NlcyA9IFtdO1xuICAgIGxvZygncnVuIFByb2Nlc3MgY2xhc3MnKTtcbiAgICB0aGlzLl9pbnN0YWxsTGlzdGVuZXJzKCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBsaXN0ZW5lcnMuXG4gICAqL1xuXG4gIF9pbnN0YWxsTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZGlzcGF0Y2hlci5vbignY3JlYXRlOm5ldzpwcm9jZXNzJywgdGhpcy5uZXdQcm9jZXNzLCB0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXRob2QgZm9yIGNyZWF0ZSBuZXcgcHJvY2VzcyBpbiB3ZWJvcy5cbiAgICogQHBhcmFtIHsgb2JqZWN0IH0gcHJvY2Vzc0JvZHkgLSBQcm9jZXNzIGJvZHkgY2FuIGNvbnRhaW4gcHJvY2VzcyBkZXBlbmRlbmNpZXMgYW5kIGZuXG4gICAqIEBwYXJhbSB7IG9iamVjdCB9IG9wdGlvbnMgLSBvcHRpb25zIGNhbiBjb250YWluIG9ubWVzc2FnZSBhbmQgb25lcnJvciBjYWxsYmFja3MgYW5kIHRlcm1pbmF0ZSBmbGFnXG4gICAqIEByZXR1cm4geyB3b3JrZXIgb2JqZWN0IH0gd29ya2VyIC0gcmV0dXJuICdydW5Xb3JrZXInIG1ldGhvZCB3aXRoICdwcm9jZXNzQm9keSwgb3B0aW9ucywgdHJ1ZSdcbiAgICogVGhlIDN0aCBwYXJhbSBpbiAncnVuV29ya2VyJyBtZXRob2QgaXMgcHJvbWlzaWZ5IGZsYWcuIERpZmZlcmVudCBiZXR3ZWVuICdjcmVhdGUnIGFuZCAnbmV3UHJvY2VzcydcbiAgICogaXMgdGhlaXJzIHJldHVybmVkIHZhbHVlLiBOT1RF1okgJ25ld1Byb2Nlc3MnIG1ldGhvZCBub3RoaW5nIHJldHVybmVkLiBcbiAgICovXG5cbiAgY3JlYXRlKHByb2Nlc3NCb2R5LCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMucnVuV29ya2VyKHByb2Nlc3NCb2R5LCBvcHRpb25zLCB0cnVlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXRob2QgZm9yIGNyZWF0ZSBuZXcgcHJvY2VzcyBpbiB3ZWJvcy5cbiAgICogQHBhcmFtIHsgb2JqZWN0IH0gcHJvY2Vzc0JvZHkgLSBQcm9jZXNzIGJvZHkgY2FuIGNvbnRhaW4gcHJvY2VzcyBkZXBlbmRlbmNpZXMgYW5kIGZuXG4gICAqIEBwYXJhbSB7IG9iamVjdCB9IG9wdGlvbnMgLSBvcHRpb25zIGNhbiBjb250YWluIG9ubWVzc2FnZSBhbmQgb25lcnJvciBjYWxsYmFja3MgYW5kIHRlcm1pbmF0ZSBmbGFnXG4gICAqL1xuXG4gIG5ld1Byb2Nlc3MocHJvY2Vzc0JvZHksIG9wdGlvbnMpIHtcbiAgICB0aGlzLnJ1bldvcmtlcihwcm9jZXNzQm9keSwgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogTWV0aG9kIGZvciBjcmVhdGUgbmV3IHByb2Nlc3MgaW4gd2Vib3MuXG4gICAqIEBwYXJhbSB7IG9iamVjdCB9IHByb2Nlc3NCb2R5IC0gUHJvY2VzcyBib2R5IGNhbiBjb250YWluIHByb2Nlc3MgZGVwZW5kZW5jaWVzIGFuZCBmblxuICAgKiBAcGFyYW0geyBvYmplY3QgfSBvcHRpb25zIC0gb3B0aW9ucyBjYW4gY29udGFpbiBvbm1lc3NhZ2UgYW5kIG9uZXJyb3IgY2FsbGJhY2tzIGFuZCB0ZXJtaW5hdGUgZmxhZ1xuICAgKi9cblxuICBydW5Xb3JrZXIocHJvY2Vzc0JvZHksIG9wdGlvbnMsIHByb21pc2lmeSkge1xuICAgIGxldCB3b3JrZXI7XG4gICAgaWYgKCFwcm9jZXNzQm9keSB8fCAocHJvY2Vzc0JvZHkgJiYgIXByb2Nlc3NCb2R5LmZuKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYFxuICAgICAgICBXaXRoICdjcmVhdGU6bmV3OnByb2Nlc3MnIGV2ZW50IHlvdSBzaG91bGQgc2VuZCBwcm9jZXNzQm9keVxuICAgICAgICBleC5cbiAgICAgICAgLi4uZGlzcGF0Y2hlci5lbWl0KFxuICAgICAgICAgICAgJ2NyZWF0ZTpuZXc6cHJvY2VzcycsIC8vIG9yIHdlYk9zLnByb2Nlc3MuY3JlYXRlKC4uLik7XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGRlcHM6IEFycmF5IDo6OiAob3B0aW9uYWwpIDo6OiBJbiB0aGlzIGNhc2UgeW91IHNob3VsZCB3cml0ZSBhbGwgZGVwZW5kZW5jeSBwYXRocyxcbiAgICAgICAgICAgICAgZm46IEZ1bmN0aW9uIDo6OiAocmVxdWlyZXMpIDo6OiBJdCBpcyB0aGlzIGZ1bmN0aW9uIHdpdGNoIHdpbGwgcnVuIGluIG5ldyBwcm9jZXNzICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgb25tZXNzYWdlOiBGdW5jdGlvbiA6OjogKG9wdGlvbmFsKSA6OjogSXQgaXMgd29ya2VyIG9ubWVzc2FnZSBjYWxsYmFjayxcbiAgICAgICAgICAgICAgb25lcnJvcjogRnVuY3Rpb24gOjo6IChvcHRpb25hbCkgOjo6IGl0IGlzIHdvcmtlciBvbmVycm9yIGNhbGxiYWNrLFxuICAgICAgICAgICAgICB0ZXJtaW5hdGU6IEJvb2xlYW4gOjo6IChvcHRpb25hbCkgOjo6IGRlZmF1bHQgPT4gZmFsc2UgOjo6IElmIHRoaXMgZmxhZyBpcyB0cnVlIGFuZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlvdSBoYXZlIG9ubWVzc2FnZSB0aGVuIGFmdGVyIHByb2Nlc3Mgam9iIGl0IHdpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZSB0ZXJtaW5hdGVkLCBidXQgd2hlbiB5b3UgaGF2bid0IG9ubWVzc2FnZSBhbmQgd2FudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlcm1pbmF0ZSBwcm9jZXNzIHlvdSBjYW4ga2lsbCBpdCB5b3Vyc2VsZiBpbiBmblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrIDopXG4gICAgICAgICAgICB9XG4gICAgICAgICAgKVxuICAgICAgYCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgcHJvY2Vzc0JvZHkuZm4gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJ2ZuJyBpbiBuZXcgcHJvY2VzcyBzaG91bGQgYmUgRnVuY3Rpb25gKTtcbiAgICB9IGVsc2UgaWYgKHByb2Nlc3NCb2R5LmRlcHMgJiYgIUFycmF5LmlzQXJyYXkocHJvY2Vzc0JvZHkuZGVwcykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgJ2RlcHMnIGluIG5ldyBwcm9jZXNzIHNob3VsZCBiZSBBcnJheWApO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgd29ya2VyU291cmNlID0gbmV3IE1ha2VXb3JrZXJTb3VyY2UocHJvY2Vzc0JvZHkpLndvcmtlclNvdXJjZSgpO1xuXG4gICAgICBsZXQgY29kZSA9IHdvcmtlclNvdXJjZS50b1N0cmluZygpO1xuXG4gICAgICBjb2RlID0gY29kZS5zdWJzdHJpbmcoY29kZS5pbmRleE9mKCd7JykgKyAxLCBjb2RlLmxhc3RJbmRleE9mKCd9JykpO1xuXG4gICAgICBsZXQgYmxvYiA9IG5ldyBCbG9iKFtjb2RlXSwge3R5cGU6ICdhcHBsaWNhdGlvbi9qYXZhc2NyaXB0J30pO1xuICAgICAgd29ya2VyID0gbmV3IFdvcmtlcihVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpKTtcbiAgICAgIC8vIGNyZWF0ZSBpbiBwcm9jZXNzZXNcbiAgICAgIHRoaXMucHJvY2Vzc2VzLnB1c2god29ya2VyKTtcblxuICAgICAgaWYgKG9wdGlvbnMub25tZXNzYWdlKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5vbm1lc3NhZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBpZiAob3B0aW9ucy50ZXJtaW5hdGUpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy50ZXJtaW5hdGUgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgICB3b3JrZXIub25tZXNzYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5vbm1lc3NhZ2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB3b3JrZXIudGVybWluYXRlKCk7XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCd0ZXJtaW5hdGUnIGluIG5ldyBwcm9jZXNzIHNob3VsZCBiZSBCb29sZWFuYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdvcmtlci5vbm1lc3NhZ2UgPSBvcHRpb25zLm9ubWVzc2FnZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnb25tZXNzYWdlJyBpbiBuZXcgcHJvY2VzcyBzaG91bGQgYmUgRnVuY3Rpb25gKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAob3B0aW9ucy5vbmVycm9yKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5vbmVycm9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgd29ya2VyLm9uZXJyb3IgPSBvcHRpb25zLm9uZXJyb3I7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGAnb25lcnJvcicgaW4gbmV3IHByb2Nlc3Mgc2hvdWxkIGJlIEZ1bmN0aW9uYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocHJvbWlzaWZ5ICYmIHdvcmtlcikge1xuICAgICAgcmV0dXJuIHdvcmtlcjtcbiAgICB9XG4gIH1cbn0iLCIvKipcbiAqIE1haW4gY29yZSBtb2R1bGUuXG4gKiBAbW9kdWxlIGNvcmUvaW5pdFxuICovXG5pbXBvcnQgRGlzcGF0Y2hlciBmcm9tICcuL2Rpc3BhdGNoZXIuanMnO1xuXG5pbXBvcnQgQXBwcyBmcm9tICcuL2FwcHMuanMnO1xuXG5pbXBvcnQgUHJvY2VzcyBmcm9tICcuL3Byb2Nlc3MnO1xuXG5sZXQgd2ViT3MgPSB7fTtcblxud2ViT3MuZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyO1xuXG53ZWJPcy5hcHBzID0gbmV3IEFwcHMod2ViT3MuZGlzcGF0Y2hlcik7XG5cbndlYk9zLnByb2Nlc3MgPSBuZXcgUHJvY2Vzcyh3ZWJPcy5kaXNwYXRjaGVyKTtcblxuT2JqZWN0LmZyZWV6ZSh3ZWJPcyk7XG5cbmV4cG9ydCBkZWZhdWx0IHdlYk9zOyIsIi8vIEFkZCBhIGRlYnVnZ2VyXG5pbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuXG5jb25zdCBsb2cgPSBkZWJ1ZygnYXBwOmxvZycpO1xuLy8gRGlzYWJsZSBsb2dnaW5nIGluIHByb2R1Y3Rpb25cbmlmIChFTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICBkZWJ1Zy5lbmFibGUoJyonKTtcblxuICAvLyBGb3IgbGl2ZSByZWxvYWRcbiAgZG9jdW1lbnQud3JpdGUoJzxzY3JpcHQgc3JjPVwiaHR0cDovLycgKyAobG9jYXRpb24uaG9zdCB8fCAnbG9jYWxob3N0Jykuc3BsaXQoJzonKVswXSArXG4gICc6MzU3MjkvbGl2ZXJlbG9hZC5qcz9zbmlwdmVyPTFcIj48LycgKyAnc2NyaXB0PicpO1xufSBlbHNlIHtcbiAgZGVidWcuZGlzYWJsZSgpO1xufVxuXG5sb2coJzo6OiBBcHAgU3RhcnQgOjo6Jyk7XG5cbmltcG9ydCB3ZWJPcyBmcm9tICcuL2NvcmUvaW5pdCc7XG5cbndpbmRvdy53ZWJPcyA9IHdlYk9zO1xuXG4vLyBJbXBvcnQgc3R5bGVzXG5pbXBvcnQgJy4uL2Nzcy9tYWluLmNzcyc7XG5cbi8vIHRlc3QgZm9yIGNyZWF0ZSBhcHBsaWNhdGlvblxuLy8gd2ViT3MuZGlzcGF0Y2hlci5lbWl0KCdjcmVhdGU6bmV3OmFwcCcsIHtcbi8vICAgYXBwOiB7XG4vLyAgICAgbmFtZTogJ3dlYm9zLXRlcm1pbmFsJyxcbi8vICAgICB1dWlkOiAnMjJlMWQnXG4vLyAgIH1cbi8vIH0pO1xuXG4vLyB0ZXN0IGZvciBjcmVhdGUgYXBwbGljYXRpb25cbi8vIHdlYk9zLmRpc3BhdGNoZXIuZW1pdCgnY3JlYXRlOm5ldzphcHAnLCB7XG4vLyAgIGFwcDoge1xuLy8gICAgIG5hbWU6ICd3ZWJvcy10ZXJtaW5hbC1mYWNlJyxcbi8vICAgICB1dWlkOiAnMzFxd2EnLFxuLy8gICAgIC8vIHRlc3Rcbi8vICAgICBwcm9jZXNzOiB7XG4vLyAgICAgICBuZXc6IHRydWUsXG4vLyAgICAgICAvLyAuLi4uXG4vLyAgICAgfVxuLy8gICB9XG4vLyB9KTtcblxuLy8gdGVzdCBmb3IgcmVtb3ZlIGFwcGxpY2F0aW9uXG4vLyB3ZWJPcy5hcHBzLnJlbW92ZUFwcCh7XG4vLyAgIGFwcDoge1xuLy8gICAgIHV1aWQ6ICcyMmUxZCdcbi8vICAgfVxuLy8gfSk7XG5cbi8vIHRlc3QgZm9yIGNyZWF0ZSBuZXcgcHJvY2VzcyB3aXRoIGRlcGVuZGVjaWVzLFxuLy8gZnVjbnRpb24gYW5kIG9ubWVzc2FnZSBjYWxsYmFjay5cbi8vIGZvciAuLi5kaXNwYXRjaGVyLmVtaXQoJ2NyZWF0ZTpuZXc6cHJvY2VzcycsIC4uLikgXG53ZWJPcy5kaXNwYXRjaGVyLmVtaXQoXG4gICdjcmVhdGU6bmV3OnByb2Nlc3MnLFxuICAvLyBwcm9jZXNzIGJvZHlcbiAge1xuICAgIGRlcHM6IFsnaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvdW5kZXJzY29yZS5qcy8xLjguMy91bmRlcnNjb3JlLW1pbi5qcyddLFxuICAgIGZuOiAoKSA9PiB7XG4gICAgICBsZXQgYXJyID0gW107XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwMDAwMDA7IGkrKykge1xuICAgICAgICBhcnIucHVzaChpKTtcbiAgICAgIH1cbiAgICAgIGxldCBvZGRzID0gXy5maWx0ZXIoYXJyLCAoaXRlbSkgPT4ge1xuICAgICAgICBpZiAoaXRlbSAlIDIgIT0gMCkge1xuICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcG9zdE1lc3NhZ2Uoe29kZHM6IG9kZHN9KTtcblxuICAgICAgLy8gdGhpcyBleGFtcGxlIGZvciBpbXBsZW1lbnRhdGlvbiBwcm9jZXNzIHdvcmsgZnJvbSBkZXZ0b29scyBieSB3ZWJPcy5wcm9jZXNzLnF1ZXVlXG4gICAgICAvLyBmb3IgcmVwcm9kdWNlIHRoaXMgd3JpdGUgdGhpcyBsaW5lIGluIGRldnRvb2xzXG4gICAgICAvLyB3ZWJPcy5wcm9jZXNzLnF1ZXVlWzBdLnBvc3RNZXNzYWdlKFsxLCAyLCAzLCA0XSk7XG4gICAgICAvLyBOT1RFINaJ1onWiSBQbGVhc2UgYmUgYXR0ZW50aXZlIGl0IHdpbGwgYmUgd29yayB3aGVuIHRlcm1pbmF0ZSBmbGFnIGlzIGZhbHNlIFxuXG4gICAgICBvbm1lc3NhZ2UgPSAoZSkgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0ID0gXy5maWx0ZXIoZS5kYXRhLCAoaXRlbSkgPT4ge1xuICAgICAgICAgIGlmIChpdGVtICUgMiA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHBvc3RNZXNzYWdlKHtldmVuczogcmVzdWx0fSk7XG4gICAgICB9O1xuICAgIH1cbiAgfSxcbiAgLy8gb3B0aW9uc1xuICB7XG4gICAgLy8gb25tZXNzYWdlXG4gICAgb25tZXNzYWdlKGUpIHtcbiAgICAgIGxvZygnRnJvbSBhbm90aGVyIHByb2Nlc3MgOjo6ICcsIGUuZGF0YSk7XG4gICAgfSxcbiAgICAvLyBvbmVycm9yXG4gICAgb25lcnJvcihlcnIpIHtcbiAgICAgIGxvZygnRnJvbSBhbm90aGVyIHByb2Nlc3MgOjo6ICcsIGVycik7XG4gICAgfSxcblxuICAgIHRlcm1pbmF0ZTogZmFsc2VcbiAgfVxuKTtcblxuLy8gdGVzdCBmb3IgY3JlYXRlIG5ldyBwcm9jZXNzIHdpdGggZGVwZW5kZWNpZXMsXG4vLyBmdWNudGlvbiBhbmQgb25tZXNzYWdlIGNhbGxiYWNrLlxuLy8gZm9yIHdlYk9zLnByb2Nlc3MuY3JlYXRlKC4uLilcbndlYk9zLnByb2Nlc3MuY3JlYXRlKFxuICAvLyBwcm9jZXNzIGJvZHlcbiAge1xuICAgIGRlcHM6IFsnaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvdW5kZXJzY29yZS5qcy8xLjguMy91bmRlcnNjb3JlLW1pbi5qcyddLFxuICAgIGZuOiAoKSA9PiB7XG4gICAgICBsZXQgYXJyID0gW107XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDEwMDAwMDA7IGkrKykge1xuICAgICAgICBhcnIucHVzaChpKTtcbiAgICAgIH1cbiAgICAgIGxldCBvZGRzID0gXy5maWx0ZXIoYXJyLCAoaXRlbSkgPT4ge1xuICAgICAgICBpZiAoaXRlbSAlIDIgIT0gMCkge1xuICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcG9zdE1lc3NhZ2Uoe29kZHM6IG9kZHN9KTtcblxuICAgICAgLy8gdGhpcyBleGFtcGxlIGZvciBpbXBsZW1lbnRhdGlvbiBwcm9jZXNzIHdvcmsgZnJvbSBkZXZ0b29scyBieSB3ZWJPcy5wcm9jZXNzLnF1ZXVlXG4gICAgICAvLyBmb3IgcmVwcm9kdWNlIHRoaXMgd3JpdGUgdGhpcyBsaW5lIGluIGRldnRvb2xzXG4gICAgICAvLyB3ZWJPcy5wcm9jZXNzLnF1ZXVlWzBdLnBvc3RNZXNzYWdlKFsxLCAyLCAzLCA0XSk7XG4gICAgICAvLyBOT1RFINaJ1onWiSBQbGVhc2UgYmUgYXR0ZW50aXZlIGl0IHdpbGwgYmUgd29yayB3aGVuIHRlcm1pbmF0ZSBmbGFnIGlzIGZhbHNlIFxuXG4gICAgICBvbm1lc3NhZ2UgPSAoZSkgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0ID0gXy5maWx0ZXIoZS5kYXRhLCAoaXRlbSkgPT4ge1xuICAgICAgICAgIGlmIChpdGVtICUgMiA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHBvc3RNZXNzYWdlKHtldmVuczogcmVzdWx0fSk7XG4gICAgICB9O1xuICAgIH1cbiAgfSxcbiAgLy8gb3B0aW9uc1xuICB7XG4gICAgLy8gb25tZXNzYWdlXG4gICAgb25tZXNzYWdlKGUpIHtcbiAgICAgIGxvZygnRnJvbSBhbm90aGVyIHByb2Nlc3MgOjo6ICcsIGUuZGF0YSk7XG4gICAgfSxcbiAgICAvLyBvbmVycm9yXG4gICAgb25lcnJvcihlcnIpIHtcbiAgICAgIGxvZygnRnJvbSBhbm90aGVyIHByb2Nlc3MgOjo6ICcsIGVycik7XG4gICAgfSxcblxuICAgIHRlcm1pbmF0ZTogZmFsc2VcbiAgfVxuKTtcblxuLy8gQ3JlYXRlIG1haW4gd29ya2Vyc1xuLy8gLi4uXG5cbi8vIFRlc3QgZm9yIG5ldyBhcHBsaWNhdGlvbiB3aXRoIGFub3RoZXIgcHJvY2VzcyBjYWxjIGxvZ2ljXG4vLyAuLi4iXSwibmFtZXMiOlsicmVxdWlyZSQkMCIsImluZGV4IiwibG9nIiwiZGVidWciLCJFRSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFJQSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUE7QUFDWixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO0FBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQUNkLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7QUFDZCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JsQixTQUFjLEdBQUcsVUFBVSxHQUFHLEVBQUUsT0FBTyxFQUFFO0VBQ3ZDLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFBO0VBQ3ZCLElBQUksSUFBSSxHQUFHLE9BQU8sR0FBRyxDQUFBO0VBQ3JCLElBQUksSUFBSSxLQUFLLFFBQVEsSUFBSSxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtJQUN2QyxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUM7R0FDbEIsTUFBTSxJQUFJLElBQUksS0FBSyxRQUFRLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssRUFBRTtJQUNwRCxPQUFPLE9BQU8sQ0FBQyxJQUFJO0dBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUM7R0FDWixRQUFRLENBQUMsR0FBRyxDQUFDO0dBQ2I7RUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLHVEQUF1RCxHQUFHLElBQUksQ0FBQyxT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TyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7S0FDL0U7O0lBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtNQUNsRCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1Qjs7SUFFRCxTQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQzdDLE1BQU07SUFDTCxJQUFJLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTTtRQUN6QixDQUFDLENBQUM7O0lBRU4sS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7TUFDM0IsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOztNQUVwRixRQUFRLEdBQUc7UUFDVCxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNO1FBQzFELEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNO1FBQzlELEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTTtRQUNsRSxLQUFLLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNO1FBQ3RFO1VBQ0UsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdELElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1dBQzVCOztVQUVELFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7T0FDckQ7S0FDRjtHQUNGOztFQUVELE9BQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQzs7Ozs7Ozs7Ozs7QUFXRixZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxTQUFTLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRTtFQUMxRCxJQUFJLFFBQVEsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxJQUFJLElBQUksQ0FBQztNQUN0QyxHQUFHLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDOztFQUUxQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7T0FDckUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQzVELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDOztFQUV2RCxPQUFPLElBQUksQ0FBQztDQUNiLENBQUM7Ozs7Ozs7Ozs7O0FBV0YsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUU7RUFDOUQsSUFBSSxRQUFRLEdBQUcsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sSUFBSSxJQUFJLEVBQUUsSUFBSSxDQUFDO01BQzVDLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7O0VBRTFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztPQUNyRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDNUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7O0VBRXZELE9B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
