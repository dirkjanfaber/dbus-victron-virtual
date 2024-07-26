/* eslint-env node */
const { addVictronInterfaces } = require('../index');

describe('victron-dbus-virtual, setValue tests', () => {

  it('works for the happy case for settings', async () => {
    const declaration = { name: 'foo', properties: { StringProp: 's' } };
    const definition = { StringProp: 'hello' };
    const bus = {
      exportInterface: () => { },
      invoke: function(args, cb) {
        process.nextTick(() => cb(null, args));
      }
    }
    const { addSettings, setValue } = addVictronInterfaces(bus, declaration, definition);

    const settingsResult = await addSettings([
      { path: '/Settings/MySettings/Setting', default: 3, min: 0, max: 10 },
    ]);
    expect(settingsResult.member).toBe('AddSettings');

    const setValueResult = await setValue({
      path: '/Settings/MySettings/Setting',
      value: 7,
      interface: 'com.victronenergy.BusItem',
      destination: 'com.victronenergy.settings',
    });
    expect(setValueResult.member).toBe('SetValue');
  });

  it('works for the happy case when we get called with SetValue', async () => {
    const declaration = { name: 'foo', properties: { StringProp: 's' } };
    const definition = { StringProp: 'hello' };
    const emit = jest.fn();
    const interfaces = []
    const bus = {
      exportInterface: (iface /* , _path, _ifaceDesc */) => {
        interfaces.push(iface);
        iface.emit = emit;
      },
      invoke: function(args, cb) {
        process.nextTick(() => cb(null, args));
      }
    }
    addVictronInterfaces(bus, declaration, definition);
    expect(!!interfaces[1].SetValue).toBe(true);
    interfaces[1].SetValue([[{ type: 's' }], ['hello']]);
    expect(emit.mock.calls[0][0]).toBe('ItemsChanged');
    expect(emit.mock.calls[0][1]).toEqual([['StringProp', [['Value', ['s', 'hello']], ['Text', ['s', 'hello']]]]]);
  });

});
