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

  it('fails in some scenarios', () => {
    try {
      addVictronInterfaces(noopBus, {}, {});
    } catch (e) {
      expect(e.message.includes('Interface name')).toBe(true);
    }
    try {
      addVictronInterfaces(noopBus, { name: '' }, {});
    } catch (e) {
      expect(e.message.includes('Interface name')).toBe(true);
    }
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
    expect(result.warnings.length).toBe(0);
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

  it('exports GetItems, and SetValue for each property', () => {
    const declaration = {
      name: 'some_name',
      properties: {
        'foo': 'i',
        'bar': 's',
        'baz': 'b',
      }
    }
    const bus = {
      exportInterface: jest.fn()
    };

    addVictronInterfaces(bus, declaration, {});
    expect(bus.exportInterface.mock.calls.length).toBe(4);

    const call0 = bus.exportInterface.mock.calls[0];
    expect(Object.keys(call0[0])).toStrictEqual(['GetItems', 'emit']);

    const call1 = bus.exportInterface.mock.calls[1];
    expect(Object.keys(call1[0])).toStrictEqual(['SetValue']);
    expect(call1[1]).toStrictEqual('/foo');
    expect(call1[2].name).toBe('com.victronenergy.BusItem');

    const call3 = bus.exportInterface.mock.calls[3];
    expect(call3[1]).toStrictEqual('/baz');

  });


});
