/* eslint-env node */
const { addVictronInterfaces } = require('../index');

describe('victron-dbus-virtual, input parameters tests', () => {

  const noopBus = { exportInterface: () => { } };

  it('works for the trivial case', () => {
    const declaration = { name: 'foo' };
    const definition = {};
    const result = addVictronInterfaces(noopBus, declaration, definition);
    expect(!!result).toBe(true);
  });

  it('works for an example with properties', () => {
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
    const result = addVictronInterfaces(noopBus, declaration, definition);
    expect(!!result).toBe(true);
  });

  it('provides a warning if the interface name contains problematic characters', () => {
    const declaration = {
      name: 'com.victronenergy.my-service-with-dashes',
    };
    const { warnings } = addVictronInterfaces(noopBus, declaration, {});
    expect(warnings.length).toBe(1);
    expect(warnings[0].includes('problematic characters')).toBe(true);
  });

  it('provides a warning if the interface name does not start with com.victronenergy', () => {
    const declaration = {
      name: 'com.example.my_service',
    };
    const { warnings } = addVictronInterfaces(noopBus, declaration, {});
    expect(warnings.length).toBe(1);
    expect(warnings[0].includes('start with com.victronenergy')).toBe(true);
  });

});
