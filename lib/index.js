
/**
 * Module dependencies.
 */

var convertDates = require('convert-dates');
var integration = require('analytics.js-integration');

var REFRESH_RATE = 300000;
var timeHash = Math.ceil(new Date() / REFRESH_RATE) * REFRESH_RATE;

/**
 * Expose `Drift` integration.
 */

var Drift = module.exports = integration('Drift')
  .global('drift')
  .option('embedId', '')
  .tag('<script src="https://js.driftt.com/include/' + timeHash + '/{{ embedId }}.js">');

/**
 * Initialize.
 *
 * @api public
 */

Drift.prototype.initialize = function() {
  var drift;

  drift = window.drift = window.driftt = window.driftt || [];
  drift.methods = ['identify', 'track', 'reset', 'debug', 'show', 'ping', 'page', 'hide', 'off', 'on'];
  drift.factory = function(method) {
    return function() {
      var args;
      args = Array.prototype.slice.call(arguments);
      args.unshift(method);
      drift.push(args);
    };
  };

  drift.methods.forEach(function(key) {
    drift[key] = drift.factory(key);
  });

  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Drift.prototype.loaded = function() {
  return window.drift !== undefined;
};

/**
 * Identify.
 *
 * @api public
 * @param {Identify} identify
 */

Drift.prototype.identify = function(identify) {
  if (!identify.userId()) return this.debug('user id required');
  var traits = identify.traits();
  var id = identify.userId();
  delete traits.id;
  window.drift.identify(id, traits);
  this.identified = true;
};

/**
 * Track.
 *
 * @api public
 * @param {Track} track
 */

Drift.prototype.track = function(track) {
  var properties = track.properties();
  properties = convertDates(properties, convertDate);
  window.drift.track(track.event(), properties);
};

/**
 * @api private
 * @param {Date} date
 * @return {number}
 */

function convertDate(date) {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

Drift.prototype.page = function(page) {
  if (!this.identified && page.userId()) {
    window.drift.identify(page.userId());
    this.identified = true;
  }

  window.drift.page(page.name());
};
