# Quick intro

SHA algorithms implemented in TypeScript. Tests and the main runner require [Deno](https://deno.land), the SHA algorithms are pure TypeScript and should run on modern platforms.

Currently the following algorithms are implemented:
* SHA-1
* SHA-256

Running:
```
deno run --allow-read sha1sum.ts filename.bin
```
where "filename.bin" is the name of a file.

The tests will require "--allow-read" as well, as the sha1_test.ts reads testvectors from a file.

# Notes

This is *not* an implementation that is meant for production use. It is written as a learning exercise for me, and using SHA algorithms means that implementation has to be precise.

It doesn't have to be fast (compared to the native `sha1sum`, the `sha1sum.ts` runs about 13 times slower on my machine). Neither does it need to be safe. But it is tested against a set of official test-vectors.

I set out to explore Iterators in JavaScript and specifically AsyncIterators, and I wanted to use the Deno platform. There are likely simpler and faster implementations.
