import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { collect } from "./test_helpers.ts";

import { splitIntoBlocks } from "./block_splitter.ts"

Deno.test("empty block split", ()=>{
  let results = splitIntoBlocks([], 4);
  assertEquals(collect(results), []);
})

Deno.test("one short block split", ()=>{
  let results = splitIntoBlocks(Array(3).keys(), 4);
  assertEquals(collect(results), [[0,1,2]]);
})

Deno.test("one full block split", ()=>{
  let results = splitIntoBlocks(Array(4).keys(), 4);
  assertEquals(collect(results), [[0,1,2,3]]);
})

Deno.test("one full block and one split", ()=>{
  let results = splitIntoBlocks(Array(5).keys(), 4);
  assertEquals(collect(results), [[0,1,2,3], [4]]);
})

Deno.test("2½ block split", ()=>{
  let results = splitIntoBlocks(Array(10).keys(), 4);
  assertEquals(collect(results), [[0,1,2,3], [4,5,6,7], [8,9]]);
})
