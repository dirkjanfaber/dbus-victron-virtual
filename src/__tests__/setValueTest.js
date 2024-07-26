/* eslint-env node */
const { addVictronInterfaces } = require('../index');

describe('victron-dbus-virtual, setValue tests', () => {

  it('works for the happy case for settings', async () => {
    const declaration = { name: 'foo', properties: { StringProp: 's' } };
    const definition = { StringProp: 'hello' };
    const emit = jest.fn();
    const bus = {
      exportInterface: (iface /* , _path, _ifaceDesc */) => {
        iface.emit = emit;
      },
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

  // it('works for the happy case when we get called', async () => {

  // });

});
