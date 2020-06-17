import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { encodeToString, decodeString } from "https://deno.land/std/encoding/hex.ts";
import { encode } from "https://deno.land/std/encoding/utf8.ts";

import { readFileStr } from 'https://deno.land/std/fs/read_file_str.ts';

import { sha1, sha1Sync } from "./sha1.ts";
import { asynchify } from "./test_helpers.ts";
import { splitIntoBlocks } from "./block_splitter.ts";


// short examples taken from https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Standards-and-Guidelines/documents/examples/SHA1.pdf

Deno.test("SHA1 Example: One Block Message Sample", () => {
  let result = sha1Sync(encode("abc"));
  assertEquals(result, decodeString("A9993E364706816ABA3E25717850C26C9CD0D89D"));
})

Deno.test("SHA1 Example: Two Block Message Sample", async () => {
  let result = await sha1(asynchify([encode("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq")]));
  assertEquals(result, decodeString("84983E441C3BD26EBAAE4AA1F95129E5E54670F1"));
})



//---
// tests based on SHA byte test vectors: https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Algorithm-Validation-Program/documents/shs/shabytetestvectors.zip

// const decoder = new TextDecoder("utf-8");
// const sha1_shortmessage_testdata = decoder.decode(Deno.readFileSync("shabytetestvectors/SHA1ShortMsg.rsp"));
// const sha1_longmessage_testdata = decoder.decode(Deno.readFileSync("shabytetestvectors/SHA1LongMsg.rsp"))
const sha1_shortmessage_testdata = await readFileStr("shabytetestvectors/SHA1ShortMsg.rsp");
const sha1_longmessage_testdata = await readFileStr("shabytetestvectors/SHA1LongMsg.rsp");

function syncTestFactory(msg: string, digest: string) {
  return ()=> {
    let input = decodeString(msg);
    let result = sha1Sync(input);
    assertEquals(encodeToString(result), digest);
  }
}

function testFactory(msg: string, digest: string) {
  return async ()=> {
    let input = asynchify(splitIntoBlocks(decodeString(msg), 768)); //split the input into chuncks not always aligned with blocksize
    let result = await sha1(input);
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

shabytest("SHA-1 ShortMsg", sha1_shortmessage_testdata, syncTestFactory);
shabytest("SHA-1 async ShortMsg", sha1_shortmessage_testdata, testFactory);
shabytest("SHA-1 LongMsg", sha1_longmessage_testdata, syncTestFactory);
shabytest("SHA-1 async LongMsg", sha1_longmessage_testdata, testFactory);
