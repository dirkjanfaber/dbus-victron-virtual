const { addVictronInterfaces } = require('../index');

describe('victron-dbus-virtual, getValue tests', () => {

  it('works for the happy case', async () => {
    const declaration = { name: 'foo' };
    const definition = {};
    const bus = {
      exportInterface: () => { },
      invoke: function(args, cb) {
        process.nextTick(() => cb(null, args));
      }
    }
    const { getValue } = addVictronInterfaces(bus, declaration, definition);

    // NOTE: calling getValue() is useful to retrieve the value of a setting.
    // See https://github.com/Chris927/dbus-victron-virtual-test/blob/master/index.js for an example.

    const result = await getValue({
      path: '/StringProp',
      interface_: 'foo',
      destination: 'foo'
    });
    expect(result.member).toBe('GetValue');
    expect(result.path).toBe('/StringProp');
    expect(result.interface).toBe('foo');
    expect(result.destination).toBe('foo');

  });

  it('fails if invoke fails', async () => {
    const declaration = { name: 'foo' };
    const definition = {};
    const bus = {
      exportInterface: () => { },
      invoke: function(args, cb) {
        process.nextTick(() => cb(new Error('oops')));
      }
    }
    const { getValue } = addVictronInterfaces(bus, declaration, definition);

    // NOTE: calling getValue() is useful to retrieve the value of a setting.
    // See https://github.com/Chris927/dbus-victron-virtual-test/blob/master/index.js for an example.

    try {
      await getValue({
        path: '/StringProp',
        interface_: 'foo',
        destination: 'foo'
      });
      expect(false, 'should have thrown');
    } catch (err) {
      expect(err.message).toBe('oops');
    }
  });

});
