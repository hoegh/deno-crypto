import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { decodeString } from "https://deno.land/std/encoding/hex.ts";
import { encode } from "https://deno.land/std/encoding/utf8.ts";

import { sha, shaSync, SHA512 } from "./sha.ts";
import { asynchify } from "./test_helpers.ts";

// short examples taken from https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Standards-and-Guidelines/documents/examples/SHA256.pdf

Deno.test("SHA512 Example: One Block Message Sample", () => {
  let result = shaSync(SHA512, encode("abc"));
  assertEquals(result, decodeString("DDAF35A193617ABACC417349AE20413112E6FA4E89A97EA20A9EEEE64B55D39A2192992A274FC1A836BA3C23A3FEEBBD454D4423643CE80E2A9AC94FA54CA49F"));
})

Deno.test("SHA256 Example: Two Block Message Sample", async () => {
  let result = await sha(SHA512, asynchify([encode("abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu")]));
  assertEquals(result, decodeString("8E959B75DAE313DA8CF4F72814FC143F8F7779C6EB9F7FA17299AEADB6889018501D289E4900F7E4331B99DEC4B5433AC7D329EEB6DD26545E96E55B874BE909"));
})
