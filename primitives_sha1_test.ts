import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { TestCase, paramtest} from "./parameterized_tests.ts"

import {parity} from "./primitives_sha1.ts"

// most logical operator interpret values as 32-bit signed, but unsigned is easier to interpret.
// it matters when presenting results, and it matters when asserting results, then "sign-ness" should be correct
// for calculations it doesn't, as bitwise operator works on patterns of bits.
function toInt32(n: number) {
  return n & 0xffffffff;
}

function toUInt32(n: number) {
  return n < 0 ? n + 0x100000000 : n;
}

function toHex(x: number) {
  return "0x"+toUInt32(x).toString(16);
}

interface ParityTestParams {
  x: number;
  y: number;
  z: number;
  res: number;
}

const Ch_data: TestCase<ParityTestParams>[] = [
  {
    name: "1st pattern",
    params: {
      x: 0x0f0f0f0f,
      y: 0x00ff00ff,
      z: 0xffffffff,
      res: toInt32(0xf00ff00f)
    }
  },

  {
    name: "2nd pattern",
    params: {
      y: 0x0f0f0f0f,
      z: 0x00ff00ff,
      x: 0xffffffff,
      res: toInt32(0xf00ff00f)
    }
  },

  {
    name: "3rd pattern",
    params: {
      z: 0x0f0f0f0f,
      x: 0x00ff00ff,
      y: 0xffffffff,
      res: toInt32(0xf00ff00f)
    }
  },

  {
    name: "even",
    params: {
      z: 0x0f0ffaaa,
      x: 0x0ff0a0a0,
      y: 0x00ff5a0a,
      res: toInt32(0x00000000)
    }
  },

  {
    name: "odd",
    params: {
      z: 0xf0f005aa,
      x: 0xf00f5050,
      y: 0xff00aa05,
      res: toInt32(0xffffffff)
    }
  },

]

function parityTestCaseFormatter(testCase: TestCase<ParityTestParams>) {
  return testCase.name + ` {x: ${toHex(testCase.params.x)}, y: ${toHex(testCase.params.y)}, z: ${toHex(testCase.params.z)}, res: ${toHex(testCase.params.res)}}`;
}

paramtest("Parity", Ch_data, (param: ParityTestParams) => {
  return () => {
    assertEquals(parity(param.x, param.y, param.z), param.res);
  }
}, parityTestCaseFormatter)
