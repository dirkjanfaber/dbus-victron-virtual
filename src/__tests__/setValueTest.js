/* eslint-env node */
const { addVictronInterfaces } = require('../index');

describe('victron-dbus-virtual, setItems tests', () => {

  it('works for the happy case', async () => {
    const declaration = { name: 'foo', properties: { StringProp: 's' } };
    const definition = { StringProp: 'hello' };
    const emit = jest.fn();
    const bus = {
      exportInterface: (iface /* , _path, _ifaceDesc */) => {
        iface.emit = emit;
      },
      invoke: function(args, cb) {
        console.log('invoke', JSON.stringify(arguments));
        process.nextTick(() => cb(null, 'dummy invoke response'));
      }
    }
    const { addSettings, setValue } = addVictronInterfaces(bus, declaration, definition);

    // TODO: the return value should be a promise with the response from invoking the bus
    const settingsResult = await addSettings([
      { path: '/Settings/MySettings/Setting', default: 3, min: 0, max: 10 },
    ]);
    console.log('settingsResult (TEST)', settingsResult)

    const setValueResult = await setValue({
      path: '/Settings/MySettings/Setting',
      value: 7,
      interface: 'com.victronenergy.BusItem',
      destination: 'com.victronenergy.settings',
    });
    console.log('setValueResult (TEST)', setValueResult)
  });

});
