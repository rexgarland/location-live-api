# Location Live API

![Location Live Server](https://cronitor.io/badges/CXVC5V/production/lj7XI3q8kEFSho9eq3rZBEPIZBc.svg)

This repo represents the backend interface of the [Location Live](https://rexgarland.dev/app/location-live/) mobile app,
allowing users to provide their own, custom backend for increased security and privacy.

Any backend that passes the contract defined here will work with the mobile app.

## Structure

The repo provides two things:

- a wrapper for calling a Location Live server: `api.ts`
- a simple contract to ensure that custom backends implement the correct behavior: `contract.ts`

## Usage

You can test any server url with the following:

```shell
npm run testServer -- <server-url>
```

For example:

```txt
>> npm run testServer -- https://locationlive.rexgarland.dev
✅ Server is up.
✅ Server can receive location updates.
✅ Server can send location updates.
✅ Server prevents one user from editing another user's location (aka spoofing).
✅ Location updates include correct timestamps.
🎯 Complete!
```

## Testing

This contract itself is tested by ensuring a known-good server passes, and a known-bad server fails.
It's a basic sanity check, which you can run for yourself:

```shell
npm install
npm run build
npm test
```

## Contributing

The main goal is portability:

- All the code built to /dist should be runnable in the browser, node, or react native, for example.
- This package is imported by the mobile app to run an on-device healthcheck.
- It avoids unnecessary dependencies which may fail to load/run in a new environment.