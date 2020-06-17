import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { encodeToString, decodeString } from "https://deno.land/std/encoding/hex.ts";

import {convert8to32, convert8to64, convert32to8, convert64to8} from "./converters.ts"

Deno.test("convert 8 to 32", () => {
  let input = decodeString("abcdef0123456789");
  let output = convert8to32(input);
  assertEquals(output, [0xabcdef01, 0x23456789]);
})

Deno.test("convert 8 to 64", () => {
  let input = decodeString("abcdef01234567890112234556677889");
  let output = convert8to64(input);
  assertEquals(output, [BigInt("0xabcdef0123456789"), BigInt("0x0112234556677889")]);
})

Deno.test("convert 32 to 8", () => {
  let input = Uint32Array.of(0xabcdef01, 0x23456789);
  let output = convert32to8(input);
  assertEquals(encodeToString(output), "abcdef0123456789");
})

Deno.test("convert 64 to 8", () => {
  let input = BigUint64Array.of(BigInt("0xabcdef0123456789"), BigInt("0x0112234556677889"));
  let output = convert64to8(input);
  assertEquals(encodeToString(output), "abcdef01234567890112234556677889");  
})
