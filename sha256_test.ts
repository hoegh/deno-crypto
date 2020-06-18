import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { encodeToString, decodeString } from "https://deno.land/std/encoding/hex.ts";
import { encode } from "https://deno.land/std/encoding/utf8.ts";

import { readFileStr } from 'https://deno.land/std/fs/read_file_str.ts';

import { sha256, sha256Sync } from "./sha256.ts";
import { asynchify } from "./test_helpers.ts";
import { splitIntoBlocks } from "./block_splitter.ts";


// short examples taken from https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Standards-and-Guidelines/documents/examples/SHA256.pdf

Deno.test("SHA256 Example: One Block Message Sample", () => {
  let result = sha256Sync(encode("abc"));
  assertEquals(result, decodeString("BA7816BF8F01CFEA414140DE5DAE2223B00361A396177A9CB410FF61F20015AD"));
})

Deno.test("SHA256 Example: Two Block Message Sample", async () => {
  let result = await sha256(asynchify([encode("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq")]));
  assertEquals(result, decodeString("248D6A61D20638B8E5C026930C3E6039A33CE45964FF2167F6ECEDD419DB06C1"));
})



//---
// tests based on SHA byte test vectors: https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Algorithm-Validation-Program/documents/shs/shabytetestvectors.zip

const sha256_shortmessage_testdata = await readFileStr("shabytetestvectors/SHA256ShortMsg.rsp");
const sha256_longmessage_testdata = await readFileStr("shabytetestvectors/SHA256LongMsg.rsp");

function syncTestFactory(msg: string, digest: string) {
  return ()=> {
    let input = decodeString(msg);
    let result = sha256Sync(input);
    assertEquals(encodeToString(result), digest);
  }
}

function testFactory(msg: string, digest: string) {
  return async ()=> {
    let input = asynchify(splitIntoBlocks(decodeString(msg), 768)); //split the input into chuncks not always aligned with blocksize
    let result = await sha256(input);
    assertEquals(encodeToString(result), digest);
  }
}

function shabytest(suite: string, testdata: string, testfactory: (msg: string, digest: string) => ()=>void) {
  var name: string = "";
  var msg: string="";
  var digest: string="";

  let lines = testdata.split("\n");
  for (var line of lines) {
    line = line.trim();

    if (line.startsWith("Len =")) {
      name = line;
    } else if (line.startsWith("Msg =")) {
      msg = line.slice(6);
      if (name == "Len = 0") {
        msg = "";
      }
    } else if (line.startsWith("MD =")) {
      digest = line.slice(5);

      let shortMsg = msg.length>30 ? msg.slice(0,30)+"..." : msg;
      Deno.test(suite+" "+name+" (msg="+shortMsg+", digest="+digest+")", testfactory(msg, digest));
    }

  }
};

shabytest("SHA-256 ShortMsg", sha256_shortmessage_testdata, syncTestFactory);
shabytest("SHA-256 async ShortMsg", sha256_shortmessage_testdata, testFactory);
shabytest("SHA-256 LongMsg", sha256_longmessage_testdata, syncTestFactory);
shabytest("SHA-256 async LongMsg", sha256_longmessage_testdata, testFactory);
