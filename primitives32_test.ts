import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { TestCase, paramtest} from "./parameterized_tests.ts"

import { rotl, rotr, ch, maj, Sigma, sigma } from "./primitives32.ts"

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

interface RotTestParams {
  n: number;
  a: number;
  b: number;
}

const ROTL_data: TestCase<RotTestParams>[] = [
  {
    name: "short shift, no roll",
    params: {
      n: 1,
      a: 0x1,
      b: 0x2
    }
  },
  {
    name: "longer shift, no roll",
    params: {
      n: 8,
      a: 0x1,
      b: 0x100
    }
  },
  {
    name: "short shift, roll",
    params: {
      n: 1,
      a: toInt32(0x80000000),
      b: 0x1
    }
  },
  {
    name: "long shift, roll",
    params: {
      n: 8,
      a: 0x01000000,
      b: 0x1
    }
  },

  {
      name: "inverted, short shift, no roll",
      params: {
        n: 1,
        a: ~0x1,
        b: ~0x2
      }
    },
    {
      name: "inverted, longer shift, no roll",
      params: {
        n: 8,
        a: ~0x1,
        b: ~0x100
      }
    },
    {
      name: "inverted, short shift, roll",
      params: {
        n: 1,
        a: ~toInt32(0x80000000),
        b: ~0x1
      }
    },
    {
      name: "inverted, long shift, roll",
      params: {
        n: 8,
        a: ~0x01000000,
        b: ~0x1
      }
    },

]

function rotTestcaseFormatter(testCase: TestCase<RotTestParams>) {
  return testCase.name+` {n: ${testCase.params.n}, a: ${toHex(testCase.params.a)}, b: ${toHex(testCase.params.b)}}`;
}

paramtest("ROTL 32", ROTL_data, (param: RotTestParams)=>{
  return ()=> {
    let rotl_n = rotl(param.n);
    assertEquals(rotl_n(param.a), param.b);
  };
}, rotTestcaseFormatter)

paramtest("ROTR 32", ROTL_data, (param: RotTestParams)=>{
  // ROTR reused ROTL_data in reverse
  return () => {
    let rotr_n = rotr(param.n);
    assertEquals(rotr_n(param.b), param.a);
  };
}, rotTestcaseFormatter)

interface TripletTestParams {
  x: number;
  y: number;
  z: number;
  res: number;
}

const Ch_data: TestCase<TripletTestParams>[] = [
  {
    name: "mix",
    params: {
      x: 0x00ff00ff,
      y: 0xaaaaaaaa,
      z: 0x55555555,
      res: 0x55aa55aa
    }
  },

  {
    name: "remix",
    params: {
      x: 0xff00ff00,
      y: 0xaaaaaaaa,
      z: 0x55555555,
      res: toInt32(0xaa55aa55)
    }
  },

  {
    name: "pick",
    params: {
      x: 0xaaaaaaaa,
      y: 0xaaaaaaaa,
      z: 0x55555555,
      res: toInt32(0xffffffff)
    }
  },

  {
    name: "choose",
    params: {
      x: 0x55555555,
      y: 0xaaaaaaaa,
      z: 0x55555555,
      res: 0
    }
  },

  {
    name: "swap",
    params: {
      x: 0xaaaaaaaa,
      y: 0x55555555,
      z: 0xaaaaaaaa,
      res: 0
    }
  },
]

function tripletTestCaseFormatter(testCase: TestCase<TripletTestParams>) {
  return testCase.name + ` {x: ${toHex(testCase.params.x)}, y: ${toHex(testCase.params.y)}, z: ${toHex(testCase.params.z)}, res: ${toHex(testCase.params.res)}}`;
}

paramtest("Ch 32", Ch_data, (param: TripletTestParams) => {
  return () => {
    assertEquals(ch(param.x, param.y, param.z), param.res);
  }
}, tripletTestCaseFormatter)

const maj_data: TestCase<TripletTestParams>[] = [
  {
    name: "mix pattern",
    params: {
      x: 0x0f0f0f0f,
      y: 0x00ff00ff,
      z: 0x0000ffff,
      res: toInt32(0x00f0fff)
    }
  },

  {
    name: "Tiebreaking",
    params: {
      x: 0x0000ffff,
      y: 0xa5a5a5a5,
      z: 0xffff0000,
      res: toInt32(0xa5a5a5a5)
    }
  },
]

paramtest("maj 32", maj_data, (param: TripletTestParams) => {
  return () => {
    assertEquals(maj(param.x, param.y, param.z), param.res);
  }
}, tripletTestCaseFormatter)

Deno.test("Sigma highend", ()=>{
  let fn_Sigma = Sigma(1,4,8);

  assertEquals(fn_Sigma(0xffff0000), 0x70ff8f00);
})

Deno.test("Sigma lowend", ()=>{
  let fn_Sigma = Sigma(1,4,8);

  assertEquals(fn_Sigma(0x0000ffff), toInt32(0x8f0070ff));
})

Deno.test("sigma highend", ()=>{
  let fn_sigma = sigma(1,4,8);

  assertEquals(fn_sigma(0xffff0000), 0x70ff8f00);
})

Deno.test("sigma lowend", ()=>{
  let fn_sigma = sigma(1,4,8);

  assertEquals(fn_sigma(0x0000ffff), 0x700070ff);
})
