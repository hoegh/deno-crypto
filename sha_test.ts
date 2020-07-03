import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { encodeToString, decodeString } from "https://deno.land/std/encoding/hex.ts";
import { readFileStr } from 'https://deno.land/std/fs/read_file_str.ts';

import { asynchify } from "./test_helpers.ts";
import { splitBytesIntoBlocks } from "./block_splitter.ts";

import { sha, shaSync, ShaParams, SHA1, SHA256 } from "./sha.ts";

export function shabytest(suite: string, testdata: string, sha: ShaParams, testfactory: (sha: ShaParams, msg: string, digest: string) => ()=>void) {
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
      Deno.test(suite+" "+name+" (msg="+shortMsg+", digest="+digest+")", testfactory(sha, msg, digest));
    }

  }
};

function syncTestFactory(shaParams: ShaParams, msg: string, digest: string) {
  return ()=> {
    let input = decodeString(msg);
    let result = shaSync(shaParams, input);
    assertEquals(encodeToString(result), digest);
  }
}

function testFactory(shaParams: ShaParams, msg: string, digest: string) {
  return async ()=> {
    let input = asynchify(splitBytesIntoBlocks(decodeString(msg), 768)); //split the input into chuncks not always aligned with blocksize
    let result = await sha(shaParams, input);
    assertEquals(encodeToString(result), digest);
  }
}

//---
// tests based on SHA byte test vectors: https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Algorithm-Validation-Program/documents/shs/shabytetestvectors.zip

const sha1_shortmessage_testdata = await readFileStr("shabytetestvectors/SHA1ShortMsg.rsp");
const sha1_longmessage_testdata = await readFileStr("shabytetestvectors/SHA1LongMsg.rsp");

shabytest("SHA-1 ShortMsg", sha1_shortmessage_testdata, SHA1, syncTestFactory);
shabytest("SHA-1 async ShortMsg", sha1_shortmessage_testdata, SHA1, testFactory);
shabytest("SHA-1 LongMsg", sha1_longmessage_testdata, SHA1, syncTestFactory);
shabytest("SHA-1 async LongMsg", sha1_longmessage_testdata, SHA1, testFactory);



//---
// tests based on SHA byte test vectors: https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Algorithm-Validation-Program/documents/shs/shabytetestvectors.zip

const sha256_shortmessage_testdata = await readFileStr("shabytetestvectors/SHA256ShortMsg.rsp");
const sha256_longmessage_testdata = await readFileStr("shabytetestvectors/SHA256LongMsg.rsp");

shabytest("SHA-256 ShortMsg", sha256_shortmessage_testdata, SHA256, syncTestFactory);
shabytest("SHA-256 async ShortMsg", sha256_shortmessage_testdata, SHA256, testFactory);
shabytest("SHA-256 LongMsg", sha256_longmessage_testdata, SHA256, syncTestFactory);
shabytest("SHA-256 async LongMsg", sha256_longmessage_testdata, SHA256, testFactory);
