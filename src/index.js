
function addVictronInterfaces(bus, declaration, definition) {

  const warnings = [];

  if (!declaration.name) {
    throw new Error('Interface name is required');
  }

  if (!declaration.name.match(/^[a-zA-Z0-9_.]+$/)) {
    warnings.push(
      `Interface name contains problematic characters, only a-zA-Z0-9_ allowed.`
    );
  }
  if (!declaration.name.match(/^com.victronenergy/)) {
    warnings.push('Interface name should start with com.victronenergy');
  }

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
    bus.exportInterface(
      {
        SetValue: function(value, /* msg */) {
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

  async function addSettings(settings) {
    const body = [
      settings.map(setting => [
        ['path', wrapValue('s', setting.path)],
        ['default', wrapValue('s', '' + setting.default)] // TODO: forcing value to be string
        // TODO: incomplete, min and max missing
      ])
    ];
    return await new Promise((resolve, reject) => {
      bus.invoke(
        {
          interface: 'com.victronenergy.Settings',
          path: '/',
          member: 'AddSettings',
          destination: 'com.victronenergy.settings',
          type: undefined,
          signature: 'aa{sv}',
          body: body
        },
        function(err, result) {
          if (err) {
            return reject(err);
          }
          return resolve(result);
        }
      );
    });
  }

  function removeSettings(settings) {
    const body = [settings.map(setting => setting.path)];

    bus.invoke(
      {
        interface: 'com.victronenergy.Settings',
        path: '/',
        member: 'RemoveSettings',
        destination: 'com.victronenergy.settings',
        type: undefined,
        signature: 'as',
        body: body
      },
      function() {
        console.log('removeSettings, callback', arguments);
      }
    );
  }

  async function setValue({ path, interface_, destination, value }) {
    return await new Promise((resolve, reject) => {
      bus.invoke(
        {
          interface: interface_,
          path: path || '/',
          member: 'SetValue',
          destination,
          signature: 'v',
          body: [wrapValue('s', '' + value)] // TODO: only supports string type for now
        },
        function(err, result) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  }

  async function getValue({ path, interface_, destination }) {
    return await new Promise((resolve, reject) => {
      bus.invoke(
        {
          interface: interface_,
          path: path || '/',
          member: 'GetValue',
          destination
        },
        function(err, result) {
          if (err) {
            return reject(err);
          }
          resolve(result);
        }
      );
    });
  }

  return {
    emitItemsChanged: () => iface.emit('ItemsChanged', getProperties()),
    addSettings,
    removeSettings,
    setValue,
    getValue,
    warnings
  };
}


module.exports = { addVictronInterfaces };
