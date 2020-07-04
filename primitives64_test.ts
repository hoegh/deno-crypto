import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { TestCase, paramtest} from "./parameterized_tests.ts"

import { rotl, rotr, ch, maj, Sigma, sigma } from "./primitives64.ts"

function not(x: bigint) {
  return BigInt.asUintN(64,~x)
}

function toHex(x: bigint) {
  return "0x"+x.toString(16);
}

interface RotTestParams {
  n: bigint;
  a: bigint;
  b: bigint;
}

const ROTL_data: TestCase<RotTestParams>[] = [
  {
    name: "short shift, no roll",
    params: {
      n: 1n,
      a: BigInt("0x1"),
      b: BigInt("0x2")
    }
  },
  {
    name: "longer shift, no roll",
    params: {
      n: 8n,
      a: BigInt("0x1"),
      b: BigInt("0x100")
    }
  },
  {
    name: "short shift, roll",
    params: {
      n: 1n,
      a: BigInt("0x8000000000000000"),
      b: BigInt("0x1")
    }
  },
  {
    name: "long shift, roll",
    params: {
      n: 8n,
      a: BigInt("0x0100000000000000"),
      b: BigInt("0x1")
    }
  },

  {
    name: "inverted, short shift, no roll",
    params: {
      n: 1n,
      a: not(BigInt("0x1")),
      b: not(BigInt("0x2"))
    }
  },
  {
    name: "inverted, longer shift, no roll",
    params: {
      n: 8n,
      a: not(BigInt("0x1")),
      b: not(BigInt("0x100"))
    }
  },
  {
    name: "inverted, short shift, roll",
    params: {
      n: 1n,
      a: not(BigInt("0x8000000000000000")),
      b: not(BigInt("0x1"))
    }
  },
  {
    name: "inverted, long shift, roll",
    params: {
      n: 8n,
      a: not(BigInt("0x0100000000000000")),
      b: not(BigInt("0x1"))
    }
  },
]

function rotTestcaseFormatter(testCase: TestCase<RotTestParams>) {
  return testCase.name+` {n: ${testCase.params.n}, a: ${toHex(testCase.params.a)}, b: ${toHex(testCase.params.b)}}`;
}

paramtest("ROTL 64", ROTL_data, (param: RotTestParams)=>{
  return ()=> {
    let rotl_n = rotl(param.n);
    assertEquals(rotl_n(param.a).toString(16), param.b.toString(16));
  };
}, rotTestcaseFormatter)

paramtest("ROTR 64", ROTL_data, (param: RotTestParams)=>{
  // ROTR reused ROTL_data in reverse
  return () => {
    let rotr_n = rotr(param.n);
    assertEquals(rotr_n(param.b).toString(16), param.a.toString(16));
  };
}, rotTestcaseFormatter)

interface TripletTestParams {
  x: bigint;
  y: bigint;
  z: bigint;
  res: bigint;
}

const Ch_data: TestCase<TripletTestParams>[] = [
  {
    name: "mix",
    params: {
      x: BigInt("0x00ff00ff00ff00ff"),
      y: BigInt("0xaaaaaaaaaaaaaaaa"),
      z: BigInt("0x5555555555555555"),
      res: BigInt("0x55aa55aa55aa55aa")
    }
  },

  {
    name: "remix",
    params: {
      x: BigInt("0xff00ff00ff00ff00"),
      y: BigInt("0xaaaaaaaaaaaaaaaa"),
      z: BigInt("0x5555555555555555"),
      res: BigInt("0xaa55aa55aa55aa55")
    }
  },

  {
    name: "pick",
    params: {
      x: BigInt("0xaaaaaaaaaaaaaaaa"),
      y: BigInt("0xaaaaaaaaaaaaaaaa"),
      z: BigInt("0x5555555555555555"),
      res: BigInt("0xffffffffffffffff")
    }
  },

  {
    name: "choose",
    params: {
      x: BigInt("0x5555555555555555"),
      y: BigInt("0xaaaaaaaaaaaaaaaa"),
      z: BigInt("0x5555555555555555"),
      res: 0n
    }
  },

  {
    name: "swap",
    params: {
      x: BigInt("0xaaaaaaaaaaaaaaaa"),
      y: BigInt("0x5555555555555555"),
      z: BigInt("0xaaaaaaaaaaaaaaaa"),
      res: 0n
    }
  },
]

function tripletTestCaseFormatter(testCase: TestCase<TripletTestParams>) {
  return testCase.name + ` {x: ${toHex(testCase.params.x)}, y: ${toHex(testCase.params.y)}, z: ${toHex(testCase.params.z)}, res: ${toHex(testCase.params.res)}}`;
}

paramtest("Ch 64", Ch_data, (param: TripletTestParams) => {
  return () => {
    assertEquals(ch(param.x, param.y, param.z).toString(16), param.res.toString(16));
  }
}, tripletTestCaseFormatter)

const maj_data: TestCase<TripletTestParams>[] = [
  {
    name: "mix pattern",
    params: {
      x: BigInt("0x0f0f0f0f0f0f0f0f"),
      y: BigInt("0x00ff00ff00ff00ff"),
      z: BigInt("0x0000ffff0000ffff"),
      res: BigInt("0x000f0fff000f0fff")
    }
  },

  {
    name: "Tiebreaking",
    params: {
      x: BigInt("0x0000ffff0000ffff"),
      y: BigInt("0xa5a5a5a5a5a5a5a5"),
      z: BigInt("0xffff0000ffff0000"),
      res: BigInt("0xa5a5a5a5a5a5a5a5")
    }
  },
]

paramtest("maj 64", maj_data, (param: TripletTestParams) => {
  return () => {
    assertEquals(maj(param.x, param.y, param.z).toString(16), param.res.toString(16));
  }
}, tripletTestCaseFormatter)

Deno.test("Sigma highend", ()=>{
  let fn_Sigma = Sigma(1n,4n,8n);

  assertEquals(fn_Sigma(BigInt("0xffff0000ffff0000")).toString(16), BigInt("0x70ff8f0070ff8f00").toString(16));
})

Deno.test("Sigma lowend", ()=>{
  let fn_Sigma = Sigma(1n,4n,8n);

  assertEquals(fn_Sigma(BigInt("0x0000ffff0000ffff")).toString(16), BigInt("0x8f0070ff8f0070ff").toString(16));
})


Deno.test("sigma highend", ()=>{
  let fn_sigma = sigma(1n,4n,8n);

  assertEquals(fn_sigma(BigInt("0xffff0000ffff0000")).toString(16), BigInt("0x70ff8f0070ff8f00").toString(16));
})

Deno.test("sigma lowend", ()=>{
  let fn_sigma = sigma(1n,4n,8n);

  assertEquals(fn_sigma(BigInt("0x0000ffff0000ffff")).toString(16), BigInt("0x700070ff8f0070ff").toString(16));
})
