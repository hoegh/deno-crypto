import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { decodeString } from "https://deno.land/std/encoding/hex.ts";
import { encode } from "https://deno.land/std/encoding/utf8.ts";

import { sha, shaSync, SHA1 } from "./sha.ts";
import { asynchify } from "./test_helpers.ts";

// short examples taken from https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Standards-and-Guidelines/documents/examples/SHA1.pdf

Deno.test("SHA1 Example: One Block Message Sample", () => {
  let result = shaSync(SHA1, encode("abc"));
  assertEquals(result, decodeString("A9993E364706816ABA3E25717850C26C9CD0D89D"));
})

Deno.test("SHA1 Example: Two Block Message Sample", async () => {
  let result = await sha(SHA1, asynchify([encode("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq")]));
  assertEquals(result, decodeString("84983E441C3BD26EBAAE4AA1F95129E5E54670F1"));
})
