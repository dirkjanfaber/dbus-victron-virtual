/* eslint-env node */
const { addVictronInterfaces } = require('../index');

describe('victron-dbus-virtual, emitItemsChanged tests', () => {

  const noopBus = { exportInterface: () => { } };

  it('works for the case without props', () => {
    const declaration = { name: 'foo' };
    const definition = {};
    const { emitItemsChanged } = addVictronInterfaces(noopBus, declaration, definition);
    emitItemsChanged();
  });

  it('works for the happy case', () => {
    const declaration = { name: 'foo', properties: { StringProp: 's' } };
    const definition = { StringProp: 'hello' };
    const emit = jest.fn();
    const bus = {
      exportInterface: (iface /* , _path, _ifaceDesc */) => {
        iface.emit = emit;
      }
    }
    const { emitItemsChanged } = addVictronInterfaces(bus, declaration, definition);
    emitItemsChanged();
    expect(emit.mock.calls.length).toBe(1);
    expect(emit.mock.calls[0][0]).toBe('ItemsChanged');
    expect(emit.mock.calls[0][1]).toEqual([['StringProp', [['Value', ['s', 'hello']], ['Text', ['s', 'hello']]]]]);
  });

});
