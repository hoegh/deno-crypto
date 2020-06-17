import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { encodeToString, decodeString } from "https://deno.land/std/encoding/hex.ts";

import { TestCase, paramtest} from "./parameterized_tests.ts"
import { collect } from "./test_helpers.ts";

import { LengthSize, shapad } from "./padder.ts";

interface TestParams {
  message: string;
  expected: string[];
}

function paddingtestFactory(blockSize: number, lengthSize: LengthSize, param: TestParams) {
  return () => {
    let input = decodeString(param.message);
    let output = shapad(input, blockSize, lengthSize);
    let outputHex = collect(output).map((block:Uint8Array) => encodeToString(block));
    assertEquals(outputHex, param.expected);
  }
}

const SHA_32Bit_Testcases: TestCase<TestParams>[] = [
  {
    name: "empty",
    params: {
      message: "",
      expected: ["80"
        +"00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
        +"0000000000000000"]
    }
  },
  {
    name:"one",
    params: {
      message: "01",
      expected: ["0180"
        +"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
        +"0000000000000008"]
    }
  },
  {
    name:"a_few",
    params: {
      message: "0102030405060708090a0b0c0d0e0f",
      expected: ["0102030405060708090a0b0c0d0e0f80"
        + "00000000000000000000000000000000000000000000000000000000000000000000000000000000"
        + "0000000000000078"]
      }
  },
  {
    name:"one_block",
    params: {
      message: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f30313233343536",
      expected: ["000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f3031323334353680"
        //
        + "00000000000001b8"]
    }
  },
  {
    name:"one_block_and_one",
    params: {
      message: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f3031323334353637",
      expected: [
        "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f30313233343536378000000000000000",
        "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c0"
      ]
     }
  },
  {
    name:"one_less_than_full_first_block",
    params: {
      message: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e",
      expected: [
        "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e80",
        "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001f8"
      ]
     }
  },
  {
    name:"first_block_just_full",
    params: {
      message: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f",
      expected: [
        "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f",
        "80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200"
      ]
     }
  },
  {
    name: "first_block_and_one",
    params: {
      message: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f40",
      expected:  [
        "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f",
        "40800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000208"
      ]
    }
  },
  {
    name: "just_two_blocks",
    params: {
      message: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f"
       + "404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f70717273747576",
      expected: [
        "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f",
        "404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475768000000000000003b8"
      ]
    }
  },
  {
    name: "just_two_blocks_and_one",
    params: {
      message: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f"
       + "404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f7071727374757677",
      expected:  [
        "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f",
        "404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f70717273747576778000000000000000",
        "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003c0"
      ]
    }
  },
  {
    name: "one_less_than_two_full_blocks",
    params: {
      message: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f"
       +       "404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e",
      expected: [
        "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f",
        "404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e80",
        "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003f8"
      ]
    }
  },
  {
    name: "two_full_blocks",
    params: {
      message: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f"
       +       "404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f",
      expected: [
        "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f",
        "404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f",
        "80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400"
      ]
    }
  },
  {
    name: "two_full_blocks_and_one",
    params: {
      message: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f"
       +       "404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f"
       +       "80",
      expected: [
        "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f",
        "404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f",
        "80800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000408"
      ]
    }
  },
]

paramtest("Padding SHA 32Bit", SHA_32Bit_Testcases, (param: TestParams)=>{
  return paddingtestFactory(64, LengthSize.Len64Bits, param);
})

const SHA_64Bit_Testcases: TestCase<TestParams>[] = [
  {
    name: "empty",
    params: {
      message: "",
      expected: [
         "80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
        +"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
        +"00000000000000000000000000000000"
      ]
    }
  },
  {
    name:"a_few",
    params: {
      message: "0102030405060708090a0b0c0d0e0f",
      expected: [
         "0102030405060708090a0b0c0d0e0f80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
        +"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
        +"00000000000000000000000000000078"
      ]
    }
  },
  {
    name:"one_block",
    params: {
      message: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f"
       +       "404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e",

      expected: [
         "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f"
        +"404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e80"
        +"00000000000000000000000000000378"
      ]
    }
  },
  {
    name:"one_block_and_one",
    params: {
      message: "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f"
       +       "404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f",
       expected: [
          "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f"
         +"404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f80000000000000000000000000000000",

          "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
         +"00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000380"
       ]
     }
  },

]

paramtest("Padding SHA_64Bit", SHA_64Bit_Testcases, (param: TestParams)=>{
  return paddingtestFactory(128, LengthSize.Len128Bits, param);
})

Deno.test("Padding 128bit count", () => {
  let hugeCount = (1n << 65n) + 42n;
  let output = shapad([], 128, LengthSize.Len128Bits, hugeCount);

  let outputHex = collect(output).map((block:Uint8Array) => encodeToString(block));

  assertEquals(outputHex, [
     "80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
     //the "hugeCount" is in bytes, so it will be multiplied by 8 to make it a bit count
    +"00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000150"

  ]);
});