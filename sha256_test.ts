import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { decodeString } from "https://deno.land/std/encoding/hex.ts";
import { encode } from "https://deno.land/std/encoding/utf8.ts";

import { sha, shaSync, SHA256 } from "./sha.ts";
import { asynchify } from "./test_helpers.ts";

// short examples taken from https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Standards-and-Guidelines/documents/examples/SHA256.pdf

Deno.test("SHA256 Example: One Block Message Sample", () => {
  let result = shaSync(SHA256, encode("abc"));
  assertEquals(result, decodeString("BA7816BF8F01CFEA414140DE5DAE2223B00361A396177A9CB410FF61F20015AD"));
})

Deno.test("SHA256 Example: Two Block Message Sample", async () => {
  let result = await sha(SHA256, asynchify([encode("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq")]));
  assertEquals(result, decodeString("248D6A61D20638B8E5C026930C3E6039A33CE45964FF2167F6ECEDD419DB06C1"));
})
