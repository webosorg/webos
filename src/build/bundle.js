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
      dockApp: true,
      componentPath: '/components/webos-components/webos-calculator/t.html',
      elemName: 'webos-calculator'
    });
  }
}

/**
 * Terminal Applications.
 * @module core/apps/terminal
 * @see module:core/apps
 */

const log$9 = browser$1('calculator-app:log');

{
  browser$1.enable();
}

class Terminal extends App {
  constructor() {
    super({
      name: 'Terminal',
      dockApp: true,
      uuid: '78',
      componentPath: '/components/webos-components/webos-terminal/t.html',
      elemName: 'webos-terminal'
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
  (new Calculator).app,
  (new Terminal).app
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
const log$10 = browser$1('process:log');
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
    log$10('run Process class');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi8uLi9ub2RlX21vZHVsZXMvbXMvaW5kZXguanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZGVidWcvc3JjL2RlYnVnLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2RlYnVnL3NyYy9icm93c2VyLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL2V2ZW50ZW1pdHRlcjMvaW5kZXguanMiLCIuLi9qcy9jb3JlL2Rpc3BhdGNoZXIuanMiLCIuLi9qcy9jb3JlL2NvbGxlY3Rpb25zL2NvbGxlY3Rpb24uanMiLCIuLi9qcy9jb3JlL2NvbGxlY3Rpb25zL2RvY2tBcHBzLmpzIiwiLi4vanMvY29yZS9jb2xsZWN0aW9ucy9hY3RpdmVBcHBzLmpzIiwiLi4vanMvbGlicy9hcHAucHJveHkuaGFuZGxlci5qcyIsIi4uL2pzL2xpYnMvcHJveHlpbmcuanMiLCIuLi9qcy9jb3JlL2FwcC5qcyIsIi4uL2pzL2FwcHMvY2FsY3VsYXRvci5qcyIsIi4uL2pzL2FwcHMvdGVybWluYWwuanMiLCIuLi9qcy9hcHBzL2RlZmF1bHRzLmpzIiwiLi4vanMvY29yZS9hcHBzLmpzIiwiLi4vanMvbGlicy93b3JrZXJTb3VyY2UubWFrZXIuanMiLCIuLi9qcy9jb3JlL3Byb2Nlc3MuanMiLCIuLi9qcy9jb3JlL2luaXQuanMiLCIuLi9qcy9tYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogSGVscGVycy5cbiAqL1xuXG52YXIgcyA9IDEwMDBcbnZhciBtID0gcyAqIDYwXG52YXIgaCA9IG0gKiA2MFxudmFyIGQgPSBoICogMjRcbnZhciB5ID0gZCAqIDM2NS4yNVxuXG4vKipcbiAqIFBhcnNlIG9yIGZvcm1hdCB0aGUgZ2l2ZW4gYHZhbGAuXG4gKlxuICogT3B0aW9uczpcbiAqXG4gKiAgLSBgbG9uZ2AgdmVyYm9zZSBmb3JtYXR0aW5nIFtmYWxzZV1cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IHZhbFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEB0aHJvd3Mge0Vycm9yfSB0aHJvdyBhbiBlcnJvciBpZiB2YWwgaXMgbm90IGEgbm9uLWVtcHR5IHN0cmluZyBvciBhIG51bWJlclxuICogQHJldHVybiB7U3RyaW5nfE51bWJlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodmFsLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbFxuICBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgdmFsLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gcGFyc2UodmFsKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInICYmIGlzTmFOKHZhbCkgPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMubG9uZyA/XG5cdFx0XHRmbXRMb25nKHZhbCkgOlxuXHRcdFx0Zm10U2hvcnQodmFsKVxuICB9XG4gIHRocm93IG5ldyBFcnJvcigndmFsIGlzIG5vdCBhIG5vbi1lbXB0eSBzdHJpbmcgb3IgYSB2YWxpZCBudW1iZXIuIHZhbD0nICsgSlNPTi5zdHJpbmdpZnkodmFsKSlcbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYHN0cmAgYW5kIHJldHVybiBtaWxsaXNlY29uZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2Uoc3RyKSB7XG4gIHN0ciA9IFN0cmluZyhzdHIpXG4gIGlmIChzdHIubGVuZ3RoID4gMTAwMDApIHtcbiAgICByZXR1cm5cbiAgfVxuICB2YXIgbWF0Y2ggPSAvXigoPzpcXGQrKT9cXC4/XFxkKykgKihtaWxsaXNlY29uZHM/fG1zZWNzP3xtc3xzZWNvbmRzP3xzZWNzP3xzfG1pbnV0ZXM/fG1pbnM/fG18aG91cnM/fGhycz98aHxkYXlzP3xkfHllYXJzP3x5cnM/fHkpPyQvaS5leGVjKHN0cilcbiAgaWYgKCFtYXRjaCkge1xuICAgIHJldHVyblxuICB9XG4gIHZhciBuID0gcGFyc2VGbG9hdChtYXRjaFsxXSlcbiAgdmFyIHR5cGUgPSAobWF0Y2hbMl0gfHwgJ21zJykudG9Mb3dlckNhc2UoKVxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICd5ZWFycyc6XG4gICAgY2FzZSAneWVhcic6XG4gICAgY2FzZSAneXJzJzpcbiAgICBjYXNlICd5cic6XG4gICAgY2FzZSAneSc6XG4gICAgICByZXR1cm4gbiAqIHlcbiAgICBjYXNlICdkYXlzJzpcbiAgICBjYXNlICdkYXknOlxuICAgIGNhc2UgJ2QnOlxuICAgICAgcmV0dXJuIG4gKiBkXG4gICAgY2FzZSAnaG91cnMnOlxuICAgIGNhc2UgJ2hvdXInOlxuICAgIGNhc2UgJ2hycyc6XG4gICAgY2FzZSAnaHInOlxuICAgIGNhc2UgJ2gnOlxuICAgICAgcmV0dXJuIG4gKiBoXG4gICAgY2FzZSAnbWludXRlcyc6XG4gICAgY2FzZSAnbWludXRlJzpcbiAgICBjYXNlICdtaW5zJzpcbiAgICBjYXNlICdtaW4nOlxuICAgIGNhc2UgJ20nOlxuICAgICAgcmV0dXJuIG4gKiBtXG4gICAgY2FzZSAnc2Vjb25kcyc6XG4gICAgY2FzZSAnc2Vjb25kJzpcbiAgICBjYXNlICdzZWNzJzpcbiAgICBjYXNlICdzZWMnOlxuICAgIGNhc2UgJ3MnOlxuICAgICAgcmV0dXJuIG4gKiBzXG4gICAgY2FzZSAnbWlsbGlzZWNvbmRzJzpcbiAgICBjYXNlICdtaWxsaXNlY29uZCc6XG4gICAgY2FzZSAnbXNlY3MnOlxuICAgIGNhc2UgJ21zZWMnOlxuICAgIGNhc2UgJ21zJzpcbiAgICAgIHJldHVybiBuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxufVxuXG4vKipcbiAqIFNob3J0IGZvcm1hdCBmb3IgYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGZtdFNob3J0KG1zKSB7XG4gIGlmIChtcyA+PSBkKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBkKSArICdkJ1xuICB9XG4gIGlmIChtcyA+PSBoKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBoKSArICdoJ1xuICB9XG4gIGlmIChtcyA+PSBtKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBtKSArICdtJ1xuICB9XG4gIGlmIChtcyA+PSBzKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBzKSArICdzJ1xuICB9XG4gIHJldHVybiBtcyArICdtcydcbn1cblxuLyoqXG4gKiBMb25nIGZvcm1hdCBmb3IgYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGZtdExvbmcobXMpIHtcbiAgcmV0dXJuIHBsdXJhbChtcywgZCwgJ2RheScpIHx8XG4gICAgcGx1cmFsKG1zLCBoLCAnaG91cicpIHx8XG4gICAgcGx1cmFsKG1zLCBtLCAnbWludXRlJykgfHxcbiAgICBwbHVyYWwobXMsIHMsICdzZWNvbmQnKSB8fFxuICAgIG1zICsgJyBtcydcbn1cblxuLyoqXG4gKiBQbHVyYWxpemF0aW9uIGhlbHBlci5cbiAqL1xuXG5mdW5jdGlvbiBwbHVyYWwobXMsIG4sIG5hbWUpIHtcbiAgaWYgKG1zIDwgbikge1xuICAgIHJldHVyblxuICB9XG4gIGlmIChtcyA8IG4gKiAxLjUpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihtcyAvIG4pICsgJyAnICsgbmFtZVxuICB9XG4gIHJldHVybiBNYXRoLmNlaWwobXMgLyBuKSArICcgJyArIG5hbWUgKyAncydcbn1cbiIsIlxuLyoqXG4gKiBUaGlzIGlzIHRoZSBjb21tb24gbG9naWMgZm9yIGJvdGggdGhlIE5vZGUuanMgYW5kIHdlYiBicm93c2VyXG4gKiBpbXBsZW1lbnRhdGlvbnMgb2YgYGRlYnVnKClgLlxuICpcbiAqIEV4cG9zZSBgZGVidWcoKWAgYXMgdGhlIG1vZHVsZS5cbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVEZWJ1Zy5kZWJ1ZyA9IGNyZWF0ZURlYnVnLmRlZmF1bHQgPSBjcmVhdGVEZWJ1ZztcbmV4cG9ydHMuY29lcmNlID0gY29lcmNlO1xuZXhwb3J0cy5kaXNhYmxlID0gZGlzYWJsZTtcbmV4cG9ydHMuZW5hYmxlID0gZW5hYmxlO1xuZXhwb3J0cy5lbmFibGVkID0gZW5hYmxlZDtcbmV4cG9ydHMuaHVtYW5pemUgPSByZXF1aXJlKCdtcycpO1xuXG4vKipcbiAqIFRoZSBjdXJyZW50bHkgYWN0aXZlIGRlYnVnIG1vZGUgbmFtZXMsIGFuZCBuYW1lcyB0byBza2lwLlxuICovXG5cbmV4cG9ydHMubmFtZXMgPSBbXTtcbmV4cG9ydHMuc2tpcHMgPSBbXTtcblxuLyoqXG4gKiBNYXAgb2Ygc3BlY2lhbCBcIiVuXCIgaGFuZGxpbmcgZnVuY3Rpb25zLCBmb3IgdGhlIGRlYnVnIFwiZm9ybWF0XCIgYXJndW1lbnQuXG4gKlxuICogVmFsaWQga2V5IG5hbWVzIGFyZSBhIHNpbmdsZSwgbG93ZXIgb3IgdXBwZXItY2FzZSBsZXR0ZXIsIGkuZS4gXCJuXCIgYW5kIFwiTlwiLlxuICovXG5cbmV4cG9ydHMuZm9ybWF0dGVycyA9IHt9O1xuXG4vKipcbiAqIFByZXZpb3VzIGxvZyB0aW1lc3RhbXAuXG4gKi9cblxudmFyIHByZXZUaW1lO1xuXG4vKipcbiAqIFNlbGVjdCBhIGNvbG9yLlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZVxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2VsZWN0Q29sb3IobmFtZXNwYWNlKSB7XG4gIHZhciBoYXNoID0gMCwgaTtcblxuICBmb3IgKGkgaW4gbmFtZXNwYWNlKSB7XG4gICAgaGFzaCAgPSAoKGhhc2ggPDwgNSkgLSBoYXNoKSArIG5hbWVzcGFjZS5jaGFyQ29kZUF0KGkpO1xuICAgIGhhc2ggfD0gMDsgLy8gQ29udmVydCB0byAzMmJpdCBpbnRlZ2VyXG4gIH1cblxuICByZXR1cm4gZXhwb3J0cy5jb2xvcnNbTWF0aC5hYnMoaGFzaCkgJSBleHBvcnRzLmNvbG9ycy5sZW5ndGhdO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGRlYnVnZ2VyIHdpdGggdGhlIGdpdmVuIGBuYW1lc3BhY2VgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBjcmVhdGVEZWJ1ZyhuYW1lc3BhY2UpIHtcblxuICBmdW5jdGlvbiBkZWJ1ZygpIHtcbiAgICAvLyBkaXNhYmxlZD9cbiAgICBpZiAoIWRlYnVnLmVuYWJsZWQpIHJldHVybjtcblxuICAgIHZhciBzZWxmID0gZGVidWc7XG5cbiAgICAvLyBzZXQgYGRpZmZgIHRpbWVzdGFtcFxuICAgIHZhciBjdXJyID0gK25ldyBEYXRlKCk7XG4gICAgdmFyIG1zID0gY3VyciAtIChwcmV2VGltZSB8fCBjdXJyKTtcbiAgICBzZWxmLmRpZmYgPSBtcztcbiAgICBzZWxmLnByZXYgPSBwcmV2VGltZTtcbiAgICBzZWxmLmN1cnIgPSBjdXJyO1xuICAgIHByZXZUaW1lID0gY3VycjtcblxuICAgIC8vIHR1cm4gdGhlIGBhcmd1bWVudHNgIGludG8gYSBwcm9wZXIgQXJyYXlcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuXG4gICAgYXJnc1swXSA9IGV4cG9ydHMuY29lcmNlKGFyZ3NbMF0pO1xuXG4gICAgaWYgKCdzdHJpbmcnICE9PSB0eXBlb2YgYXJnc1swXSkge1xuICAgICAgLy8gYW55dGhpbmcgZWxzZSBsZXQncyBpbnNwZWN0IHdpdGggJU9cbiAgICAgIGFyZ3MudW5zaGlmdCgnJU8nKTtcbiAgICB9XG5cbiAgICAvLyBhcHBseSBhbnkgYGZvcm1hdHRlcnNgIHRyYW5zZm9ybWF0aW9uc1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgYXJnc1swXSA9IGFyZ3NbMF0ucmVwbGFjZSgvJShbYS16QS1aJV0pL2csIGZ1bmN0aW9uKG1hdGNoLCBmb3JtYXQpIHtcbiAgICAgIC8vIGlmIHdlIGVuY291bnRlciBhbiBlc2NhcGVkICUgdGhlbiBkb24ndCBpbmNyZWFzZSB0aGUgYXJyYXkgaW5kZXhcbiAgICAgIGlmIChtYXRjaCA9PT0gJyUlJykgcmV0dXJuIG1hdGNoO1xuICAgICAgaW5kZXgrKztcbiAgICAgIHZhciBmb3JtYXR0ZXIgPSBleHBvcnRzLmZvcm1hdHRlcnNbZm9ybWF0XTtcbiAgICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgZm9ybWF0dGVyKSB7XG4gICAgICAgIHZhciB2YWwgPSBhcmdzW2luZGV4XTtcbiAgICAgICAgbWF0Y2ggPSBmb3JtYXR0ZXIuY2FsbChzZWxmLCB2YWwpO1xuXG4gICAgICAgIC8vIG5vdyB3ZSBuZWVkIHRvIHJlbW92ZSBgYXJnc1tpbmRleF1gIHNpbmNlIGl0J3MgaW5saW5lZCBpbiB0aGUgYGZvcm1hdGBcbiAgICAgICAgYXJncy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICBpbmRleC0tO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuXG4gICAgLy8gYXBwbHkgZW52LXNwZWNpZmljIGZvcm1hdHRpbmcgKGNvbG9ycywgZXRjLilcbiAgICBleHBvcnRzLmZvcm1hdEFyZ3MuY2FsbChzZWxmLCBhcmdzKTtcblxuICAgIHZhciBsb2dGbiA9IGRlYnVnLmxvZyB8fCBleHBvcnRzLmxvZyB8fCBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpO1xuICAgIGxvZ0ZuLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICB9XG5cbiAgZGVidWcubmFtZXNwYWNlID0gbmFtZXNwYWNlO1xuICBkZWJ1Zy5lbmFibGVkID0gZXhwb3J0cy5lbmFibGVkKG5hbWVzcGFjZSk7XG4gIGRlYnVnLnVzZUNvbG9ycyA9IGV4cG9ydHMudXNlQ29sb3JzKCk7XG4gIGRlYnVnLmNvbG9yID0gc2VsZWN0Q29sb3IobmFtZXNwYWNlKTtcblxuICAvLyBlbnYtc3BlY2lmaWMgaW5pdGlhbGl6YXRpb24gbG9naWMgZm9yIGRlYnVnIGluc3RhbmNlc1xuICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGV4cG9ydHMuaW5pdCkge1xuICAgIGV4cG9ydHMuaW5pdChkZWJ1Zyk7XG4gIH1cblxuICByZXR1cm4gZGVidWc7XG59XG5cbi8qKlxuICogRW5hYmxlcyBhIGRlYnVnIG1vZGUgYnkgbmFtZXNwYWNlcy4gVGhpcyBjYW4gaW5jbHVkZSBtb2Rlc1xuICogc2VwYXJhdGVkIGJ5IGEgY29sb24gYW5kIHdpbGRjYXJkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBlbmFibGUobmFtZXNwYWNlcykge1xuICBleHBvcnRzLnNhdmUobmFtZXNwYWNlcyk7XG5cbiAgdmFyIHNwbGl0ID0gKG5hbWVzcGFjZXMgfHwgJycpLnNwbGl0KC9bXFxzLF0rLyk7XG4gIHZhciBsZW4gPSBzcGxpdC5sZW5ndGg7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIGlmICghc3BsaXRbaV0pIGNvbnRpbnVlOyAvLyBpZ25vcmUgZW1wdHkgc3RyaW5nc1xuICAgIG5hbWVzcGFjZXMgPSBzcGxpdFtpXS5yZXBsYWNlKC9cXCovZywgJy4qPycpO1xuICAgIGlmIChuYW1lc3BhY2VzWzBdID09PSAnLScpIHtcbiAgICAgIGV4cG9ydHMuc2tpcHMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWVzcGFjZXMuc3Vic3RyKDEpICsgJyQnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4cG9ydHMubmFtZXMucHVzaChuZXcgUmVnRXhwKCdeJyArIG5hbWVzcGFjZXMgKyAnJCcpKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBEaXNhYmxlIGRlYnVnIG91dHB1dC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGRpc2FibGUoKSB7XG4gIGV4cG9ydHMuZW5hYmxlKCcnKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIG1vZGUgbmFtZSBpcyBlbmFibGVkLCBmYWxzZSBvdGhlcndpc2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGVuYWJsZWQobmFtZSkge1xuICB2YXIgaSwgbGVuO1xuICBmb3IgKGkgPSAwLCBsZW4gPSBleHBvcnRzLnNraXBzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGV4cG9ydHMuc2tpcHNbaV0udGVzdChuYW1lKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICBmb3IgKGkgPSAwLCBsZW4gPSBleHBvcnRzLm5hbWVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKGV4cG9ydHMubmFtZXNbaV0udGVzdChuYW1lKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBDb2VyY2UgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGNvZXJjZSh2YWwpIHtcbiAgaWYgKHZhbCBpbnN0YW5jZW9mIEVycm9yKSByZXR1cm4gdmFsLnN0YWNrIHx8IHZhbC5tZXNzYWdlO1xuICByZXR1cm4gdmFsO1xufVxuIiwiLyoqXG4gKiBUaGlzIGlzIHRoZSB3ZWIgYnJvd3NlciBpbXBsZW1lbnRhdGlvbiBvZiBgZGVidWcoKWAuXG4gKlxuICogRXhwb3NlIGBkZWJ1ZygpYCBhcyB0aGUgbW9kdWxlLlxuICovXG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZGVidWcnKTtcbmV4cG9ydHMubG9nID0gbG9nO1xuZXhwb3J0cy5mb3JtYXRBcmdzID0gZm9ybWF0QXJncztcbmV4cG9ydHMuc2F2ZSA9IHNhdmU7XG5leHBvcnRzLmxvYWQgPSBsb2FkO1xuZXhwb3J0cy51c2VDb2xvcnMgPSB1c2VDb2xvcnM7XG5leHBvcnRzLnN0b3JhZ2UgPSAndW5kZWZpbmVkJyAhPSB0eXBlb2YgY2hyb21lXG4gICAgICAgICAgICAgICAmJiAndW5kZWZpbmVkJyAhPSB0eXBlb2YgY2hyb21lLnN0b3JhZ2VcbiAgICAgICAgICAgICAgICAgID8gY2hyb21lLnN0b3JhZ2UubG9jYWxcbiAgICAgICAgICAgICAgICAgIDogbG9jYWxzdG9yYWdlKCk7XG5cbi8qKlxuICogQ29sb3JzLlxuICovXG5cbmV4cG9ydHMuY29sb3JzID0gW1xuICAnbGlnaHRzZWFncmVlbicsXG4gICdmb3Jlc3RncmVlbicsXG4gICdnb2xkZW5yb2QnLFxuICAnZG9kZ2VyYmx1ZScsXG4gICdkYXJrb3JjaGlkJyxcbiAgJ2NyaW1zb24nXG5dO1xuXG4vKipcbiAqIEN1cnJlbnRseSBvbmx5IFdlYktpdC1iYXNlZCBXZWIgSW5zcGVjdG9ycywgRmlyZWZveCA+PSB2MzEsXG4gKiBhbmQgdGhlIEZpcmVidWcgZXh0ZW5zaW9uIChhbnkgRmlyZWZveCB2ZXJzaW9uKSBhcmUga25vd25cbiAqIHRvIHN1cHBvcnQgXCIlY1wiIENTUyBjdXN0b21pemF0aW9ucy5cbiAqXG4gKiBUT0RPOiBhZGQgYSBgbG9jYWxTdG9yYWdlYCB2YXJpYWJsZSB0byBleHBsaWNpdGx5IGVuYWJsZS9kaXNhYmxlIGNvbG9yc1xuICovXG5cbmZ1bmN0aW9uIHVzZUNvbG9ycygpIHtcbiAgLy8gTkI6IEluIGFuIEVsZWN0cm9uIHByZWxvYWQgc2NyaXB0LCBkb2N1bWVudCB3aWxsIGJlIGRlZmluZWQgYnV0IG5vdCBmdWxseVxuICAvLyBpbml0aWFsaXplZC4gU2luY2Ugd2Uga25vdyB3ZSdyZSBpbiBDaHJvbWUsIHdlJ2xsIGp1c3QgZGV0ZWN0IHRoaXMgY2FzZVxuICAvLyBleHBsaWNpdGx5XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cgJiYgdHlwZW9mIHdpbmRvdy5wcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucHJvY2Vzcy50eXBlID09PSAncmVuZGVyZXInKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBpcyB3ZWJraXQ/IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE2NDU5NjA2LzM3Njc3M1xuICAvLyBkb2N1bWVudCBpcyB1bmRlZmluZWQgaW4gcmVhY3QtbmF0aXZlOiBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVhY3QtbmF0aXZlL3B1bGwvMTYzMlxuICByZXR1cm4gKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQgJiYgJ1dlYmtpdEFwcGVhcmFuY2UnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZSkgfHxcbiAgICAvLyBpcyBmaXJlYnVnPyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zOTgxMjAvMzc2NzczXG4gICAgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdyAmJiB3aW5kb3cuY29uc29sZSAmJiAoY29uc29sZS5maXJlYnVnIHx8IChjb25zb2xlLmV4Y2VwdGlvbiAmJiBjb25zb2xlLnRhYmxlKSkpIHx8XG4gICAgLy8gaXMgZmlyZWZveCA+PSB2MzE/XG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9Ub29scy9XZWJfQ29uc29sZSNTdHlsaW5nX21lc3NhZ2VzXG4gICAgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIG5hdmlnYXRvciAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvZmlyZWZveFxcLyhcXGQrKS8pICYmIHBhcnNlSW50KFJlZ0V4cC4kMSwgMTApID49IDMxKSB8fFxuICAgIC8vIGRvdWJsZSBjaGVjayB3ZWJraXQgaW4gdXNlckFnZW50IGp1c3QgaW4gY2FzZSB3ZSBhcmUgaW4gYSB3b3JrZXJcbiAgICAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yICYmIG5hdmlnYXRvci51c2VyQWdlbnQgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLm1hdGNoKC9hcHBsZXdlYmtpdFxcLyhcXGQrKS8pKTtcbn1cblxuLyoqXG4gKiBNYXAgJWogdG8gYEpTT04uc3RyaW5naWZ5KClgLCBzaW5jZSBubyBXZWIgSW5zcGVjdG9ycyBkbyB0aGF0IGJ5IGRlZmF1bHQuXG4gKi9cblxuZXhwb3J0cy5mb3JtYXR0ZXJzLmogPSBmdW5jdGlvbih2KSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHYpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gJ1tVbmV4cGVjdGVkSlNPTlBhcnNlRXJyb3JdOiAnICsgZXJyLm1lc3NhZ2U7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBDb2xvcml6ZSBsb2cgYXJndW1lbnRzIGlmIGVuYWJsZWQuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBmb3JtYXRBcmdzKGFyZ3MpIHtcbiAgdmFyIHVzZUNvbG9ycyA9IHRoaXMudXNlQ29sb3JzO1xuXG4gIGFyZ3NbMF0gPSAodXNlQ29sb3JzID8gJyVjJyA6ICcnKVxuICAgICsgdGhpcy5uYW1lc3BhY2VcbiAgICArICh1c2VDb2xvcnMgPyAnICVjJyA6ICcgJylcbiAgICArIGFyZ3NbMF1cbiAgICArICh1c2VDb2xvcnMgPyAnJWMgJyA6ICcgJylcbiAgICArICcrJyArIGV4cG9ydHMuaHVtYW5pemUodGhpcy5kaWZmKTtcblxuICBpZiAoIXVzZUNvbG9ycykgcmV0dXJuO1xuXG4gIHZhciBjID0gJ2NvbG9yOiAnICsgdGhpcy5jb2xvcjtcbiAgYXJncy5zcGxpY2UoMSwgMCwgYywgJ2NvbG9yOiBpbmhlcml0JylcblxuICAvLyB0aGUgZmluYWwgXCIlY1wiIGlzIHNvbWV3aGF0IHRyaWNreSwgYmVjYXVzZSB0aGVyZSBjb3VsZCBiZSBvdGhlclxuICAvLyBhcmd1bWVudHMgcGFzc2VkIGVpdGhlciBiZWZvcmUgb3IgYWZ0ZXIgdGhlICVjLCBzbyB3ZSBuZWVkIHRvXG4gIC8vIGZpZ3VyZSBvdXQgdGhlIGNvcnJlY3QgaW5kZXggdG8gaW5zZXJ0IHRoZSBDU1MgaW50b1xuICB2YXIgaW5kZXggPSAwO1xuICB2YXIgbGFzdEMgPSAwO1xuICBhcmdzWzBdLnJlcGxhY2UoLyVbYS16QS1aJV0vZywgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICBpZiAoJyUlJyA9PT0gbWF0Y2gpIHJldHVybjtcbiAgICBpbmRleCsrO1xuICAgIGlmICgnJWMnID09PSBtYXRjaCkge1xuICAgICAgLy8gd2Ugb25seSBhcmUgaW50ZXJlc3RlZCBpbiB0aGUgKmxhc3QqICVjXG4gICAgICAvLyAodGhlIHVzZXIgbWF5IGhhdmUgcHJvdmlkZWQgdGhlaXIgb3duKVxuICAgICAgbGFzdEMgPSBpbmRleDtcbiAgICB9XG4gIH0pO1xuXG4gIGFyZ3Muc3BsaWNlKGxhc3RDLCAwLCBjKTtcbn1cblxuLyoqXG4gKiBJbnZva2VzIGBjb25zb2xlLmxvZygpYCB3aGVuIGF2YWlsYWJsZS5cbiAqIE5vLW9wIHdoZW4gYGNvbnNvbGUubG9nYCBpcyBub3QgYSBcImZ1bmN0aW9uXCIuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBsb2coKSB7XG4gIC8vIHRoaXMgaGFja2VyeSBpcyByZXF1aXJlZCBmb3IgSUU4LzksIHdoZXJlXG4gIC8vIHRoZSBgY29uc29sZS5sb2dgIGZ1bmN0aW9uIGRvZXNuJ3QgaGF2ZSAnYXBwbHknXG4gIHJldHVybiAnb2JqZWN0JyA9PT0gdHlwZW9mIGNvbnNvbGVcbiAgICAmJiBjb25zb2xlLmxvZ1xuICAgICYmIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKGNvbnNvbGUubG9nLCBjb25zb2xlLCBhcmd1bWVudHMpO1xufVxuXG4vKipcbiAqIFNhdmUgYG5hbWVzcGFjZXNgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzYXZlKG5hbWVzcGFjZXMpIHtcbiAgdHJ5IHtcbiAgICBpZiAobnVsbCA9PSBuYW1lc3BhY2VzKSB7XG4gICAgICBleHBvcnRzLnN0b3JhZ2UucmVtb3ZlSXRlbSgnZGVidWcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXhwb3J0cy5zdG9yYWdlLmRlYnVnID0gbmFtZXNwYWNlcztcbiAgICB9XG4gIH0gY2F0Y2goZSkge31cbn1cblxuLyoqXG4gKiBMb2FkIGBuYW1lc3BhY2VzYC5cbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9IHJldHVybnMgdGhlIHByZXZpb3VzbHkgcGVyc2lzdGVkIGRlYnVnIG1vZGVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBsb2FkKCkge1xuICB0cnkge1xuICAgIHJldHVybiBleHBvcnRzLnN0b3JhZ2UuZGVidWc7XG4gIH0gY2F0Y2goZSkge31cblxuICAvLyBJZiBkZWJ1ZyBpc24ndCBzZXQgaW4gTFMsIGFuZCB3ZSdyZSBpbiBFbGVjdHJvbiwgdHJ5IHRvIGxvYWQgJERFQlVHXG4gIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgJ2VudicgaW4gcHJvY2Vzcykge1xuICAgIHJldHVybiBwcm9jZXNzLmVudi5ERUJVRztcbiAgfVxufVxuXG4vKipcbiAqIEVuYWJsZSBuYW1lc3BhY2VzIGxpc3RlZCBpbiBgbG9jYWxTdG9yYWdlLmRlYnVnYCBpbml0aWFsbHkuXG4gKi9cblxuZXhwb3J0cy5lbmFibGUobG9hZCgpKTtcblxuLyoqXG4gKiBMb2NhbHN0b3JhZ2UgYXR0ZW1wdHMgdG8gcmV0dXJuIHRoZSBsb2NhbHN0b3JhZ2UuXG4gKlxuICogVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBzYWZhcmkgdGhyb3dzXG4gKiB3aGVuIGEgdXNlciBkaXNhYmxlcyBjb29raWVzL2xvY2Fsc3RvcmFnZVxuICogYW5kIHlvdSBhdHRlbXB0IHRvIGFjY2VzcyBpdC5cbiAqXG4gKiBAcmV0dXJuIHtMb2NhbFN0b3JhZ2V9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBsb2NhbHN0b3JhZ2UoKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2U7XG4gIH0gY2F0Y2ggKGUpIHt9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBoYXMgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG4gICwgcHJlZml4ID0gJ34nO1xuXG4vKipcbiAqIENvbnN0cnVjdG9yIHRvIGNyZWF0ZSBhIHN0b3JhZ2UgZm9yIG91ciBgRUVgIG9iamVjdHMuXG4gKiBBbiBgRXZlbnRzYCBpbnN0YW5jZSBpcyBhIHBsYWluIG9iamVjdCB3aG9zZSBwcm9wZXJ0aWVzIGFyZSBldmVudCBuYW1lcy5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBFdmVudHMoKSB7fVxuXG4vL1xuLy8gV2UgdHJ5IHRvIG5vdCBpbmhlcml0IGZyb20gYE9iamVjdC5wcm90b3R5cGVgLiBJbiBzb21lIGVuZ2luZXMgY3JlYXRpbmcgYW5cbi8vIGluc3RhbmNlIGluIHRoaXMgd2F5IGlzIGZhc3RlciB0aGFuIGNhbGxpbmcgYE9iamVjdC5jcmVhdGUobnVsbClgIGRpcmVjdGx5LlxuLy8gSWYgYE9iamVjdC5jcmVhdGUobnVsbClgIGlzIG5vdCBzdXBwb3J0ZWQgd2UgcHJlZml4IHRoZSBldmVudCBuYW1lcyB3aXRoIGFcbi8vIGNoYXJhY3RlciB0byBtYWtlIHN1cmUgdGhhdCB0aGUgYnVpbHQtaW4gb2JqZWN0IHByb3BlcnRpZXMgYXJlIG5vdFxuLy8gb3ZlcnJpZGRlbiBvciB1c2VkIGFzIGFuIGF0dGFjayB2ZWN0b3IuXG4vL1xuaWYgKE9iamVjdC5jcmVhdGUpIHtcbiAgRXZlbnRzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cbiAgLy9cbiAgLy8gVGhpcyBoYWNrIGlzIG5lZWRlZCBiZWNhdXNlIHRoZSBgX19wcm90b19fYCBwcm9wZXJ0eSBpcyBzdGlsbCBpbmhlcml0ZWQgaW5cbiAgLy8gc29tZSBvbGQgYnJvd3NlcnMgbGlrZSBBbmRyb2lkIDQsIGlQaG9uZSA1LjEsIE9wZXJhIDExIGFuZCBTYWZhcmkgNS5cbiAgLy9cbiAgaWYgKCFuZXcgRXZlbnRzKCkuX19wcm90b19fKSBwcmVmaXggPSBmYWxzZTtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIHNpbmdsZSBldmVudCBsaXN0ZW5lci5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IFRoZSBjb250ZXh0IHRvIGludm9rZSB0aGUgbGlzdGVuZXIgd2l0aC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW29uY2U9ZmFsc2VdIFNwZWNpZnkgaWYgdGhlIGxpc3RlbmVyIGlzIGEgb25lLXRpbWUgbGlzdGVuZXIuXG4gKiBAY29uc3RydWN0b3JcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBFRShmbiwgY29udGV4dCwgb25jZSkge1xuICB0aGlzLmZuID0gZm47XG4gIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gIHRoaXMub25jZSA9IG9uY2UgfHwgZmFsc2U7XG59XG5cbi8qKlxuICogTWluaW1hbCBgRXZlbnRFbWl0dGVyYCBpbnRlcmZhY2UgdGhhdCBpcyBtb2xkZWQgYWdhaW5zdCB0aGUgTm9kZS5qc1xuICogYEV2ZW50RW1pdHRlcmAgaW50ZXJmYWNlLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQGFwaSBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSBuZXcgRXZlbnRzKCk7XG4gIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbn1cblxuLyoqXG4gKiBSZXR1cm4gYW4gYXJyYXkgbGlzdGluZyB0aGUgZXZlbnRzIGZvciB3aGljaCB0aGUgZW1pdHRlciBoYXMgcmVnaXN0ZXJlZFxuICogbGlzdGVuZXJzLlxuICpcbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZXZlbnROYW1lcyA9IGZ1bmN0aW9uIGV2ZW50TmFtZXMoKSB7XG4gIHZhciBuYW1lcyA9IFtdXG4gICAgLCBldmVudHNcbiAgICAsIG5hbWU7XG5cbiAgaWYgKHRoaXMuX2V2ZW50c0NvdW50ID09PSAwKSByZXR1cm4gbmFtZXM7XG5cbiAgZm9yIChuYW1lIGluIChldmVudHMgPSB0aGlzLl9ldmVudHMpKSB7XG4gICAgaWYgKGhhcy5jYWxsKGV2ZW50cywgbmFtZSkpIG5hbWVzLnB1c2gocHJlZml4ID8gbmFtZS5zbGljZSgxKSA6IG5hbWUpO1xuICB9XG5cbiAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcbiAgICByZXR1cm4gbmFtZXMuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZXZlbnRzKSk7XG4gIH1cblxuICByZXR1cm4gbmFtZXM7XG59O1xuXG4vKipcbiAqIFJldHVybiB0aGUgbGlzdGVuZXJzIHJlZ2lzdGVyZWQgZm9yIGEgZ2l2ZW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8U3ltYm9sfSBldmVudCBUaGUgZXZlbnQgbmFtZS5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZXhpc3RzIE9ubHkgY2hlY2sgaWYgdGhlcmUgYXJlIGxpc3RlbmVycy5cbiAqIEByZXR1cm5zIHtBcnJheXxCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnMoZXZlbnQsIGV4aXN0cykge1xuICB2YXIgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudFxuICAgICwgYXZhaWxhYmxlID0gdGhpcy5fZXZlbnRzW2V2dF07XG5cbiAgaWYgKGV4aXN0cykgcmV0dXJuICEhYXZhaWxhYmxlO1xuICBpZiAoIWF2YWlsYWJsZSkgcmV0dXJuIFtdO1xuICBpZiAoYXZhaWxhYmxlLmZuKSByZXR1cm4gW2F2YWlsYWJsZS5mbl07XG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhdmFpbGFibGUubGVuZ3RoLCBlZSA9IG5ldyBBcnJheShsKTsgaSA8IGw7IGkrKykge1xuICAgIGVlW2ldID0gYXZhaWxhYmxlW2ldLmZuO1xuICB9XG5cbiAgcmV0dXJuIGVlO1xufTtcblxuLyoqXG4gKiBDYWxscyBlYWNoIG9mIHRoZSBsaXN0ZW5lcnMgcmVnaXN0ZXJlZCBmb3IgYSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xTeW1ib2x9IGV2ZW50IFRoZSBldmVudCBuYW1lLlxuICogQHJldHVybnMge0Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgZXZlbnQgaGFkIGxpc3RlbmVycywgZWxzZSBgZmFsc2VgLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24gZW1pdChldmVudCwgYTEsIGEyLCBhMywgYTQsIGE1KSB7XG4gIHZhciBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW2V2dF0pIHJldHVybiBmYWxzZTtcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2dF1cbiAgICAsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAsIGFyZ3NcbiAgICAsIGk7XG5cbiAgaWYgKGxpc3RlbmVycy5mbikge1xuICAgIGlmIChsaXN0ZW5lcnMub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzLmZuLCB1bmRlZmluZWQsIHRydWUpO1xuXG4gICAgc3dpdGNoIChsZW4pIHtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0KSwgdHJ1ZTtcbiAgICAgIGNhc2UgMjogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSksIHRydWU7XG4gICAgICBjYXNlIDM6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNDogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzKSwgdHJ1ZTtcbiAgICAgIGNhc2UgNTogcmV0dXJuIGxpc3RlbmVycy5mbi5jYWxsKGxpc3RlbmVycy5jb250ZXh0LCBhMSwgYTIsIGEzLCBhNCksIHRydWU7XG4gICAgICBjYXNlIDY6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQsIGE1KSwgdHJ1ZTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAxLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtMSk7IGkgPCBsZW47IGkrKykge1xuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgfVxuXG4gICAgbGlzdGVuZXJzLmZuLmFwcGx5KGxpc3RlbmVycy5jb250ZXh0LCBhcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aFxuICAgICAgLCBqO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAobGlzdGVuZXJzW2ldLm9uY2UpIHRoaXMucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyc1tpXS5mbiwgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgICAgc3dpdGNoIChsZW4pIHtcbiAgICAgICAgY2FzZSAxOiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCk7IGJyZWFrO1xuICAgICAgICBjYXNlIDI6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSk7IGJyZWFrO1xuICAgICAgICBjYXNlIDM6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0LCBhMSwgYTIpOyBicmVhaztcbiAgICAgICAgY2FzZSA0OiBsaXN0ZW5lcnNbaV0uZm4uY2FsbChsaXN0ZW5lcnNbaV0uY29udGV4dCwgYTEsIGEyLCBhMyk7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmICghYXJncykgZm9yIChqID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbi5hcHBseShsaXN0ZW5lcnNbaV0uY29udGV4dCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIEFkZCBhIGxpc3RlbmVyIGZvciBhIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfFN5bWJvbH0gZXZlbnQgVGhlIGV2ZW50IG5hbWUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBbY29udGV4dD10aGlzXSBUaGUgY29udGV4dCB0byBpbnZva2UgdGhlIGxpc3RlbmVyIHdpdGguXG4gKiBAcmV0dXJucyB7RXZlbnRFbWl0dGVyfSBgdGhpc2AuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzKVxuICAgICwgZXZ0ID0gcHJlZml4ID8gcHJlZml4ICsgZXZlbnQgOiBldmVudDtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1tldnRdKSB0aGlzLl9ldmVudHNbZXZ0XSA9IGxpc3RlbmVyLCB0aGlzLl9ldmVudHNDb3VudCsrO1xuICBlbHNlIGlmICghdGhpcy5fZXZlbnRzW2V2dF0uZm4pIHRoaXMuX2V2ZW50c1tldnRdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlIHRoaXMuX2V2ZW50c1tldnRdID0gW3RoaXMuX2V2ZW50c1tldnRdLCBsaXN0ZW5lcl07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZCBhIG9uZS10aW1lIGxpc3RlbmVyIGZvciBhIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfFN5bWJvbH0gZXZlbnQgVGhlIGV2ZW50IG5hbWUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge01peGVkfSBbY29udGV4dD10aGlzXSBUaGUgY29udGV4dCB0byBpbnZva2UgdGhlIGxpc3RlbmVyIHdpdGguXG4gKiBAcmV0dXJucyB7RXZlbnRFbWl0dGVyfSBgdGhpc2AuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcywgdHJ1ZSlcbiAgICAsIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgdGhpcy5fZXZlbnRzW2V2dF0gPSBsaXN0ZW5lciwgdGhpcy5fZXZlbnRzQ291bnQrKztcbiAgZWxzZSBpZiAoIXRoaXMuX2V2ZW50c1tldnRdLmZuKSB0aGlzLl9ldmVudHNbZXZ0XS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZSB0aGlzLl9ldmVudHNbZXZ0XSA9IFt0aGlzLl9ldmVudHNbZXZ0XSwgbGlzdGVuZXJdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgdGhlIGxpc3RlbmVycyBvZiBhIGdpdmVuIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfFN5bWJvbH0gZXZlbnQgVGhlIGV2ZW50IG5hbWUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBPbmx5IHJlbW92ZSB0aGUgbGlzdGVuZXJzIHRoYXQgbWF0Y2ggdGhpcyBmdW5jdGlvbi5cbiAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHQgT25seSByZW1vdmUgdGhlIGxpc3RlbmVycyB0aGF0IGhhdmUgdGhpcyBjb250ZXh0LlxuICogQHBhcmFtIHtCb29sZWFufSBvbmNlIE9ubHkgcmVtb3ZlIG9uZS10aW1lIGxpc3RlbmVycy5cbiAqIEByZXR1cm5zIHtFdmVudEVtaXR0ZXJ9IGB0aGlzYC5cbiAqIEBhcGkgcHVibGljXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihldmVudCwgZm4sIGNvbnRleHQsIG9uY2UpIHtcbiAgdmFyIGV2dCA9IHByZWZpeCA/IHByZWZpeCArIGV2ZW50IDogZXZlbnQ7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbZXZ0XSkgcmV0dXJuIHRoaXM7XG4gIGlmICghZm4pIHtcbiAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMCkgdGhpcy5fZXZlbnRzID0gbmV3IEV2ZW50cygpO1xuICAgIGVsc2UgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1tldnRdO1xuXG4gIGlmIChsaXN0ZW5lcnMuZm4pIHtcbiAgICBpZiAoXG4gICAgICAgICBsaXN0ZW5lcnMuZm4gPT09IGZuXG4gICAgICAmJiAoIW9uY2UgfHwgbGlzdGVuZXJzLm9uY2UpXG4gICAgICAmJiAoIWNvbnRleHQgfHwgbGlzdGVuZXJzLmNvbnRleHQgPT09IGNvbnRleHQpXG4gICAgKSB7XG4gICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMCkgdGhpcy5fZXZlbnRzID0gbmV3IEV2ZW50cygpO1xuICAgICAgZWxzZSBkZWxldGUgdGhpcy5fZXZlbnRzW2V2dF07XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvciAodmFyIGkgPSAwLCBldmVudHMgPSBbXSwgbGVuZ3RoID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoXG4gICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbiAhPT0gZm5cbiAgICAgICAgfHwgKG9uY2UgJiYgIWxpc3RlbmVyc1tpXS5vbmNlKVxuICAgICAgICB8fCAoY29udGV4dCAmJiBsaXN0ZW5lcnNbaV0uY29udGV4dCAhPT0gY29udGV4dClcbiAgICAgICkge1xuICAgICAgICBldmVudHMucHVzaChsaXN0ZW5lcnNbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vXG4gICAgLy8gUmVzZXQgdGhlIGFycmF5LCBvciByZW1vdmUgaXQgY29tcGxldGVseSBpZiB3ZSBoYXZlIG5vIG1vcmUgbGlzdGVuZXJzLlxuICAgIC8vXG4gICAgaWYgKGV2ZW50cy5sZW5ndGgpIHRoaXMuX2V2ZW50c1tldnRdID0gZXZlbnRzLmxlbmd0aCA9PT0gMSA/IGV2ZW50c1swXSA6IGV2ZW50cztcbiAgICBlbHNlIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKSB0aGlzLl9ldmVudHMgPSBuZXcgRXZlbnRzKCk7XG4gICAgZWxzZSBkZWxldGUgdGhpcy5fZXZlbnRzW2V2dF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMsIG9yIHRob3NlIG9mIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8U3ltYm9sfSBbZXZlbnRdIFRoZSBldmVudCBuYW1lLlxuICogQHJldHVybnMge0V2ZW50RW1pdHRlcn0gYHRoaXNgLlxuICogQGFwaSBwdWJsaWNcbiAqL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnMoZXZlbnQpIHtcbiAgdmFyIGV2dDtcblxuICBpZiAoZXZlbnQpIHtcbiAgICBldnQgPSBwcmVmaXggPyBwcmVmaXggKyBldmVudCA6IGV2ZW50O1xuICAgIGlmICh0aGlzLl9ldmVudHNbZXZ0XSkge1xuICAgICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApIHRoaXMuX2V2ZW50cyA9IG5ldyBFdmVudHMoKTtcbiAgICAgIGVsc2UgZGVsZXRlIHRoaXMuX2V2ZW50c1tldnRdO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9ldmVudHMgPSBuZXcgRXZlbnRzKCk7XG4gICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vL1xuLy8gQWxpYXMgbWV0aG9kcyBuYW1lcyBiZWNhdXNlIHBlb3BsZSByb2xsIGxpa2UgdGhhdC5cbi8vXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbjtcblxuLy9cbi8vIFRoaXMgZnVuY3Rpb24gZG9lc24ndCBhcHBseSBhbnltb3JlLlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKCkge1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBFeHBvc2UgdGhlIHByZWZpeC5cbi8vXG5FdmVudEVtaXR0ZXIucHJlZml4ZWQgPSBwcmVmaXg7XG5cbi8vXG4vLyBBbGxvdyBgRXZlbnRFbWl0dGVyYCB0byBiZSBpbXBvcnRlZCBhcyBtb2R1bGUgbmFtZXNwYWNlLlxuLy9cbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbi8vXG4vLyBFeHBvc2UgdGhlIG1vZHVsZS5cbi8vXG5pZiAoJ3VuZGVmaW5lZCcgIT09IHR5cGVvZiBtb2R1bGUpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG59XG4iLCIvKipcbiAqIFRoZSBkaXNwYXRjaGVyIGZvciB3ZWJvcy5cbiAqIEBtb2R1bGUgY29yZS9kaXNwYXRjaGVyXG4gKi9cbmltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5cbmNvbnN0IGxvZyA9IGRlYnVnKCdkaXNwYXRjaGVyOmxvZycpO1xuLy8gRGlzYWJsZSBsb2dnaW5nIGluIHByb2R1Y3Rpb25cbmlmIChFTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICBkZWJ1Zy5lbmFibGUoJyonKTtcbn0gZWxzZSB7XG4gIGRlYnVnLmRpc2FibGUoKTtcbn1cblxuaW1wb3J0IEVFIGZyb20gJ2V2ZW50ZW1pdHRlcjMnO1xuXG4vKiogQ2xhc3MgcmVwcmVzZW50aW5nIGEgbWFpbiBkaXNwYXRjaGVyIGZvciB3ZWJvcy5cbiAqICBAZXh0ZW5kcyBFdmVudEVtbWl0ZXIzXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlzcGF0Y2hlciBleHRlbmRzIEVFIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICBsb2coJ0Rpc3BhdGNoZXIgQ3JlYXRlJyk7XG4gIH1cbn0iLCIvKipcbiAqIENvbGxlY3Rpb24gZm9yIG1ha2UgZGlmZmVyZW50IGFwcHMgY29sbGVjdGlvbi5cbiAqIEBtb2R1bGUgY29yZS9jb2xsZWN0aW9uL2NvbGxlY3Rpb25cbiAqIEBzZWUgbW9kdWxlOmNvcmUvYXBwc1xuICovXG5cbmltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5cbmNvbnN0IGxvZyA9IGRlYnVnKCdjb2xsZWN0aW9uOmxvZycpO1xuXG5pZiAoRU5WICE9ICdwcm9kdWN0aW9uJykge1xuICBkZWJ1Zy5lbmFibGUoKTtcbn0gZWxzZSB7XG4gIGRlYnVnLmRpc2FibGUoKTtcbn1cblxuLyoqIENsYXNzIENvbGxlY3Rpb24gcmVwcmVzZW50aW5nIGEgYXBwbGljYXRpb25zIGNvbGxlY3Rpb24uICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvbGxlY3Rpb24ge1xuICAvKipcbiAgICogQ3JlYXRlIGEgZGlzcGF0Y2hlciBhbmQgY29sbGVjdGlvbih0eXBlIEFycmF5KVxuICAgKiBAcGFyYW0geyBEaXNwYXRjaGVyIH0gZGlzcGF0Y2hlciAtIFRoZSBtYWluIGRpc3BhdGNoZXIuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihkaXNwYXRjaGVyKSB7XG4gICAgdGhpcy5kaXNwYXRjaGVyID0gZGlzcGF0Y2hlcjtcbiAgICB0aGlzLmNvbGxlY3Rpb24gPSBbXTtcbiAgICBsb2coJ0NyZWF0ZSBDb2xsZWN0aW9uJyk7XG4gIH1cblxuICAvKiogXG4gICAqIEdldCBhcHBsaWNhdGlvbiBieSBVVUlEIGZyb20gJ3RoaXMuY29sbGVjdGlvbidcbiAgICogQHBhcmFtIHsgc3RyaW5nIH0gdXVpZCAtIGFwcGxpY2F0aW9uIHV1aWRcbiAgICogQHJldHVybiB7IG9iamVjdCB9IGFwcGxpY2F0aW9uXG4gICAqL1xuXG4gIGdldEJ5VXVpZCh1dWlkKSB7XG4gICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbi5maW5kKGFwcCA9PiBhcHAuX191dWlkID09IHV1aWQpO1xuICB9XG5cbiAgLyoqIFxuICAgKiBHZXQgYXBwbGljYXRpb24gYnkgTkFNRSBmcm9tICd0aGlzLmNvbGxlY3Rpb24nXG4gICAqIEBwYXJhbSB7IHN0cmluZyB9IG5hbWUgLSBhcHBsaWNhdGlvbiBuYW1lXG4gICAqIEByZXR1cm4geyBvYmplY3QgfSBhcHBsaWNhdGlvblxuICAgKi9cblxuICBnZXRCeU5hbWUobmFtZSkge1xuICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb24uZmluZChhcHAgPT4gYXBwLm5hbWUgPT0gbmFtZSk7XG4gIH1cblxuICAvKiogXG4gICAqIEFkZCBhcGxpY2F0aW9uIHByb3h5IGluICd0aGlzLmNvbGxlY3Rpb24nXG4gICAqIEBwYXJhbSB7IHByb3h5IG9iamVjdCB9IHByb3h5XG4gICAqL1xuXG4gIHB1c2gocHJveHkpIHtcbiAgICBsZXQgaXNOb3RVbmlxdWUgPSB0aGlzLmdldEJ5VXVpZChwcm94eS5fX3V1aWQpO1xuICAgIGlmIChpc05vdFVuaXF1ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEdWJsaWNhdGUgYXBwbGljYXRpb24gdXVpZCcpO1xuICAgIH1cbiAgICBpc05vdFVuaXF1ZSA9IHRoaXMuZ2V0QnlOYW1lKHByb3h5Lm5hbWUpO1xuICAgIGlmIChpc05vdFVuaXF1ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdEdWJsaWNhdGUgYXBwbGljYXRpb24gbmFtZScpO1xuICAgIH1cbiAgICB0aGlzLmNvbGxlY3Rpb24ucHVzaChwcm94eSk7XG4gIH1cblxuICAvKiogXG4gICAqIFJlbW92ZSBhcGxpY2F0aW9uIHByb3h5IGZyb20gJ3RoaXMuY29sbGVjdGlvbidcbiAgICogQHBhcmFtIHsgcHJveHkgb2JqZWN0IH0gcHJveHlcbiAgICovXG5cbiAgcmVtb3ZlRnJvbUNvbGxlY3Rpb24ocHJveHkpIHtcbiAgICBsZXQgY3VycmVudEFwcCA9IHRoaXMuZ2V0QnlOYW1lKHByb3h5Lm5hbWUpO1xuICAgIHRoaXMuY29sbGVjdGlvbi5zcGxpY2UodGhpcy5jb2xsZWN0aW9uLmluZGV4T2YoY3VycmVudEFwcCksIDEpO1xuICB9XG5cbiAgLyoqIFxuICAgKiBSZW1vdmUgYXBsaWNhdGlvbiBwcm94eSBmcm9tICd0aGlzLmNvbGxlY3Rpb24nXG4gICAqIGFuZCBtYWtlIGV2ZW50ICdyZW1vdmU6YXBwOmZyb206bWFpbicgZm9yXG4gICAqIHJlbW92ZSBhcHBsaWNhdGlvbiBmcm9tIG90aGVyIGNvbGxlY3Rpb25zLlxuICAgKiBAcGFyYW0geyBwcm94eSBvYmplY3QgfSBwcm94eVxuICAgKi9cblxuICByZW1vdmUoYXBwKSB7XG4gICAgdGhpcy5yZW1vdmVGcm9tQ29sbGVjdGlvbihhcHApO1xuICAgIHRoaXMuZGlzcGF0Y2hlci5lbWl0KCdyZW1vdmU6YXBwOmZyb206bWFpbicsIGFwcCk7XG4gIH1cbn0iLCIvKipcbiAqIENvbGxlY3Rpb24gZm9yIGRpY2sgQXBwcy5cbiAqIEBtb2R1bGUgY29yZS9jb2xsZWN0aW9uL2FjdGl2ZUFwcHNcbiAqIEBzZWUgbW9kdWxlOmNvcmUvYXBwc1xuICovXG5cbmltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5cbmNvbnN0IGxvZyA9IGRlYnVnKCdhcHA6bG9nJyk7XG5cbmlmIChFTlYgIT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGRlYnVnLmVuYWJsZSgpO1xufSBlbHNlIHtcbiAgZGVidWcuZGlzYWJsZSgpO1xufVxuXG5pbXBvcnQgQ29sbGVjdGlvbiBmcm9tICcuL2NvbGxlY3Rpb24uanMnO1xuXG4vKipcbiAqIENsYXNzIERvY2tBcHBzIHJlcHJlc2VudGluZyBhIGFwcGxpY2F0aW9ucyBjb2xsZWN0aW9uLCB0aGF0IG11c3Qgc2hvdyBpbiBkb2NrIHBhbmVsLlxuICogQGV4dGVuZHMgQ29sbGVjdGlvblxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERvY2tBcHBzIGV4dGVuZHMgQ29sbGVjdGlvbiB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBkaXNwYXRjaGVyXG4gICAqIEBwYXJhbSB7IERpc3BhdGNoZXIgfSBkaXNwYXRjaGVyIC0gVGhlIG1haW4gZGlzcGF0Y2hlci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGRpc3BhdGNoZXIpIHtcbiAgICBzdXBlcihkaXNwYXRjaGVyKTtcbiAgICB0aGlzLnJlbW92ZSA9IHRoaXMucmVtb3ZlRnJvbUNvbGxlY3Rpb247XG4gICAgdGhpcy5kaXNwYXRjaGVyLm9uKCdyZW1vdmU6YXBwOmZyb206bWFpbicsIHRoaXMucmVtb3ZlLCB0aGlzKTtcbiAgICBsb2coJ0NyZWF0ZSBEb2NrIEFwcHMgQ29sbGVjdGlvbicpO1xuICB9XG4gIC8qKiBcbiAgICogQWRkIGFwbGljYXRpb24gcHJveHkgaW4gJ3RoaXMuY29sbGVjdGlvbidcbiAgICogVXNlIHN1cGVyLnB1c2hcbiAgICogQW5kIG1ha2UgZXZlbnQgJ2NyZWF0ZTphcHA6aW46ZG9jaycgZm9yIHNob3cgYXBwbGljYXRpb24gZG9jayBwYW5lbFxuICAgKiBAcGFyYW0geyBwcm94eSBvYmplY3QgfSBwcm94eVxuICAgKi9cblxuICBwdXNoKHByb3h5KSB7XG4gICAgc3VwZXIucHVzaChwcm94eSk7XG5cbiAgICB0aGlzLmRpc3BhdGNoZXIuZW1pdCgnY3JlYXRlOmFwcDppbjpkb2NrJywge1xuICAgICAgYXBwOiB0aGlzLmdldEJ5TmFtZShwcm94eS5uYW1lKVxuICAgIH0pO1xuICB9XG59IiwiLyoqXG4gKiBDb2xsZWN0aW9uIGZvciBBY3RpdmUgQXBwcy5cbiAqIEBtb2R1bGUgY29yZS9jb2xsZWN0aW9uL2FjdGl2ZUFwcHNcbiAqIEBzZWUgbW9kdWxlOmNvcmUvYXBwc1xuICovXG5cbmltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5cbmNvbnN0IGxvZyA9IGRlYnVnKCdhY3RpdmUgYXBwczpsb2cnKTtcblxuaWYgKEVOViAhPSAncHJvZHVjdGlvbicpIHtcbiAgZGVidWcuZW5hYmxlKCk7XG59IGVsc2Uge1xuICBkZWJ1Zy5kaXNhYmxlKCk7XG59XG5cbmltcG9ydCBDb2xsZWN0aW9uIGZyb20gJy4vY29sbGVjdGlvbi5qcyc7XG5cbi8qKlxuICogQ2xhc3MgQWN0aXZlQXBwcyByZXByZXNlbnRpbmcgYW4gYWN0aXZlIGFwcGxpY2F0aW9ucyBjb2xsZWN0aW9uLlxuICogQGV4dGVuZHMgQ29sbGVjdGlvblxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFjdGl2ZUFwcHMgZXh0ZW5kcyBDb2xsZWN0aW9uIHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhIGRpc3BhdGNoZXJcbiAgICogQHBhcmFtIHsgRGlzcGF0Y2hlciB9IGRpc3BhdGNoZXIgLSBUaGUgbWFpbiBkaXNwYXRjaGVyLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZGlzcGF0Y2hlcikge1xuICAgIHN1cGVyKGRpc3BhdGNoZXIpO1xuICAgIHRoaXMucmVtb3ZlID0gdGhpcy5yZW1vdmVGcm9tQ29sbGVjdGlvbjtcbiAgICB0aGlzLmRpc3BhdGNoZXIub24oJ3JlbW92ZTphcHA6ZnJvbTptYWluJywgdGhpcy5yZW1vdmUsIHRoaXMpO1xuICAgIGxvZygnQ3JlYXRlIEFjdGl2ZSBBcHBzIENvbGxlY3Rpb24nKTtcbiAgfVxuXG4gIC8qKiBcbiAgICogQWRkIGFwbGljYXRpb24gcHJveHkgaW4gJ3RoaXMuY29sbGVjdGlvbidcbiAgICogVXNlIHN1cGVyLnB1c2hcbiAgICogQW5kIG1ha2UgZXZlbnQgJ29wZW46YXBwJ1xuICAgKiBAcGFyYW0geyBwcm94eSBvYmplY3QgfSBwcm94eVxuICAgKi9cblxuICBwdXNoKHByb3h5KSB7XG4gICAgc3VwZXIucHVzaChwcm94eSk7XG5cbiAgICB0aGlzLmRpc3BhdGNoZXIuZW1pdCgnb3BlbjphcHAnLCB7XG4gICAgICBhcHA6IHByb3h5XG4gICAgfSk7XG4gIH1cbn0iLCIvKipcbiAqIERlZmF1bHQgaGFuZGxlciBmb3IgUHJveHlpbmcuXG4gKiBAbW9kdWxlIGxpYnMvYXBwLnByb3h5LmhhbmRsZXJcbiAqIEBzZWUgbW9kdWxlOmxpYnMvcHJveHlpbmdcbiAqL1xuXG4vKiogQ2xhc3MgcmVwcmVzZW50aW5nIGEgZGVmYXVsdCBoYW5kbGVyIGZvciBhcHBsaWNhdGlvbnMgUHJveHlpbmcuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcHBQcm94eUhhbmRsZXIge1xuICAvKipcbiAgICogR2V0dGVyLlxuICAgKiBAcmV0dXJuIHsgYW55IH0gdGFyZ2V0W3Byb3BdIC0gUmV0dXJuIHRydWUgd2hlbiB0cnkgdG8gZ2V0ICd1dWlkLlxuICAgKi9cbiAgZ2V0KHRhcmdldCwgcHJvcCkge1xuICAgIGlmIChwcm9wID09ICdfX3V1aWQnKSB7XG4gICAgICByZXR1cm4gdGFyZ2V0LnV1aWQ7XG4gICAgfVxuICAgIGlmIChwcm9wID09ICd1dWlkJykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXRbcHJvcF07XG4gIH1cblxuICAvKipcbiAgICogU2V0dGVyLlxuICAgKiBAcmV0dXJuIHsgYW55IH0gdmFsdWVcbiAgICovXG5cbiAgc2V0KHRhcmdldCwgcHJvcCwgdmFsdWUpIHtcbiAgICBpZiAocHJvcCA9PSAndXVpZCcgfHwgcHJvcCA9PSAnbmFtZScpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91IGNhblxcJ3QgY2hhbmdlIFxcJ3V1aWRcXCcgb3IgXFwnbmFtZVxcJycpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0YXJnZXRbcHJvcF0gPSB2YWx1ZTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGRlbGV0ZVByb3BlcnR5KHRhcmdldCwgcHJvcCkge1xuICAgIGlmIChwcm9wID09ICd1dWlkJyB8fCBwcm9wID09ICduYW1lJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3UgY2FuXFwndCBkZWxldGUgXFwndXVpZFxcJyBvciBcXCduYW1lXFwnJyk7XG4gICAgfVxuICB9XG59IiwiLyoqXG4gKiBNb2R1bGUgZm9yIFByb3h5aW5nLlxuICogQG1vZHVsZSBsaWJzL3Byb3h5aW5nXG4gKi9cblxuaW1wb3J0IEFwcFByb3h5SGFuZGxlciBmcm9tICcuL2FwcC5wcm94eS5oYW5kbGVyLmpzJztcblxuLyoqXG4gKiBXcmFwIG9uIHByb3h5IG9iamVjdC5cbiAqIEBwYXJhbSB7IG9iamVjdCB9IGFwcCAtIFRoZSBhcHBsaWNhdGlvbiB3aGljaCBtdXN0IHdyYXAgb24gcHJveHkgb2JqZWN0LlxuICogQHBhcmFtIHsgT2JqZWN0IH0gb3B0aW9ucyAtIFRoZSBvcHRpb25zIHdoaWNoIGNhbiBjb250YWluIHByb3h5IGhhbmRsZXIuXG4gKiBAcmV0dXJuIHsgUHJveHkgb2JqZWN0IH0gLSBQcm94eSBvYmplY3Qgd2l0aCBjdXJyZW50IGFwcGxpY2F0aW9uIGFuZCBoYW5kbGVyIGZyb21cbiAqIG9wdGlvbnMgb3IgZGVmYXVsdCAoQHNlZSBtb2R1bGU6bGlicy9hcHAucHJveHkuaGFuZGxlcilcbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwcm94eWluZyhhcHAsIG9wdGlvbnMpIHtcbiAgbGV0IGhhbmRsZXI7XG4gIGlmICghb3B0aW9ucyB8fCAob3B0aW9ucyAmJiAhb3B0aW9ucy5oYW5kbGVyKSkge1xuICAgIC8vIGRlZmF1bHQgaGFuZGxlclxuICAgIGhhbmRsZXIgPSBuZXcgQXBwUHJveHlIYW5kbGVyO1xuICB9IGVsc2UgaWYgKG9wdGlvbnMuaGFuZGxlcikge1xuICAgIGhhbmRsZXIgPSBPYmplY3QuYXNzaWduKG5ldyBBcHBQcm94eUhhbmRsZXIsIG9wdGlvbnMuaGFuZGxlcik7XG4gIH1cbiAgcmV0dXJuIG5ldyBQcm94eShhcHAsIGhhbmRsZXIpO1xufVxuIiwiLyoqXG4gKiBXZWJvcyBBcHBsaWNhdGlvbi5cbiAqIEBtb2R1bGUgY29yZS9hcHBcbiAqIEBzZWUgbW9kdWxlOmNvcmUvaW5pdFxuICovXG5cbmltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5cbmNvbnN0IGxvZyA9IGRlYnVnKCd3ZWJvcy1hcHA6bG9nJyk7XG5cbmlmIChFTlYgIT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGRlYnVnLmVuYWJsZSgpO1xufSBlbHNlIHtcbiAgZGVidWcuZGlzYWJsZSgpO1xufVxuXG5pbXBvcnQgcHJveHlpbmcgZnJvbSAnLi4vbGlicy9wcm94eWluZy5qcyc7XG5cbi8qKiBDbGFzcyBBcHAgcmVwcmVzZW50aW5nIGEgd2Vib3MgYXBwbGljYXRpb24uICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwcCB7XG4gIC8qKlxuICAgKiBcbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAvLyBmdW5jdGlvbiAncHJveHlpbmcnIGNhbiBnZXQgc2Vjb25kIGFyZ3VtZW50IHdoaWNoIHlvdXIgY3VzdG9tXG4gICAgLy8gUHJveHkgaGFuZGxlclxuICAgIC8vIFRPRE8gOjo6IENyZWF0ZSByZXN0cmljdGluZyBsb2dpYyBmb3IgbWFyZ2UgY3VzdG9tIGFuZFxuICAgIC8vIGRlZmF1bHQgUHJveHkgaGFuZGxlclxuICAgIC8vID0+IHNlZSA6OjogL2xpYnMvcHJveHlpbmcuanNcbiAgICB0aGlzLmFwcCA9IHByb3h5aW5nKG9wdGlvbnMsIG51bGwpO1xuICAgIGxvZygnQ3JlYXRlIHdlYm9zIGFwcCcpO1xuICB9XG59XG4iLCIvKipcbiAqIENhbGN1bGF0b3IgQXBwbGljYXRpb25zLlxuICogQG1vZHVsZSBjb3JlL2FwcHMvY2FsY3VsYXRvclxuICogQHNlZSBtb2R1bGU6Y29yZS9hcHBzXG4gKi9cblxuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcblxuY29uc3QgbG9nID0gZGVidWcoJ2NhbGN1bGF0b3ItYXBwOmxvZycpO1xuXG5pZiAoRU5WICE9ICdwcm9kdWN0aW9uJykge1xuICBkZWJ1Zy5lbmFibGUoKTtcbn0gZWxzZSB7XG4gIGRlYnVnLmRpc2FibGUoKTtcbn1cblxuaW1wb3J0IEFwcCBmcm9tICcuLi9jb3JlL2FwcC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENhbGN1bGF0b3IgZXh0ZW5kcyBBcHAge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcih7XG4gICAgICBuYW1lOiAnQ2FsY3VsYXRvcicsXG4gICAgICBkb2NrQXBwOiB0cnVlLFxuICAgICAgY29tcG9uZW50UGF0aDogJy9jb21wb25lbnRzL3dlYm9zLWNvbXBvbmVudHMvd2Vib3MtY2FsY3VsYXRvci90Lmh0bWwnLFxuICAgICAgZWxlbU5hbWU6ICd3ZWJvcy1jYWxjdWxhdG9yJ1xuICAgIH0pO1xuICB9XG59IiwiLyoqXG4gKiBUZXJtaW5hbCBBcHBsaWNhdGlvbnMuXG4gKiBAbW9kdWxlIGNvcmUvYXBwcy90ZXJtaW5hbFxuICogQHNlZSBtb2R1bGU6Y29yZS9hcHBzXG4gKi9cblxuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcblxuY29uc3QgbG9nID0gZGVidWcoJ2NhbGN1bGF0b3ItYXBwOmxvZycpO1xuXG5pZiAoRU5WICE9ICdwcm9kdWN0aW9uJykge1xuICBkZWJ1Zy5lbmFibGUoKTtcbn0gZWxzZSB7XG4gIGRlYnVnLmRpc2FibGUoKTtcbn1cblxuaW1wb3J0IEFwcCBmcm9tICcuLi9jb3JlL2FwcC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRlcm1pbmFsIGV4dGVuZHMgQXBwIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoe1xuICAgICAgbmFtZTogJ1Rlcm1pbmFsJyxcbiAgICAgIGRvY2tBcHA6IHRydWUsXG4gICAgICB1dWlkOiAnNzgnLFxuICAgICAgY29tcG9uZW50UGF0aDogJy9jb21wb25lbnRzL3dlYm9zLWNvbXBvbmVudHMvd2Vib3MtdGVybWluYWwvdC5odG1sJyxcbiAgICAgIGVsZW1OYW1lOiAnd2Vib3MtdGVybWluYWwnXG4gICAgfSk7XG4gIH1cbn0iLCIvKipcbiAqIERlZmF1bHQgQXBwbGljYXRpb25zLlxuICogQG1vZHVsZSBjb3JlL2FwcHMvZGVmYXVsdHNcbiAqIEBzZWUgbW9kdWxlOmNvcmUvYXBwc1xuICovXG5cbmltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5cbmNvbnN0IGxvZyA9IGRlYnVnKCdkZWZhdWx0LWFwcHM6bG9nJyk7XG5cbmlmIChFTlYgIT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGRlYnVnLmVuYWJsZSgpO1xufSBlbHNlIHtcbiAgZGVidWcuZGlzYWJsZSgpO1xufVxuXG5pbXBvcnQgQ2FsY3VsYXRvciBmcm9tICcuL2NhbGN1bGF0b3IuanMnO1xuXG5pbXBvcnQgVGVybWluYWwgZnJvbSAnLi90ZXJtaW5hbC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IFtcbiAgKG5ldyBDYWxjdWxhdG9yKS5hcHAsXG4gIChuZXcgVGVybWluYWwpLmFwcFxuXTtcbiIsIi8qKlxuICogQXBwbGljYXRpb25zIENvbGxlY3Rpb24uXG4gKiBAbW9kdWxlIGNvcmUvYXBwc1xuICogQHNlZSBtb2R1bGU6Y29yZS9pbml0XG4gKi9cblxuaW1wb3J0IGRlYnVnIGZyb20gJ2RlYnVnJztcblxuY29uc3QgbG9nID0gZGVidWcoJ3dlYm9zLWFwcHM6bG9nJyk7XG4vLyBEaXNhYmxlIGxvZ2dpbmcgaW4gcHJvZHVjdGlvblxuaWYgKEVOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGRlYnVnLmVuYWJsZSgnKicpO1xufSBlbHNlIHtcbiAgZGVidWcuZGlzYWJsZSgpO1xufVxuXG5pbXBvcnQgQ29sbGVjdGlvbiAgICAgZnJvbSAnLi9jb2xsZWN0aW9ucy9jb2xsZWN0aW9uLmpzJztcblxuaW1wb3J0IERvY2tBcHBzICAgICAgIGZyb20gJy4vY29sbGVjdGlvbnMvZG9ja0FwcHMuanMnO1xuXG5pbXBvcnQgQWN0aXZlQXBwcyAgICAgZnJvbSAnLi9jb2xsZWN0aW9ucy9hY3RpdmVBcHBzLmpzJztcblxuaW1wb3J0IGRlZmF1bHRBcHBzICAgIGZyb20gJy4uL2FwcHMvZGVmYXVsdHMuanMnO1xuXG4vKiogQ2xhc3MgQXBwcyByZXByZXNlbnRpbmcgYSB3ZWJvcyBhcHBsaWNhdGlvbnMgY29sbGVjdGlvbi4gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXBwcyB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBkaXNwYXRjaGVyLCBuYW1lLCBhbGxBcHBzLCBhY3RpdmVBcHBzLCBkb2NrQXBwcyBhbmQgY2FsbCBfaW5zdGFsbExpc3RlbmVycy5cbiAgICogQHBhcmFtIHsgRGlzcGF0Y2hlciB9IGRpc3BhdGNoZXIgLSBUaGUgbWFpbiBkaXNwYXRjaGVyLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZGlzcGF0Y2hlcikge1xuICAgIHRoaXMuZGlzcGF0Y2hlciA9IGRpc3BhdGNoZXI7XG4gICAgdGhpcy5uYW1lICAgICAgID0gJ3dlYm9zLWFwcC1jb2xsZWN0aW9uJztcbiAgICB0aGlzLmFsbEFwcHMgICAgPSBuZXcgQ29sbGVjdGlvbih0aGlzLmRpc3BhdGNoZXIpO1xuICAgIHRoaXMuZG9ja0FwcHMgICA9IG5ldyBEb2NrQXBwcyh0aGlzLmRpc3BhdGNoZXIpO1xuICAgIHRoaXMuYWN0aXZlQXBwcyA9IG5ldyBBY3RpdmVBcHBzKHRoaXMuZGlzcGF0Y2hlcik7XG4gICAgdGhpcy5faW5zdGFsbExpc3RlbmVycygpO1xuICAgIGxvZygnQ3JlYXRlIHdlYm9zIGFwcHMnKTtcbiAgfVxuICAvKipcbiAgICogU2V0IHRoZSBsaXN0ZW5lcnMuXG4gICAqL1xuICBfaW5zdGFsbExpc3RlbmVycygpIHtcbiAgICB0aGlzLmRpc3BhdGNoZXIub24oJ2FwcDp0b3VjaCcsICAgICAgICAgICAgICAgdGhpcy50b3VjaEFwcCwgICAgIHRoaXMpO1xuICAgIHRoaXMuZGlzcGF0Y2hlci5vbigncmVhZHk6Y29tcG9uZW50OmFwcExpc3QnLCB0aGlzLnJlYWR5QXBwTGlzdCwgdGhpcyk7XG4gICAgdGhpcy5kaXNwYXRjaGVyLm9uKCdjbG9zZTphcHAnLCAgICAgICAgICAgICAgIHRoaXMuY2xvc2VBcHAsICAgICB0aGlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGRlZmF1bHQgYXBwbGljYXRpb25zLlxuICAgKi9cbiAgaW5pdGlhbGl6ZUFwcHMoKSB7XG4gICAgZGVmYXVsdEFwcHMuZm9yRWFjaChhcHAgPT4ge1xuICAgICAgdGhpcy5hbGxBcHBzLnB1c2goYXBwKTtcblxuICAgICAgLy8gaWYgYXBwbGljYXRpb24gaGF2ZSBkb2NrQXBwIGZsYWcgaW4gJ3RydWUnXG4gICAgICAvLyB0aGF0IGFwcGxpY2F0aW9uIGFkZCB0byBkb2NrQXBwcyBjb2xsZWN0aW9uXG4gICAgICAvLyBhbmQgd2lsbCBzaG93IGluICdkb2NrJyBwYW5lbFxuXG4gICAgICBpZiAoYXBwLmRvY2tBcHApIHtcbiAgICAgICAgdGhpcy5kb2NrQXBwcy5wdXNoKGFwcCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogV2hlbiByZWFkeSBhcHBsaWNhdGlvbiBsaXN0IGNvbXBvbmVudCAoZG9jayBwYW5lbCkgXG4gICAqIHNldCB0aGUgZGVmYXVsdCBhcHBsaWNhdGlvbnMuXG4gICAqL1xuICByZWFkeUFwcExpc3QoKSB7XG4gICAgdGhpcy5pbml0aWFsaXplQXBwcygpO1xuICB9XG5cbiAgLyoqIFxuICAgKiBDYWxsZWQgd2hlbiB1c2VyIHRvdWNoIGFwcGxpY2F0aW9uIGljb25cbiAgICogSW4gYXBwbGljYXRpb24gbGlzdChkb2NrKVxuICAgKiBAcGFyYW0geyBvYmplY3QgfSBvcHRpb25zXG4gICAqLyAgXG5cbiAgdG91Y2hBcHAob3B0aW9ucykge1xuICAgIGxldCBhcHAgPSB0aGlzLmFsbEFwcHMuZ2V0QnlOYW1lKG9wdGlvbnMubmFtZSk7XG4gICAgaWYgKGFwcCkge1xuICAgICAgaWYgKCF0aGlzLmFjdGl2ZUFwcHMuZ2V0QnlOYW1lKGFwcC5uYW1lKSkge1xuICAgICAgICB0aGlzLmFjdGl2ZUFwcHMucHVzaChhcHApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vua25vd24gYXBwbGljYXRpb24nKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZUFwcChvcHRpb25zKSB7XG4gICAgbGV0IGFwcCA9IHRoaXMuYWxsQXBwcy5nZXRCeU5hbWUob3B0aW9ucy5hcHAubmFtZSk7XG4gICAgaWYgKGFwcCkge1xuICAgICAgdGhpcy5hY3RpdmVBcHBzLnJlbW92ZShhcHAubmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndW5rbm93biBhcHBsaWNhdGlvbicpO1xuICAgIH1cbiAgfVxufSIsIi8qKlxuICogTW9kdWxlIGZvciBtYWtlIHdvcmtlciBzb3VyY2UuXG4gKiBAbW9kdWxlIGxpYnMvd29ya2VyU291cmNlLm1ha2VyXG4gKiBAc2VlIG1vZHVsZTpjb3JlL3Byb2Nlc3NcbiAqL1xuXG4vKiogQ2xhc3MgcmVwcmVzZW50aW5nIGEgd29ya2VyIHNvdXJjZSBtYWtlci4gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFrZVdvcmtlclNvdXJjZSB7XG4gIC8qKlxuICAgKiBDaGVjayBvcHRpb25zIGFuZCBjYWxsICd3b3JrZXJTb3VyY2UnIG1ldGhvZC5cbiAgICogQHBhcmFtIHsgb2JqZWN0IH0gb3B0aW9ucyAtIE9wdGlvbnMgZm9yIHdvcmtlciBib2R5LiBDYW4gY29udGFpbiB3b3JrZXIgZGVwZW5kZW5jeSBhbmQgZm4uXG4gICAqL1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIGlmIChvcHRpb25zLmRlcHMpIHtcbiAgICAgIHRoaXMuZGVwcyA9IG9wdGlvbnMuZGVwcy5qb2luKCcsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGVwcyA9ICcnO1xuICAgIH1cblxuICAgIHRoaXMuZGVwcyA9IFwiXFwnXCIgKyB0aGlzLmRlcHMgKyBcIlxcJ1wiO1xuICAgIHRoaXMud29ya2VyU291cmNlKCk7XG4gIH1cblxuICAvKipcbiAgICogTWFrZSB3b3JrZXIgc291cmNlLlxuICAgKiBAcmV0dXJuIHsgRnVuY3Rpb24gfVxuICAgKi9cblxuICB3b3JrZXJTb3VyY2UoKSB7XG4gICAgLy8gVE9ETyA6OjogT3B0aW1pemUgdGhpcyBjYXNlXG4gICAgcmV0dXJuIEZ1bmN0aW9uKFxuICAgICAgYFxuICAgICAgaW1wb3J0U2NyaXB0cygke3RoaXMuZGVwc30pO1xuICAgICAgbGV0IGZuID0gJHt0aGlzLm9wdGlvbnMuZm59O1xuICAgICAgZm4oKTtcbiAgICAgIGBcbiAgICApO1xuICB9XG59IiwiLyoqXG4gKiBUaGUgcHJvY2VzcyBmb3Igd2Vib3MuXG4gKiBAbW9kdWxlIGNvcmUvcHJvY2Vzc1xuICovXG5pbXBvcnQgZGVidWcgZnJvbSAnZGVidWcnO1xuXG5pbXBvcnQgTWFrZVdvcmtlclNvdXJjZSBmcm9tICcuLi9saWJzL3dvcmtlclNvdXJjZS5tYWtlci5qcyc7XG5cbmNvbnN0IGxvZyA9IGRlYnVnKCdwcm9jZXNzOmxvZycpO1xuLy8gRGlzYWJsZSBsb2dnaW5nIGluIHByb2R1Y3Rpb25cbmlmIChFTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICBkZWJ1Zy5lbmFibGUoJyonKTtcbn0gZWxzZSB7XG4gIGRlYnVnLmRpc2FibGUoKTtcbn1cblxuLyoqIENsYXNzIHJlcHJlc2VudGluZyBhIHByb2Nlc3MgZm9yIHdlYm9zLiAqL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm9jZXNzIHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhIGRpc3BhdGNoZXIsIHByb2Nlc3NlcyBhbmQgX2luc3RhbGxMaXN0ZW5lcnMuXG4gICAqIEBwYXJhbSB7IERpc3BhdGNoZXIgfSBkaXNwYXRjaGVyIC0gVGhlIG1haW4gZGlzcGF0Y2hlci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGRpc3BhdGNoZXIpIHtcbiAgICB0aGlzLmRpc3BhdGNoZXIgPSBkaXNwYXRjaGVyO1xuICAgIHRoaXMucHJvY2Vzc2VzID0gW107XG4gICAgbG9nKCdydW4gUHJvY2VzcyBjbGFzcycpO1xuICAgIHRoaXMuX2luc3RhbGxMaXN0ZW5lcnMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGxpc3RlbmVycy5cbiAgICovXG5cbiAgX2luc3RhbGxMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5kaXNwYXRjaGVyLm9uKCdjcmVhdGU6bmV3OnByb2Nlc3MnLCB0aGlzLm5ld1Byb2Nlc3MsIHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ldGhvZCBmb3IgY3JlYXRlIG5ldyBwcm9jZXNzIGluIHdlYm9zLlxuICAgKiBAcGFyYW0geyBvYmplY3QgfSBwcm9jZXNzQm9keSAtIFByb2Nlc3MgYm9keSBjYW4gY29udGFpbiBwcm9jZXNzIGRlcGVuZGVuY2llcyBhbmQgZm5cbiAgICogQHBhcmFtIHsgb2JqZWN0IH0gb3B0aW9ucyAtIG9wdGlvbnMgY2FuIGNvbnRhaW4gb25tZXNzYWdlIGFuZCBvbmVycm9yIGNhbGxiYWNrcyBhbmQgdGVybWluYXRlIGZsYWdcbiAgICogQHJldHVybiB7IHdvcmtlciBvYmplY3QgfSB3b3JrZXIgLSByZXR1cm4gJ3J1bldvcmtlcicgbWV0aG9kIHdpdGggJ3Byb2Nlc3NCb2R5LCBvcHRpb25zLCB0cnVlJ1xuICAgKiBUaGUgM3RoIHBhcmFtIGluICdydW5Xb3JrZXInIG1ldGhvZCBpcyBwcm9taXNpZnkgZmxhZy4gRGlmZmVyZW50IGJldHdlZW4gJ2NyZWF0ZScgYW5kICduZXdQcm9jZXNzJ1xuICAgKiBpcyB0aGVpcnMgcmV0dXJuZWQgdmFsdWUuIE5PVEXWiSAnbmV3UHJvY2VzcycgbWV0aG9kIG5vdGhpbmcgcmV0dXJuZWQuIFxuICAgKi9cblxuICBjcmVhdGUocHJvY2Vzc0JvZHksIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy5ydW5Xb3JrZXIocHJvY2Vzc0JvZHksIG9wdGlvbnMsIHRydWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ldGhvZCBmb3IgY3JlYXRlIG5ldyBwcm9jZXNzIGluIHdlYm9zLlxuICAgKiBAcGFyYW0geyBvYmplY3QgfSBwcm9jZXNzQm9keSAtIFByb2Nlc3MgYm9keSBjYW4gY29udGFpbiBwcm9jZXNzIGRlcGVuZGVuY2llcyBhbmQgZm5cbiAgICogQHBhcmFtIHsgb2JqZWN0IH0gb3B0aW9ucyAtIG9wdGlvbnMgY2FuIGNvbnRhaW4gb25tZXNzYWdlIGFuZCBvbmVycm9yIGNhbGxiYWNrcyBhbmQgdGVybWluYXRlIGZsYWdcbiAgICovXG5cbiAgbmV3UHJvY2Vzcyhwcm9jZXNzQm9keSwgb3B0aW9ucykge1xuICAgIHRoaXMucnVuV29ya2VyKHByb2Nlc3NCb2R5LCBvcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXRob2QgZm9yIGNyZWF0ZSBuZXcgcHJvY2VzcyBpbiB3ZWJvcy5cbiAgICogQHBhcmFtIHsgb2JqZWN0IH0gcHJvY2Vzc0JvZHkgLSBQcm9jZXNzIGJvZHkgY2FuIGNvbnRhaW4gcHJvY2VzcyBkZXBlbmRlbmNpZXMgYW5kIGZuXG4gICAqIEBwYXJhbSB7IG9iamVjdCB9IG9wdGlvbnMgLSBvcHRpb25zIGNhbiBjb250YWluIG9ubWVzc2FnZSBhbmQgb25lcnJvciBjYWxsYmFja3MgYW5kIHRlcm1pbmF0ZSBmbGFnXG4gICAqL1xuXG4gIHJ1bldvcmtlcihwcm9jZXNzQm9keSwgb3B0aW9ucywgcHJvbWlzaWZ5KSB7XG4gICAgbGV0IHdvcmtlcjtcbiAgICBpZiAoIXByb2Nlc3NCb2R5IHx8IChwcm9jZXNzQm9keSAmJiAhcHJvY2Vzc0JvZHkuZm4pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgXG4gICAgICAgIFdpdGggJ2NyZWF0ZTpuZXc6cHJvY2VzcycgZXZlbnQgeW91IHNob3VsZCBzZW5kIHByb2Nlc3NCb2R5XG4gICAgICAgIGV4LlxuICAgICAgICAuLi5kaXNwYXRjaGVyLmVtaXQoXG4gICAgICAgICAgICAnY3JlYXRlOm5ldzpwcm9jZXNzJywgLy8gb3Igd2ViT3MucHJvY2Vzcy5jcmVhdGUoLi4uKTtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgZGVwczogQXJyYXkgOjo6IChvcHRpb25hbCkgOjo6IEluIHRoaXMgY2FzZSB5b3Ugc2hvdWxkIHdyaXRlIGFsbCBkZXBlbmRlbmN5IHBhdGhzLFxuICAgICAgICAgICAgICBmbjogRnVuY3Rpb24gOjo6IChyZXF1aXJlcykgOjo6IEl0IGlzIHRoaXMgZnVuY3Rpb24gd2l0Y2ggd2lsbCBydW4gaW4gbmV3IHByb2Nlc3MgICAgICAgICAgXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBvbm1lc3NhZ2U6IEZ1bmN0aW9uIDo6OiAob3B0aW9uYWwpIDo6OiBJdCBpcyB3b3JrZXIgb25tZXNzYWdlIGNhbGxiYWNrLFxuICAgICAgICAgICAgICBvbmVycm9yOiBGdW5jdGlvbiA6OjogKG9wdGlvbmFsKSA6OjogaXQgaXMgd29ya2VyIG9uZXJyb3IgY2FsbGJhY2ssXG4gICAgICAgICAgICAgIHRlcm1pbmF0ZTogQm9vbGVhbiA6OjogKG9wdGlvbmFsKSA6OjogZGVmYXVsdCA9PiBmYWxzZSA6OjogSWYgdGhpcyBmbGFnIGlzIHRydWUgYW5kXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeW91IGhhdmUgb25tZXNzYWdlIHRoZW4gYWZ0ZXIgcHJvY2VzcyBqb2IgaXQgd2lsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlIHRlcm1pbmF0ZWQsIGJ1dCB3aGVuIHlvdSBoYXZuJ3Qgb25tZXNzYWdlIGFuZCB3YW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVybWluYXRlIHByb2Nlc3MgeW91IGNhbiBraWxsIGl0IHlvdXJzZWxmIGluIGZuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sgOilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApXG4gICAgICBgKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBwcm9jZXNzQm9keS5mbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAnZm4nIGluIG5ldyBwcm9jZXNzIHNob3VsZCBiZSBGdW5jdGlvbmApO1xuICAgIH0gZWxzZSBpZiAocHJvY2Vzc0JvZHkuZGVwcyAmJiAhQXJyYXkuaXNBcnJheShwcm9jZXNzQm9keS5kZXBzKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGAnZGVwcycgaW4gbmV3IHByb2Nlc3Mgc2hvdWxkIGJlIEFycmF5YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCB3b3JrZXJTb3VyY2UgPSBuZXcgTWFrZVdvcmtlclNvdXJjZShwcm9jZXNzQm9keSkud29ya2VyU291cmNlKCk7XG5cbiAgICAgIGxldCBjb2RlID0gd29ya2VyU291cmNlLnRvU3RyaW5nKCk7XG5cbiAgICAgIGNvZGUgPSBjb2RlLnN1YnN0cmluZyhjb2RlLmluZGV4T2YoJ3snKSArIDEsIGNvZGUubGFzdEluZGV4T2YoJ30nKSk7XG5cbiAgICAgIGxldCBibG9iID0gbmV3IEJsb2IoW2NvZGVdLCB7dHlwZTogJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnfSk7XG4gICAgICB3b3JrZXIgPSBuZXcgV29ya2VyKFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikpO1xuICAgICAgLy8gY3JlYXRlIGluIHByb2Nlc3Nlc1xuICAgICAgdGhpcy5wcm9jZXNzZXMucHVzaCh3b3JrZXIpO1xuXG4gICAgICBpZiAob3B0aW9ucy5vbm1lc3NhZ2UpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLm9ubWVzc2FnZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGlmIChvcHRpb25zLnRlcm1pbmF0ZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLnRlcm1pbmF0ZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICAgIHdvcmtlci5vbm1lc3NhZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLm9ubWVzc2FnZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIHdvcmtlci50ZXJtaW5hdGUoKTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJ3Rlcm1pbmF0ZScgaW4gbmV3IHByb2Nlc3Mgc2hvdWxkIGJlIEJvb2xlYW5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd29ya2VyLm9ubWVzc2FnZSA9IG9wdGlvbnMub25tZXNzYWdlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCdvbm1lc3NhZ2UnIGluIG5ldyBwcm9jZXNzIHNob3VsZCBiZSBGdW5jdGlvbmApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zLm9uZXJyb3IpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zLm9uZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB3b3JrZXIub25lcnJvciA9IG9wdGlvbnMub25lcnJvcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCdvbmVycm9yJyBpbiBuZXcgcHJvY2VzcyBzaG91bGQgYmUgRnVuY3Rpb25gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwcm9taXNpZnkgJiYgd29ya2VyKSB7XG4gICAgICByZXR1cm4gd29ya2VyO1xuICAgIH1cbiAgfVxufSIsIi8qKlxuICogTWFpbiBjb3JlIG1vZHVsZS5cbiAqIEBtb2R1bGUgY29yZS9pbml0XG4gKi9cbmltcG9ydCBEaXNwYXRjaGVyIGZyb20gJy4vZGlzcGF0Y2hlci5qcyc7XG5cbmltcG9ydCBBcHBzIGZyb20gJy4vYXBwcy5qcyc7XG5cbmltcG9ydCBQcm9jZXNzIGZyb20gJy4vcHJvY2Vzcyc7XG5cbmxldCB3ZWJPcyA9IHt9O1xuXG53ZWJPcy5kaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXI7XG5cbndlYk9zLmFwcHMgPSBuZXcgQXBwcyh3ZWJPcy5kaXNwYXRjaGVyKTtcblxud2ViT3MucHJvY2VzcyA9IG5ldyBQcm9jZXNzKHdlYk9zLmRpc3BhdGNoZXIpO1xuXG5PYmplY3QuZnJlZXplKHdlYk9zKTtcblxuZXhwb3J0IGRlZmF1bHQgd2ViT3M7IiwiLy8gQWRkIGEgZGVidWdnZXJcbmltcG9ydCBkZWJ1ZyBmcm9tICdkZWJ1Zyc7XG5cbmNvbnN0IGxvZyA9IGRlYnVnKCdhcHA6bG9nJyk7XG4vLyBEaXNhYmxlIGxvZ2dpbmcgaW4gcHJvZHVjdGlvblxuaWYgKEVOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIGRlYnVnLmVuYWJsZSgnKicpO1xuXG4gIC8vIEZvciBsaXZlIHJlbG9hZFxuICBkb2N1bWVudC53cml0ZSgnPHNjcmlwdCBzcmM9XCJodHRwOi8vJyArIChsb2NhdGlvbi5ob3N0IHx8ICdsb2NhbGhvc3QnKS5zcGxpdCgnOicpWzBdICtcbiAgJzozNTcyOS9saXZlcmVsb2FkLmpzP3NuaXB2ZXI9MVwiPjwvJyArICdzY3JpcHQ+Jyk7XG59IGVsc2Uge1xuICBkZWJ1Zy5kaXNhYmxlKCk7XG59XG5cbmxvZygnOjo6IEFwcCBTdGFydCA6OjonKTtcblxuaW1wb3J0IHdlYk9zIGZyb20gJy4vY29yZS9pbml0Jztcblxud2luZG93LndlYk9zID0gd2ViT3M7XG5cbi8vIEltcG9ydCBzdHlsZXNcbmltcG9ydCAnLi4vY3NzL21haW4uY3NzJztcblxuLy8gdGVzdCBmb3IgY3JlYXRlIGFwcGxpY2F0aW9uXG4vLyB3ZWJPcy5kaXNwYXRjaGVyLmVtaXQoJ2NyZWF0ZTpuZXc6YXBwJywge1xuLy8gICBhcHA6IHtcbi8vICAgICBuYW1lOiAnd2Vib3MtdGVybWluYWwnLFxuLy8gICAgIHV1aWQ6ICcyMmUxZCdcbi8vICAgfVxuLy8gfSk7XG5cbi8vIHRlc3QgZm9yIGNyZWF0ZSBhcHBsaWNhdGlvblxuLy8gd2ViT3MuZGlzcGF0Y2hlci5lbWl0KCdjcmVhdGU6bmV3OmFwcCcsIHtcbi8vICAgYXBwOiB7XG4vLyAgICAgbmFtZTogJ3dlYm9zLXRlcm1pbmFsLWZhY2UnLFxuLy8gICAgIHV1aWQ6ICczMXF3YScsXG4vLyAgICAgLy8gdGVzdFxuLy8gICAgIHByb2Nlc3M6IHtcbi8vICAgICAgIG5ldzogdHJ1ZSxcbi8vICAgICAgIC8vIC4uLi5cbi8vICAgICB9XG4vLyAgIH1cbi8vIH0pO1xuXG4vLyB0ZXN0IGZvciByZW1vdmUgYXBwbGljYXRpb25cbi8vIHdlYk9zLmFwcHMucmVtb3ZlQXBwKHtcbi8vICAgYXBwOiB7XG4vLyAgICAgdXVpZDogJzIyZTFkJ1xuLy8gICB9XG4vLyB9KTtcblxuLy8gdGVzdCBmb3IgY3JlYXRlIG5ldyBwcm9jZXNzIHdpdGggZGVwZW5kZWNpZXMsXG4vLyBmdWNudGlvbiBhbmQgb25tZXNzYWdlIGNhbGxiYWNrLlxuLy8gZm9yIC4uLmRpc3BhdGNoZXIuZW1pdCgnY3JlYXRlOm5ldzpwcm9jZXNzJywgLi4uKSBcbndlYk9zLmRpc3BhdGNoZXIuZW1pdChcbiAgJ2NyZWF0ZTpuZXc6cHJvY2VzcycsXG4gIC8vIHByb2Nlc3MgYm9keVxuICB7XG4gICAgZGVwczogWydodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy91bmRlcnNjb3JlLmpzLzEuOC4zL3VuZGVyc2NvcmUtbWluLmpzJ10sXG4gICAgZm46ICgpID0+IHtcbiAgICAgIGxldCBhcnIgPSBbXTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTAwMDAwMDsgaSsrKSB7XG4gICAgICAgIGFyci5wdXNoKGkpO1xuICAgICAgfVxuICAgICAgbGV0IG9kZHMgPSBfLmZpbHRlcihhcnIsIChpdGVtKSA9PiB7XG4gICAgICAgIGlmIChpdGVtICUgMiAhPSAwKSB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBwb3N0TWVzc2FnZSh7b2Rkczogb2Rkc30pO1xuXG4gICAgICAvLyB0aGlzIGV4YW1wbGUgZm9yIGltcGxlbWVudGF0aW9uIHByb2Nlc3Mgd29yayBmcm9tIGRldnRvb2xzIGJ5IHdlYk9zLnByb2Nlc3MucXVldWVcbiAgICAgIC8vIGZvciByZXByb2R1Y2UgdGhpcyB3cml0ZSB0aGlzIGxpbmUgaW4gZGV2dG9vbHNcbiAgICAgIC8vIHdlYk9zLnByb2Nlc3MucXVldWVbMF0ucG9zdE1lc3NhZ2UoWzEsIDIsIDMsIDRdKTtcbiAgICAgIC8vIE5PVEUg1onWidaJIFBsZWFzZSBiZSBhdHRlbnRpdmUgaXQgd2lsbCBiZSB3b3JrIHdoZW4gdGVybWluYXRlIGZsYWcgaXMgZmFsc2UgXG5cbiAgICAgIG9ubWVzc2FnZSA9IChlKSA9PiB7XG4gICAgICAgIGxldCByZXN1bHQgPSBfLmZpbHRlcihlLmRhdGEsIChpdGVtKSA9PiB7XG4gICAgICAgICAgaWYgKGl0ZW0gJSAyID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcG9zdE1lc3NhZ2Uoe2V2ZW5zOiByZXN1bHR9KTtcbiAgICAgIH07XG4gICAgfVxuICB9LFxuICAvLyBvcHRpb25zXG4gIHtcbiAgICAvLyBvbm1lc3NhZ2VcbiAgICBvbm1lc3NhZ2UoZSkge1xuICAgICAgbG9nKCdGcm9tIGFub3RoZXIgcHJvY2VzcyA6OjogJywgZS5kYXRhKTtcbiAgICB9LFxuICAgIC8vIG9uZXJyb3JcbiAgICBvbmVycm9yKGVycikge1xuICAgICAgbG9nKCdGcm9tIGFub3RoZXIgcHJvY2VzcyA6OjogJywgZXJyKTtcbiAgICB9LFxuXG4gICAgdGVybWluYXRlOiBmYWxzZVxuICB9XG4pO1xuXG4vLyB0ZXN0IGZvciBjcmVhdGUgbmV3IHByb2Nlc3Mgd2l0aCBkZXBlbmRlY2llcyxcbi8vIGZ1Y250aW9uIGFuZCBvbm1lc3NhZ2UgY2FsbGJhY2suXG4vLyBmb3Igd2ViT3MucHJvY2Vzcy5jcmVhdGUoLi4uKVxud2ViT3MucHJvY2Vzcy5jcmVhdGUoXG4gIC8vIHByb2Nlc3MgYm9keVxuICB7XG4gICAgZGVwczogWydodHRwczovL2NkbmpzLmNsb3VkZmxhcmUuY29tL2FqYXgvbGlicy91bmRlcnNjb3JlLmpzLzEuOC4zL3VuZGVyc2NvcmUtbWluLmpzJ10sXG4gICAgZm46ICgpID0+IHtcbiAgICAgIGxldCBhcnIgPSBbXTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTAwMDAwMDsgaSsrKSB7XG4gICAgICAgIGFyci5wdXNoKGkpO1xuICAgICAgfVxuICAgICAgbGV0IG9kZHMgPSBfLmZpbHRlcihhcnIsIChpdGVtKSA9PiB7XG4gICAgICAgIGlmIChpdGVtICUgMiAhPSAwKSB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBwb3N0TWVzc2FnZSh7b2Rkczogb2Rkc30pO1xuXG4gICAgICAvLyB0aGlzIGV4YW1wbGUgZm9yIGltcGxlbWVudGF0aW9uIHByb2Nlc3Mgd29yayBmcm9tIGRldnRvb2xzIGJ5IHdlYk9zLnByb2Nlc3MucXVldWVcbiAgICAgIC8vIGZvciByZXByb2R1Y2UgdGhpcyB3cml0ZSB0aGlzIGxpbmUgaW4gZGV2dG9vbHNcbiAgICAgIC8vIHdlYk9zLnByb2Nlc3MucXVldWVbMF0ucG9zdE1lc3NhZ2UoWzEsIDIsIDMsIDRdKTtcbiAgICAgIC8vIE5PVEUg1onWidaJIFBsZWFzZSBiZSBhdHRlbnRpdmUgaXQgd2lsbCBiZSB3b3JrIHdoZW4gdGVybWluYXRlIGZsYWcgaXMgZmFsc2UgXG5cbiAgICAgIG9ubWVzc2FnZSA9IChlKSA9PiB7XG4gICAgICAgIGxldCByZXN1bHQgPSBfLmZpbHRlcihlLmRhdGEsIChpdGVtKSA9PiB7XG4gICAgICAgICAgaWYgKGl0ZW0gJSAyID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcG9zdE1lc3NhZ2Uoe2V2ZW5zOiByZXN1bHR9KTtcbiAgICAgIH07XG4gICAgfVxuICB9LFxuICAvLyBvcHRpb25zXG4gIHtcbiAgICAvLyBvbm1lc3NhZ2VcbiAgICBvbm1lc3NhZ2UoZSkge1xuICAgICAgbG9nKCdGcm9tIGFub3RoZXIgcHJvY2VzcyA6OjogJywgZS5kYXRhKTtcbiAgICB9LFxuICAgIC8vIG9uZXJyb3JcbiAgICBvbmVycm9yKGVycikge1xuICAgICAgbG9nKCdGcm9tIGFub3RoZXIgcHJvY2VzcyA6OjogJywgZXJyKTtcbiAgICB9LFxuXG4gICAgdGVybWluYXRlOiBmYWxzZVxuICB9XG4pO1xuXG4vLyBDcmVhdGUgbWFpbiB3b3JrZXJzXG4vLyAuLi5cblxuLy8gVGVzdCBmb3IgbmV3IGFwcGxpY2F0aW9uIHdpdGggYW5vdGhlciBwcm9jZXNzIGNhbGMgbG9naWNcbi8vIC4uLiJdLCJuYW1lcyI6WyJyZXF1aXJlJCQwIiwiaW5kZXgiLCJsb2ciLCJkZWJ1ZyIsIkVFIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUlBLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQTtBQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7QUFDZCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO0FBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQUNkLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQmxCLFNBQWMsR0FBRyxVQUFVLEdBQUcsRUFBRSxPQUFPLEVBQUU7RUFDdkMsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUE7RUFDdkIsSUFBSSxJQUFJLEdBQUcsT0FBTyxHQUFHLENBQUE7RUFDckIsSUFBSSxJQUFJLEtBQUssUUFBUSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0lBQ3ZDLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQztHQUNsQixNQUFNLElBQUksSUFBSSxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssS0FBSyxFQUFFO0lBQ3BELE9BQU8sT0FBTyxDQUFDLElBQUk7R0FDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQztHQUNaLFFBQVEsQ0FBQyxHQUFHLENBQUM7R0FDYjtFQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsdURBQXVELEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUMvRixDQUFBOzs7Ozs7Ozs7O0FBVUQsU0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFO0VBQ2xCLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUE7RUFDakIsSUFBSSxHQUFHLENBQUMs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LE1BQU07TUFDdEIsSUFBSTtNQUNKLENBQUMsQ0FBQzs7RUFFTixJQUFJLFNBQVMsQ0FBQyxFQUFFLEVBQUU7SUFDaEIsSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOztJQUU5RSxRQUFRLEdBQUc7TUFDVCxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUM7TUFDMUQsS0FBSyxDQUFDLEVBQUUsT0FBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztNQUM5RCxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztNQUNsRSxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUM7TUFDdEUsS0FBSyxDQUFDLEVBQUUsT0FBTyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztNQUMxRSxLQUFLLENBQUMsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQztLQUMvRTs7SUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO01BQ2xELElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzVCOztJQUVELFNBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7R0FDN0MsTUFBTTtJQUNMLElBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNO1FBQ3pCLENBQUMsQ0FBQzs7SUFFTixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtNQUMzQixJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7O01BRXBGLFFBQVEsR0FBRztRQUNULEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDMUQsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDOUQsS0FBSyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNO1FBQ2xFLEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDdEU7VUFDRSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0QsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7V0FDNUI7O1VBRUQsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztPQUNyRDtLQUNGO0dBQ0Y7O0VBRUQsT0FBTyxJQUFJLENBQUM7Q0FDYixDQUFDOzs7Ozs7Ozs7OztBQVdGLFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLFNBQVMsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFO0VBQzFELElBQUksUUFBUSxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLElBQUksSUFBSSxDQUFDO01BQ3RDLEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7O0VBRTFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztPQUNyRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDNUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7O0VBRXZELE9BQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQzs7Ozs7Ozs7Ozs7QUFXRixZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRTtFQUM5RCxJQUFJLFFBQVEsR0FBRyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxJQUFJLElBQUksRUFBRSxJQUFJLENBQUM7TUFDNUMsR0FBRyxHQUFHLE1BQU0sR0FBRyxNQUFNLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQzs7RUFFMUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO09BQ3JFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztPQUM1RCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQzs7RUFFdkQsT0FBTyxJQUFJLENBQUM7Q0FDYixDQUFDOzs7Ozs7Ozs7Ozs7QUFZRixZQUFZLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxTQUFTLGNBQWMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7RUFDeEYsSUFBSSxHQUFHLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDOztFQUUxQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLElBQUksQ0FBQztFQUNwQyxJQUFJLENBQUMsRUFBRSxFQUFFO0lBQ1AsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztTQUN0RCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDOUIsT0FBTyxJQUFJLENBQUM7R0FDYjs7RUFFRCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztFQUVsQyxJQUFJLFNBQVMsQ0FBQyxFQUFFLEVBQUU7SUFDaEI7U0FDSyxTQUFTLENBQUMsRUFBRSxLQUFLLEVBQUU7VUFDbEIsQ0FBQyxJQUFJLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQztVQUN4QixDQUFDLE9BQU8sSUFBSSxTQUFTLENBQUMsT0FBTyxLQUFLLE9BQU8sQ0FBQztNQUM5QztNQUNBLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7V0FDdEQsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQy9CO0dBQ0YsTUFBTTtJQUNMLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sR0FBRyxFQUFFLEVBQUUsTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtNQUN2RTtXQUNLLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRTtZQUNyQixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzNCLE9BQU8sSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxLQUFLLE9BQU8sQ0FBQztRQUNoRDtRQUNBLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDM0I7S0FDRjs7Ozs7SUFLRCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO1NBQzNFLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7U0FDM0QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0dBQy9COztFQUVELE9BQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQzs7Ozs7Ozs7O0FBU0YsWUFBWSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsR0FBRyxTQUFTLGtCQUFrQixDQUFDLEtBQUssRUFBRTtFQUM3RSxJQUFJLEdBQUcsQ0FBQzs7RUFFUixJQUFJLEtBQUssRUFBRTtJQUNULEdBQUcsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDdEMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO01BQ3JCLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksTUFBTSxFQUFFLENBQUM7V0FDdEQsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQy9CO0dBQ0YsTUFBTTtJQUNMLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztJQUM1QixJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztHQUN2Qjs7RUFFRCxPQUFPLElBQUksQ0FBQztDQUNiLENBQUM7Ozs7O0FBS0YsWUFBWSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUM7QUFDbkUsWUFBWSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7Ozs7O0FBSy9ELFlBQVksQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFHLFNBQVMsZUFBZSxHQUFHO0VBQ2xFLE9BQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQzs7Ozs7QUFLRixZQUFZLENBQUMsUUFBUSxHQUFHLE1BQU0sQ0FBQzs7Ozs7QUFLL0IsWUFBWSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7Ozs7O0FBS3pDLEFBQUksQUFBNkIsQUFBRTtFQUNqQyxjQUFjLEdBQUcsWUFBWSxDQUFDO0NBQy9COzs7QUN0VEQ7Ozs7QUFJQSxBQUVBLE1BQU1FLEtBQUcsR0FBR0MsU0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7O0FBRXBDLEFBQUksQUFBb0IsQUFBRTtFQUN4QkEsU0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNuQixBQUVBOztBQUVELEFBTUEsQUFBZSxNQUFNLFVBQVUsU0FBU0MsT0FBRSxDQUFDO0VBQ3pDLFdBQVcsR0FBRztJQUNaLEtBQUssRUFBRSxDQUFDO0lBQ1JGLEtBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0dBQzFCOzs7QUN4Qkg7Ozs7OztBQU1BLEFBRUEsTUFBTUEsS0FBRyxHQUFHQyxTQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7QUFFcEMsQUFBSSxBQUFtQixBQUFFO0VBQ3ZCQSxTQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7Q0FDaEIsQUFFQTs7OztBQUlELEFBQWUsTUFBTSxVQUFVLENBQUM7Ozs7O0VBSzlCLFdBQVcsQ0FBQyxVQUFVLEVBQUU7SUFDdEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDN0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDckJELEtBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0dBQzFCOzs7Ozs7OztFQVFELFNBQVMsQ0FBQyxJQUFJLEVBQUU7SUFDZCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxDQUFDO0dBQ3hEOzs7Ozs7OztFQVFELFNBQVMsQ0FBQyxJQUFJLEVBQUU7SUFDZCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDO0dBQ3REOzs7Ozs7O0VBT0QsSUFBSSxDQUFDLEtBQUssRUFBRTtJQUNWLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9DLElBQUksV0FBVyxFQUFFO01BQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0tBQy9DO0lBQ0QsV0FBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pDLElBQUksV0FBVyxFQUFFO01BQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0tBQy9DO0lBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDN0I7Ozs7Ozs7RUFPRCxvQkFBb0IsQ0FBQyxLQUFLLEVBQUU7SUFDMUIsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7R0FDaEU7Ozs7Ozs7OztFQVNELE1BQU0sQ0FBQyxHQUFHLEVBQUU7SUFDVixJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDL0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxDQUFDLENBQUM7R0FDbkQ7OztBQ3RGSDs7Ozs7O0FBTUEsQUFFQSxNQUFNQSxLQUFHLEdBQUdDLFNBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFN0IsQUFBSSxBQUFtQixBQUFFO0VBQ3ZCQSxTQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7Q0FDaEIsQUFFQTs7QUFFRCxBQU9BLEFBQWUsTUFBTSxRQUFRLFNBQVMsVUFBVSxDQUFDOzs7OztFQUsvQyxXQUFXLENBQUMsVUFBVSxFQUFFO0lBQ3RCLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNsQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztJQUN4QyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlERCxLQUFHLENBQUMsNkJBQTZCLENBQUMsQ0FBQztHQUNwQzs7Ozs7Ozs7RUFRRCxJQUFJLENBQUMsS0FBSyxFQUFFO0lBQ1YsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzs7SUFFbEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUU7TUFDekMsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztLQUNoQyxDQUFDLENBQUM7R0FDSjs7O0FDL0NIOzs7Ozs7QUFNQSxBQUVBLE1BQU1BLEtBQUcsR0FBR0MsU0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7O0FBRXJDLEFBQUksQUFBbUIsQUFBRTtFQUN2QkEsU0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0NBQ2hCLEFBRUE7O0FBRUQsQUFPQSxBQUFlLE1BQU0sVUFBVSxTQUFTLFVBQVUsQ0FBQzs7Ozs7RUFLakQsV0FBVyxDQUFDLFVBQVUsRUFBRTtJQUN0QixLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUM7SUFDeEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM5REQsS0FBRyxDQUFDLCtCQUErQixDQUFDLENBQUM7R0FDdEM7Ozs7Ozs7OztFQVNELElBQUksQ0FBQyxLQUFLLEVBQUU7SUFDVixLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDOztJQUVsQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7TUFDL0IsR0FBRyxFQUFFLEtBQUs7S0FDWCxDQUFDLENBQUM7R0FDSjs7O0FDaERIOzs7Ozs7O0FBT0EsQUFBZSxNQUFNLGVBQWUsQ0FBQzs7Ozs7RUFLbkMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUU7SUFDaEIsSUFBSSxJQUFJLElBQUksUUFBUSxFQUFFO01BQ3BCLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQztLQUNwQjtJQUNELElBQUksSUFBSSxJQUFJLE1BQU0sRUFBRTtNQUNsQixPQUFPLElBQUksQ0FBQztLQUNiO0lBQ0QsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDckI7Ozs7Ozs7RUFPRCxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUU7SUFDdkIsSUFBSSxJQUFJLElBQUksTUFBTSxJQUFJLElBQUksSUFBSSxNQUFNLEVBQUU7TUFDcEMsTUFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO0tBQzNELE1BQU07TUFDTCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO01BQ3JCLE9BQU8sSUFBSSxDQUFDO0tBQ2I7R0FDRjs7RUFFRCxjQUFjLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRTtJQUMzQixJQUFJLElBQUksSUFBSSxNQUFNLElBQUksSUFBSSxJQUFJLE1BQU0sRUFBRTtNQUNwQyxNQUFNLElBQUksS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7S0FDM0Q7R0FDRjs7O0FDeENIOzs7OztBQUtBLEFBVUEsQUFBZSxTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFO0VBQzdDLElBQUksT0FBTyxDQUFDO0VBQ1osSUFBSSxDQUFDLE9BQU8sS0FBSyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7O0lBRTdDLE9BQU8sR0FBRyxJQUFJLGVBQWUsQ0FBQztHQUMvQixNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRTtJQUMxQixPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLGVBQWUsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDL0Q7RUFDRCxPQUFPLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztDQUNoQzs7QUN4QkQ7Ozs7OztBQU1BLEFBRUEsTUFBTUEsS0FBRyxHQUFHQyxTQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7O0FBRW5DLEFBQUksQUFBbUIsQUFBRTtFQUN2QkEsU0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0NBQ2hCLEFBRUE7O0FBRUQsQUFJQSxBQUFlLE1BQU0sR0FBRyxDQUFDOzs7O0VBSXZCLFdBQVcsQ0FBQyxPQUFPLEVBQUU7Ozs7OztJQU1uQixJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbkNELEtBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0dBQ3pCO0NBQ0Y7O0FDakNEOzs7Ozs7QUFNQSxBQUVBLE1BQU1BLEtBQUcsR0FBR0MsU0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7O0FBRXhDLEFBQUksQUFBbUIsQUFBRTtFQUN2QkEsU0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0NBQ2hCLEFBRUE7O0FBRUQsQUFFQSxBQUFlLE1BQU0sVUFBVSxTQUFTLEdBQUcsQ0FBQztFQUMxQyxXQUFXLEdBQUc7SUFDWixLQUFLLENBQUM7TUFDSixJQUFJLEVBQUUsWUFBWTtNQUNsQixPQUFPLEVBQUUsSUFBSTtNQUNiLGFBQWEsRUFBRSxzREFBc0Q7TUFDckUsUUFBUSxFQUFFLGtCQUFrQjtLQUM3QixDQUFDLENBQUM7R0FDSjs7O0FDMUJIOzs7Ozs7QUFNQSxBQUVBLE1BQU1ELEtBQUcsR0FBR0MsU0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7O0FBRXhDLEFBQUksQUFBbUIsQUFBRTtFQUN2QkEsU0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0NBQ2hCLEFBRUE7O0FBRUQsQUFFQSxBQUFlLE1BQU0sUUFBUSxTQUFTLEdBQUcsQ0FBQztFQUN4QyxXQUFXLEdBQUc7SUFDWixLQUFLLENBQUM7TUFDSixJQUFJLEVBQUUsVUFBVTtNQUNoQixPQUFPLEVBQUUsSUFBSTtNQUNiLElBQUksRUFBRSxJQUFJO01BQ1YsYUFBYSxFQUFFLG9EQUFvRDtNQUNuRSxRQUFRLEVBQUUsZ0JBQWdCO0tBQzNCLENBQUMsQ0FBQztHQUNKOzs7QUMzQkg7Ozs7OztBQU1BLEFBRUEsTUFBTUQsS0FBRyxHQUFHQyxTQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7QUFFdEMsQUFBSSxBQUFtQixBQUFFO0VBQ3ZCQSxTQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7Q0FDaEIsQUFFQTs7QUFFRCxBQUVBLEFBRUEsa0JBQWU7RUFDYixDQUFDLElBQUksVUFBVSxFQUFFLEdBQUc7RUFDcEIsQ0FBQyxJQUFJLFFBQVEsRUFBRSxHQUFHO0NBQ25CLENBQUM7O0FDdkJGOzs7Ozs7QUFNQSxBQUVBLE1BQU1ELEtBQUcsR0FBR0MsU0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7O0FBRXBDLEFBQUksQUFBb0IsQUFBRTtFQUN4QkEsU0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNuQixBQUVBOztBQUVELEFBRUEsQUFFQSxBQUVBLEFBSUEsQUFBZSxNQUFNLElBQUksQ0FBQzs7Ozs7RUFLeEIsV0FBVyxDQUFDLFVBQVUsRUFBRTtJQUN0QixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztJQUM3QixJQUFJLENBQUMsSUFBSSxTQUFTLHNCQUFzQixDQUFDO0lBQ3pDLElBQUksQ0FBQyxPQUFPLE1BQU0sSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2xELElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2hELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2xELElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ3pCRCxLQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztHQUMxQjs7OztFQUlELGlCQUFpQixHQUFHO0lBQ2xCLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFdBQVcsZ0JBQWdCLElBQUksQ0FBQyxRQUFRLE1BQU0sSUFBSSxDQUFDLENBQUM7SUFDdkUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN2RSxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxXQUFXLGdCQUFnQixJQUFJLENBQUMsUUFBUSxNQUFNLElBQUksQ0FBQyxDQUFDO0dBQ3hFOzs7OztFQUtELGNBQWMsR0FBRztJQUNmLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJO01BQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzs7Ozs7TUFNdkIsSUFBSSxHQUFHLENBQUMsT0FBTyxFQUFFO1FBQ2YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7T0FDekI7S0FDRixDQUFDLENBQUM7R0FDSjs7Ozs7O0VBTUQsWUFBWSxHQUFHO0lBQ2IsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0dBQ3ZCOzs7Ozs7OztFQVFELFFBQVEsQ0FBQyxPQUFPLEVBQUU7SUFDaEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQy9DLElBQUksR0FBRyxFQUFFO01BQ1AsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUN4QyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUMzQjtLQUNGLE1BQU07TUFDTCxNQUFNLElBQUksS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7S0FDeEM7R0FDRjs7RUFFRCxRQUFRLENBQUMsT0FBTyxFQUFFO0lBQ2hCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbkQsSUFBSSxHQUFHLEVBQUU7TUFDUCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDbEMsTUFBTTtNQUNMLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztLQUN4QztHQUNGOzs7QUNsR0g7Ozs7Ozs7O0FBUUEsQUFBZSxNQUFNLGdCQUFnQixDQUFDOzs7Ozs7RUFNcEMsV0FBVyxDQUFDLE9BQU8sRUFBRTtJQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUN2QixJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUU7TUFDaEIsSUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNwQyxNQUFNO01BQ0wsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7S0FDaEI7O0lBRUQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDcEMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0dBQ3JCOzs7Ozs7O0VBT0QsWUFBWSxHQUFHOztJQUViLE9BQU8sUUFBUTtNQUNiLENBQUM7b0JBQ2EsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO2VBQ2pCLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7O01BRTNCLENBQUM7S0FDRixDQUFDO0dBQ0g7OztBQ3hDSDs7OztBQUlBLEFBRUEsQUFFQSxNQUFNQSxNQUFHLEdBQUdDLFNBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFakMsQUFBSSxBQUFvQixBQUFFO0VBQ3hCQSxTQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ25CLEFBRUE7Ozs7QUFJRCxBQUFlLE1BQU0sT0FBTyxDQUFDOzs7OztFQUszQixXQUFXLENBQUMsVUFBVSxFQUFFO0lBQ3RCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ3BCRCxNQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUN6QixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztHQUMxQjs7Ozs7O0VBTUQsaUJBQWlCLEdBQUc7SUFDbEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztHQUNqRTs7Ozs7Ozs7Ozs7RUFXRCxNQUFNLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRTtJQUMzQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztHQUNuRDs7Ozs7Ozs7RUFRRCxVQUFVLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRTtJQUMvQixJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztHQUN0Qzs7Ozs7Ozs7RUFRRCxTQUFTLENBQUMsV0FBVyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUU7SUFDekMsSUFBSSxNQUFNLENBQUM7SUFDWCxJQUFJLENBQUMsV0FBVyxLQUFLLFdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsRUFBRTtNQUNwRCxNQUFNLElBQUksS0FBSztNQUNmLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFtQkQsQ0FBQyxDQUFDLENBQUM7S0FDSixNQUFNLElBQUksT0FBTyxXQUFXLENBQUMsRUFBRSxLQUFLLFVBQVUsRUFBRTtNQUMvQyxNQUFNLElBQUksS0FBSyxDQUFDLENBQUMsc0NBQXNDLENBQUMsQ0FBQyxDQUFDO0tBQzNELE1BQU0sSUFBSSxXQUFXLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7TUFDL0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLHFDQUFxQyxDQUFDLENBQUMsQ0FBQztLQUMxRCxNQUFNO01BQ0wsSUFBSSxZQUFZLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQzs7TUFFcEUsSUFBSSxJQUFJLEdBQUcsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDOztNQUVuQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7O01BRXBFLElBQUksSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO01BQzlELE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7O01BRS9DLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztNQUU1QixJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7UUFDckIsSUFBSSxPQUFPLE9BQU8sQ0FBQyxTQUFTLEtBQUssVUFBVSxFQUFFO1VBQzNDLElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRTtZQUNyQixJQUFJLE9BQU8sT0FBTyxDQUFDLFNBQVMsS0FBSyxTQUFTLEVBQUU7Y0FDMUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxXQUFXO2dCQUM1QixPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ3pDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztlQUNwQixDQUFDO2FBQ0gsTUFBTTtjQUNMLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDLENBQUM7YUFDakU7V0FDRixNQUFNO1lBQ0wsTUFBTSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO1dBQ3RDO1NBQ0YsTUFBTTtVQUNMLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDLENBQUM7U0FDbEU7T0FDRjs7TUFFRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7UUFDbkIsSUFBSSxPQUFPLE9BQU8sQ0FBQyxPQUFPLEtBQUssVUFBVSxFQUFFO1VBQ3pDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztTQUNsQyxNQUFNO1VBQ0wsTUFBTSxJQUFJLEtBQUssQ0FBQyxDQUFDLDJDQUEyQyxDQUFDLENBQUMsQ0FBQztTQUNoRTtPQUNGO0tBQ0Y7O0lBRUQsSUFBSSxTQUFTLElBQUksTUFBTSxFQUFFO01BQ3ZCLE9BQU8sTUFBTSxDQUFDO0tBQ2Y7R0FDRjs7O0FDMUlIOzs7O0FBSUEsQUFFQSxBQUVBLEFBRUEsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDOztBQUVmLEtBQUssQ0FBQyxVQUFVLEdBQUcsSUFBSSxVQUFVLENBQUM7O0FBRWxDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUV4QyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFOUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxBQUVyQjs7OztBQ3BCQTtBQUNBLEFBRUEsTUFBTUEsTUFBRyxHQUFHQyxTQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRTdCLEFBQUksQUFBb0IsQUFBRTtFQUN4QkEsU0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7O0VBR2xCLFFBQVEsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLFdBQVcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3BGLG9DQUFvQyxHQUFHLFNBQVMsQ0FBQyxDQUFDO0NBQ25ELEFBRUE7O0FBRURELE1BQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDOztBQUV6QixBQUVBLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDOzs7QUFHckIsQUFpQ0EsS0FBSyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0VBQ25CLG9CQUFvQjs7RUFFcEI7SUFDRSxJQUFJLEVBQUUsQ0FBQyw4RUFBOEUsQ0FBQztJQUN0RixFQUFFLEVBQUUsTUFBTTtNQUNSLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztNQUNiLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDaEMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUNiO01BQ0QsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEtBQUs7UUFDakMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtVQUNqQixPQUFPLElBQUksQ0FBQztTQUNiO09BQ0YsQ0FBQyxDQUFDOztNQUVILFdBQVcsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDOzs7Ozs7O01BTzFCLFNBQVMsR0FBRyxDQUFDLENBQUMsS0FBSztRQUNqQixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUs7VUFDdEMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNqQixPQUFPLElBQUksQ0FBQztXQUNiO1NBQ0YsQ0FBQyxDQUFDOztRQUVILFdBQVcsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO09BQzlCLENBQUM7S0FDSDtHQUNGOztFQUVEOztJQUVFLFNBQVMsQ0FBQyxDQUFDLEVBQUU7TUFDWEEsTUFBRyxDQUFDLDJCQUEyQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMxQzs7SUFFRCxPQUFPLENBQUMsR0FBRyxFQUFFO01BQ1hBLE1BQUcsQ0FBQywyQkFBMkIsRUFBRSxHQUFHLENBQUMsQ0FBQztLQUN2Qzs7SUFFRCxTQUFTLEVBQUUsS0FBSztHQUNqQjtDQUNGLENBQUM7Ozs7O0FBS0YsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNOztFQUVsQjtJQUNFLElBQUksRUFBRSxDQUFDLDhFQUE4RSxDQUFDO0lBQ3RGLEVBQUUsRUFBRSxNQUFNO01BQ1IsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO01BQ2IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUNoQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO09BQ2I7TUFDRCxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksS0FBSztRQUNqQyxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1VBQ2pCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7T0FDRixDQUFDLENBQUM7O01BRUgsV0FBVyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7Ozs7Ozs7TUFPMUIsU0FBUyxHQUFHLENBQUMsQ0FBQyxLQUFLO1FBQ2pCLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksS0FBSztVQUN0QyxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2pCLE9BQU8sSUFBSSxDQUFDO1dBQ2I7U0FDRixDQUFDLENBQUM7O1FBRUgsV0FBVyxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7T0FDOUIsQ0FBQztLQUNIO0dBQ0Y7O0VBRUQ7O0lBRUUsU0FBUyxDQUFDLENBQUMsRUFBRTtNQUNYQSxNQUFHLENBQUMsMkJBQTJCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzFDOztJQUVELE9BQU8sQ0FBQyxHQUFHLEVBQUU7TUFDWEEsTUFBRyxDQUFDLDJCQUEyQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQ3ZDOztJQUVELFNBQVMsRUFBRSxLQUFLO0dBQ2pCO0NBQ0YsQ0FBQzs7Ozs7Ozs7In0=
