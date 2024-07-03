
export function addVictronInterfases(bus, declaration, definition) {
  function wrapValue(t, v) {
    switch (t) {
      case 'b':
        return ['b', v];
      case 's':
        return ['s', v];
      case 'i':
        return ['i', v];
      default:
        return v;
    }
  }

  function unwrapValue([t, v]) {
    switch (t[0].type) {
      case 'b':
        return !!v[0];
      case 's':
        return v[0];
      case 'i':
        return Number(v[0]);
      default:
        throw new Error(`Unsupported value type: ${JSON.stringify(t)}`);
    }
  }

  // we use this for GetItems and ItemsChanged
  function getProperties() {
    return Object.entries(declaration.properties || {}).map(([k, v]) => {
      console.log('getProperties, entries, (k,v):', k, v);

      return [
        k,
        [
          ['Value', wrapValue(v, definition[k])],
          ['Text', ['s', '' + definition[k]]]
        ]
      ];
    });
  }

  const iface = {
    GetItems: function() {
      return getProperties();
    },
    emit: function() { }
  };

  const ifaceDesc = {
    name: 'com.victronenergy.BusItem',
    methods: {
      GetItems: ['', 'a{sa{sv}}', [], []]
    },
    signals: {
      ItemsChanged: ['a{sa{sv}}', '', [], []]
    }
  };

  bus.exportInterface(iface, '/', ifaceDesc);

  // support GetValue for each property
  for (const [k,] of Object.entries(declaration.properties || {})) {
    console.log('should add SetValue for property', k);
    bus.exportInterface(
      {
        SetValue: function(value) {
          console.log(
            'SetValue',
            JSON.stringify(arguments[0]),
            JSON.stringify(arguments[1])
          );
          try {
            definition[k] = unwrapValue(value);
            iface.emit('ItemsChanged', getProperties());
            return 0;
          } catch (e) {
            console.error(e);
            return -1;
          }
        }
      },
      `/${k}`,
      {
        name: 'com.victronenergy.BusItem',
        methods: {
          SetValue: ['v', 'i', [], []]
        }
      }
    );
  }
}

