/* eslint-env node */
const { addVictronInterfaces } = require('../index');

describe('victron-dbus-virtual, setValue tests', () => {

  it('works for the happy case', async () => {
    const declaration = { name: 'foo', properties: { StringProp: 's' } };
    const definition = { StringProp: 'hello' };
    const bus = {
      exportInterface: () => { },
      invoke: function(args, cb) {
        process.nextTick(() => cb(null, args));
      }
    }
    const { setValue } = addVictronInterfaces(bus, declaration, definition);

    const result = await setValue({
      path: '/StringProp',
      value: 'fourty-two',
      destination: 'foo',
      interface_: 'foo'
    });
    expect(result.member).toBe('SetValue');
    console.log('result...', result);
    expect(result.body).toStrictEqual([['s', 'fourty-two']]);
    expect(result.path).toBe('/StringProp');
    expect(result.interface).toBe('foo');
    expect(result.destination).toBe('foo');

    // NOTE: calling setValue() does *not* change the definition. If you want to update the definition,
    // re-assign it: "definition.StringProp = 'fourty-two';"
    // ... if you want to notify other processes of the change, you can call emitItemsChanged().
    // The purpose of setValue() is to change the value in the dbus object, not the definition. This is useful
    // for settings.
    expect(definition.StringProp).toBe('hello');
  });

  it('works for the happy case for settings', async () => {
    const declaration = { name: 'foo', properties: { StringProp: 's' } };
    const definition = { StringProp: 'hello' };
    const bus = {
      exportInterface: () => { },
      invoke: function(args, cb) {
        process.nextTick(() => cb(null, args));
      }
    }
    const { addSettings, setValue, removeSettings } = addVictronInterfaces(bus, declaration, definition);

    // first, add a setting
    const settingsResult = await addSettings([
      { path: '/Settings/MySettings/Setting', default: 3, min: 0, max: 10 },
    ]);
    expect(settingsResult.member).toBe('AddSettings');

    // then, we set its value
    const setValueResult = await setValue({
      path: '/Settings/MySettings/Setting',
      value: 7,
      interface: 'com.victronenergy.BusItem',
      destination: 'com.victronenergy.settings',
    });
    expect(setValueResult.member).toBe('SetValue');

    // lastly, we remove the setting
    const removeSettingsResult = await removeSettings([
      { path: '/Settings/MySettings/Setting' },
    ]);
    expect(removeSettingsResult.member).toBe('RemoveSettings');
    expect(removeSettingsResult.body).toStrictEqual([['/Settings/MySettings/Setting']]);
    expect(removeSettingsResult.path).toBe('/');
    expect(removeSettingsResult.interface).toBe('com.victronenergy.Settings');
    expect(removeSettingsResult.destination).toBe('com.victronenergy.settings');
    expect(removeSettingsResult.signature).toBe('as');

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

  it('fails if the underlying invoke() fails', async () => {
    const declaration = { name: 'foo', properties: { StringProp: 's' } };
    const definition = { StringProp: 'hello' };
    const bus = {
      exportInterface: () => { },
      invoke: function(_args, cb) {
        process.nextTick(() => cb(new Error('testing ... invoke failed')));
      }
    }
    const { setValue } = addVictronInterfaces(bus, declaration, definition);

    try {
      await setValue({
        path: '/StringProp',
        value: 'fourty-two',
        destination: 'foo',
        interface_: 'foo',
      });
      expect(false, 'should have thrown');
    } catch (e) {
      expect(e.message).toBe('testing ... invoke failed');
    }
  });

});
