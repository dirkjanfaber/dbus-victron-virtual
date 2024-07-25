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
    let called = false;
    const bus = {
      exportInterface: (iface /* , _path, _ifaceDesc */) => {
        iface.emit = function(name, args) {
          expect(name).toBe('ItemsChanged');
          expect(args).toEqual([['StringProp', [['Value', ['s', 'hello']], ['Text', ['s', 'hello']]]]]);
          called = true;
        }
      }
    }
    const { emitItemsChanged } = addVictronInterfaces(bus, declaration, definition);
    emitItemsChanged();
    expect(called).toBe(true);
  });

});
