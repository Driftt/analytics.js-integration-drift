
var Analytics = require('analytics.js-core').constructor;
var integration = require('analytics.js-integration');
var sandbox = require('clear-env');
var tester = require('analytics.js-integration-tester');
var Drift = require('../lib/');

describe('Drift', function() {
  var analytics;
  var drift;
  var options = {
    embedId: 'buvw2r8z43np-dev'
  };

  beforeEach(function() {
    analytics = new Analytics();
    drift = new Drift(options);
    analytics.use(Drift);
    analytics.use(tester);
    analytics.add(drift);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    drift.reset();
    sandbox();
  });

  it('should have the right settings', function() {
    analytics.compare(Drift, integration('Drift')
      .global('drift')
      .option('embedId', ''));
  });

  describe('before loading', function() {
    beforeEach(function() {
      analytics.stub(drift, 'load');
    });

    describe('#initialize', function() {
      it('should create the window.driftt object', function() {
        analytics.assert(!window.driftt);
        analytics.initialize();
        analytics.assert(window.driftt);
      });

      it('should call #load', function() {
        analytics.initialize();
        analytics.called(drift.load);
      });
    });
  });

  describe('loading', function() {
    it('should load', function(done) {
      analytics.load(drift, done);
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
    });

    describe('#identify', function() {
      beforeEach(function() {
        analytics.stub(window.driftt, 'identify');
      });

      it('should send an id without an email', function() {
        analytics.identify('id');
        analytics.called(window.driftt.identify, 'id');
      });

      it('should send an id with an email', function() {
        analytics.identify('id', { email: 'blackwidow@shield.gov' });
        analytics.called(window.driftt.identify, 'id', { email: 'blackwidow@shield.gov' });
      });

      it('should send an id and traits', function() {
        analytics.identify('id', { email: 'blackwidow@shield.gov' });
        analytics.called(window.driftt.identify, 'id', { email: 'blackwidow@shield.gov' });
      });
    });

    describe('#track', function() {
      beforeEach(function() {
        analytics.stub(window.driftt, 'track');
      });

      it('should send an event', function() {
        analytics.track('event');
        analytics.called(window.driftt.track, 'event');
      });

      it('should send an event and properties', function() {
        analytics.track('event', { property: true });
        analytics.called(window.driftt.track, 'event', { property: true });
      });

      it('should convert dates to unix timestamps', function() {
        var date = new Date();
        analytics.track('event', { date: date });
        analytics.called(window.driftt.track, 'event', { date: Math.floor(date / 1000) });
      });
    });
  });
});
