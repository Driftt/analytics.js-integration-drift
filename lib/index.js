
/**
 * Module dependencies.
 */

var convertDates = require('convert-dates');
var integration = require('analytics.js-integration');

var REFRESH_RATE = 300000;
var timeHash = Math.ceil(new Date() / REFRESH_RATE) * REFRESH_RATE;

/**
 * Expose `Driftt` integration.
 */

var Driftt = module.exports = integration('Driftt')
  .global('driftt')
  .option('embedId', '')
  .tag('<script src="https://js.driftt.com/include/' + timeHash + '/{{ embedId }}.js">');

/**
 * Initialize.
 *
 * @api public
 */

Driftt.prototype.initialize = function() {
  var driftt;

  driftt = window.drift = window.driftt = window.driftt || [];
  driftt.methods = ['identify', 'track', 'reset', 'debug', 'show', 'ping', 'page', 'hide', 'off', 'on'];
  driftt.factory = function(method) {
    return function() {
      var args;
      args = Array.prototype.slice.call(arguments);
      args.unshift(method);
      driftt.push(args);
    };
  };

  driftt.methods.forEach(function(key) {
    driftt[key] = driftt.factory(key);
  });

  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Driftt.prototype.loaded = function() {
  return window.driftt !== undefined;
};

/**
 * Identify.
 *
 * @api public
 * @param {Identify} identify
 */

Driftt.prototype.identify = function(identify) {
  if (!identify.userId()) return this.debug('user id required');
  if (!identify.email()) return this.debug('email required');
  var traits = identify.traits();
  var id = identify.userId();
  delete traits.id;
  window.driftt.identify(id, traits);
};

/**
 * Track.
 *
 * @api public
 * @param {Track} track
 */

Driftt.prototype.track = function(track) {
  var properties = track.properties();
  properties = convertDates(properties, convertDate);
  window.driftt.track(track.event(), properties);
};

/**
 * @api private
 * @param {Date} date
 * @return {number}
 */

function convertDate(date) {
  return Math.floor(date.getTime() / 1000);
}

Driftt.prototype.page = function(page) {
  window.driftt.page(page.name());
};
