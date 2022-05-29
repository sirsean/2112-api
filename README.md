# 2112-api

This wraps a CORS-enabled API wrapper around the actual API to fetch info
about 2112 Cryptorunners, _plus_ reaches out to Polygon and Mainnet to
augment that information with on-chain data about the runner and their runs.

You can use this to write your own applications without having to talk
directly to the blockchain(s).

## Develop

```
npx wrangler dev
```

## Publish

```
npx wrangler publish
```
