const { addVictronInterfaces } = require('../index');

describe('victron-dbus-virtual, textual representation', () => {

  it('works for the happy case, where the value is naively turned into a string', async () => {

    const declaration = { name: 'foo', properties: { SomeIntNumber: 'i' } };
    const definition = { SomeIntNumber: 42 };
    const emit = jest.fn();
    const bus = {
      exportInterface: (iface /* , _path, _ifaceDesc */) => {
        iface.emit = emit;
      }
    }

    // TODO: we use emitItemsChanged(), but would rather use GetValue() if it were available already
    const { emitItemsChanged } = addVictronInterfaces(bus, declaration, definition);
    emitItemsChanged();
    expect(emit.mock.calls.length).toBe(1);
    expect(emit.mock.calls[0][0]).toBe('ItemsChanged');
    expect(emit.mock.calls[0][1]).toEqual([['SomeIntNumber', [['Value', ['i', 42]], ['Text', ['s', '42']]]]]);

  });

  it('works when we define a formatting function', async () => {

    // In order to define a formatting function, the declaration of a property must be an object,
    // where 'type' and 'format' are specified.
    const declaration = {
      name: 'foo', properties: {
        SomeIntNumber: {
          type: 'i',
          format: (v) => v === 42 ? 'fourty-two' : 'not fourty-two'
        }
      }
    };
    const definition = { SomeIntNumber: 42 };

    const emit = jest.fn();
    const bus = {
      exportInterface: (iface /* , _path, _ifaceDesc */) => {
        iface.emit = emit;
      }
    }

    // TODO: we use emitItemsChanged(), but would rather use GetValue() if it were available already
    const { emitItemsChanged } = addVictronInterfaces(bus, declaration, definition);
    emitItemsChanged();
    expect(emit.mock.calls.length).toBe(1);
    expect(emit.mock.calls[0][0]).toBe('ItemsChanged');
    expect(emit.mock.calls[0][1]).toEqual([['SomeIntNumber', [['Value', ['i', 42]], ['Text', ['s', 'fourty-two']]]]]);

    definition.SomeIntNumber = 43;
    emitItemsChanged();
    expect(emit.mock.calls.length).toBe(2);
    expect(emit.mock.calls[1][0]).toBe('ItemsChanged');
    expect(emit.mock.calls[1][1]).toEqual([['SomeIntNumber', [['Value', ['i', 43]], ['Text', ['s', 'not fourty-two']]]]]);

    // when we remove the format function, the default formatting is used
    delete declaration.properties.SomeIntNumber.format;
    emitItemsChanged();
    expect(emit.mock.calls.length).toBe(3);
    expect(emit.mock.calls[2][0]).toBe('ItemsChanged');
    expect(emit.mock.calls[2][1]).toEqual([['SomeIntNumber', [['Value', ['i', 43]], ['Text', ['s', '43']]]]]);

  });
});
