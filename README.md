# About

`dbus-victron-virtual` is a wrapper around
[dbus-native](https://www.npmjs.com/package/dbus-native), which allows you to
connect to [dbus](https://www.freedesktop.org/wiki/Software/dbus/), and
simplify integrating with the [Victron](https://www.victronenergy.com/)
infrastructure: To do this, `dbus-victron-virtual` provides functions to

* expose your dbus interface as a Victron service, by implementing the dbus interface `com.victronenergy.BusItem`,
* emit the Victron-specific event `ItemsChanged`, and
* define and modify settings which are then available through Victron's settings interface.

See `dbus-victron-virtual` in action [here](https://github.com/Chris927/dbus-victron-virtual-test).


This package may be for you if

* you want to define virtual devices for testing on a Victron device, like a [Victron Cerbo GX](https://www.victronenergy.com/media/pg/Cerbo_GX/en/index-en.html), e.g. to use it in [Node-RED](https://www.victronenergy.com/live/venus-os:large), or
* you need to integrate a device via dbus that is not (yet) supported by Victron natively.


# Usage

(TODO)


# Development

## Prerequisites

You can develop on a device that runs [Venus OS](https://github.com/victronenergy/venus). This way, the dbus environment as required by this package will be available.  Alternatively, you can develop in any environment that support node 18 or higher, but you won't be able to run integration tests.

## Steps

* clone the repository
* `npm install`
* `npm run test`

The implementation is in `./src/index.js`, tests are in `./src/__tests__`.

