# Location Live API

![Location Live Server](https://cronitor.io/badges/CXVC5V/production/lj7XI3q8kEFSho9eq3rZBEPIZBc.svg)
[![npm version](https://badge.fury.io/js/location-live-api.svg)](https://badge.fury.io/js/location-live-api)

This repo represents the backend interface of the [Location Live](https://rexgarland.dev/app/location-live/) mobile app,
allowing users to provide their own, custom backend for increased security and privacy.

Any backend that passes the contract defined here will work with the mobile app.

## Install

```shell
npm install -g location-live-api
```

## Run

To test a custom backend, run:

```shell
location-live-api testServer <my-custom-backend-url>
```

For example:

```txt
>> location-live-api testServer -- https://locationlive.rexgarland.dev
✅ Server is up.
✅ Server can receive location updates.
✅ Server can send location updates.
✅ Server prevents one user from editing another user's location (aka spoofing).
✅ Location updates include correct timestamps.
🎯 Complete!
```

## Library

You can also use this package as a library, which exports a small helper class to call your backend.

The code is very simple (check api.ts).

```ts
import {LocationLiveAPI} from "location-live-api";

const api = new LocationLiveAPI('<my-custom-backend-root-url>')

await api.sendLocationUpdate({
    username: 'some-unique-username',
    key: 'some-secret-key',
    location: {
        lat: 41.881944,
        lon: -87.627778
    }
});

const {location, timestamp} = await api.getLocation({
    username: 'some-unique-username',
})
```

## Testing

This contract itself is tested by ensuring a known-good server passes, and a known-bad server fails.
It's a basic sanity check, which you can run for yourself:

```shell
npm install
npm test
```

## Known security issues

The app is designed for casual, short-term use. Users should be aware of its security limitations.

### Brute-force location discovery

A bad actor could find the location of any user by brute-force fetching all possible user keys until one of the endpoints responds with real data.
They will then know the location and timestamp of some unidentified user.

The probability of this happening can be reduced by:
- ensuring the space of user keys is large
- automatically deleting stale location data (e.g. after 7 days of inactivity)
- encouraging users to create new links instead of reusing old ones

## Contributing

The repo provides two things:

- a wrapper for calling a Location Live server: `api.ts`
- a simple contract to ensure that custom backends implement the correct behavior: `contract.ts`

The main goal is portability:

- All the code built to /dist should be runnable in the browser, node, or react native, for example.
- This package is imported by the mobile app to run an on-device healthcheck.
- It avoids unnecessary dependencies which may fail to load/run in a new environment.