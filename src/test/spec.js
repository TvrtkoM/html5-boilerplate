var main = require('../js/main.js');

QUnit.test('test', function(assert) {
  assert.equal(main(), 42, 'YES');
});

