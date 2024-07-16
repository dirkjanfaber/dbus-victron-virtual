/* eslint-env node */
const { addVictronInterfaces } = require('../index');

describe('victron-dbus-virtual, input parameters tests', () => {

  it('works for the trivial case', () => {
    const bus = { exportInterface: () => { } };
    const declaration = {};
    const definition = {};
    const result = addVictronInterfaces(bus, declaration, definition);
    expect(!!result).toBe(true);
  });

  it('works for an example with properties', () => {
    const bus = { exportInterface: () => { } };
    const declaration = {
      name: 'com.victronenergy.myservice',
      properties: {
        'foo': 'i',
        'bar': 's',
      }
    };
    const definition = {
      foo: 42,
      bar: 'hello',
      emit: function() { }
    };
    const result = addVictronInterfaces(bus, declaration, definition);
    expect(!!result).toBe(true);
  });


});
