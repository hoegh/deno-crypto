import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { flatten, collect, collectAsync, asynchify } from "./test_helpers.ts";

import {TestCase, paramtest} from "./parameterized_tests.ts";

import { splitBytesIntoBlocks, splitBlocksIntoBlocks } from "./block_splitter.ts"


interface SplitterTestParams{
    input: Uint8Array[];
    blockLength: number;
    expected: number[][];
}

const testdata: TestCase<SplitterTestParams>[] = [
  {
    name: "empty block split",
    params: {
      input: [new Uint8Array()],
      blockLength: 4,
      expected: []
    }
  },
  {
    name: "one short block split",
    params: {
      input: [new Uint8Array([0,1,2])],
      blockLength: 4,
      expected: [[0,1,2]]
    }
  },
  {
    name: "one full block split",
    params: {
      input: [new Uint8Array([0,1,2,3])],
      blockLength: 4,
      expected: [[0,1,2,3]]
    }
  },
  {
    name: "one full block and one split",
    params: {
      input: [new Uint8Array([0,1,2,3,4])],
      blockLength: 4,
      expected: [[0,1,2,3], [4]]
    }
  },
  {
    name: "2½ block split",
    params: {
      input: [new Uint8Array(Array(10).keys())],
      blockLength: 4,
      expected: [[0,1,2,3], [4,5,6,7], [8,9]]
    }
  },
  {
    name: "Multi block split",
    params: {
      input: [new Uint8Array(Array(10).keys()), new Uint8Array(Array(3).keys())],
      blockLength: 4,
      expected: [[0,1,2,3], [4,5,6,7], [8,9,0,1], [2]]
    }
  },
  {
    name: "More multi block split",
    params: {
      input: [
        new Uint8Array(Array(10).keys()),
        new Uint8Array(Array(3).keys()),
        new Uint8Array(),
        new Uint8Array([27]),
        new Uint8Array([14]),
        new Uint8Array(Array(7).keys())],
      blockLength: 4,
      expected: [[0,1,2,3], [4,5,6,7], [8,9,0,1], [2,27,14,0], [1,2,3,4], [5,6]]
    }
  },
]

paramtest("uint8 stream", testdata, (param: SplitterTestParams) => {
  return () => {
    let result = splitBytesIntoBlocks(flatten(param.input), param.blockLength);
    assertEquals(collect(result), param.expected);
  }
})

paramtest("Async blocks", testdata, (param: SplitterTestParams) => {
  return async () => {
    let result = splitBlocksIntoBlocks(asynchify(param.input), param.blockLength);
    assertEquals(await collectAsync(result), param.expected);
  }
})
