import {rotl, ch, maj} from "./primitives32.ts"
import {parity} from "./primitives_sha1.ts"

import {splitIntoBlocks, join} from "./block_splitter.ts"
import {shapad, LengthSize} from "./padder.ts"
import {convert8to32, convert32to8} from "./converters.ts"

const a=0, b=1, c=2, d=3, e=4, T=5;

const blockLength = 64;
const blockLengthN = 64n;
const roundCount = 80;

const h0 = new Uint32Array([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0]);
const k = function() {
  let k = new Uint32Array(roundCount);
  k.fill(0x5a827999, 0, 20);
  k.fill(0x6ed9eba1, 20, 40);
  k.fill(0x8f1bbcdc, 40, 60);
  k.fill(0xca62c1d6, 60, 80);

  return k;
}();

let rotl_1 = rotl(1);
let rotl_5 = rotl(5);
let rotl_30 = rotl(30);

function f(t: number): (x: number, y: number, z: number) => number {
  switch (t/20 | 0) {
    case 0: return ch;
    case 1: return parity;
    case 2: return maj;
    default: return parity;
  }
}

function messageSchedule (m: Uint8Array): Uint32Array {
  let w = new Uint32Array(roundCount);
  w.set(convert8to32(m), 0);

  for(let t=16; t<roundCount; t++) {
    w[t] = rotl_1(w[t-3] ^ w[t-8] ^ w[t-14] ^ w[t-16])
  }

  return w;
}

function sha1_block(h: Uint32Array, m: Uint8Array): Uint32Array {
  let w = messageSchedule(m);
  let vars = new Uint32Array(6);

  vars.set(h, 0);

  for(let t=0; t<roundCount; t++) {
    vars[T] = rotl_5(vars[a]) + f(t)(vars[b], vars[c], vars[d]) + vars[e] + k[t] + w[t];
    vars[e] = vars[d];
    vars[d] = vars[c];
    vars[c] = rotl_30(vars[b]);
    vars[b] = vars[a];
    vars[a] = vars[T];
  }

  for(var idx = 0; idx<5; idx++) {
    vars[idx] = (vars[idx] | 0) + h[idx];
  }

  return vars.slice(0,5);
}

/**
 * Calculates a SHA1 hash over an iterator of uint8 numbers.
 */
export function sha1Sync(msg: Iterable<number>): Uint8Array {
  let dataBlocks = shapad(msg, blockLength, LengthSize.Len64Bits);

  var h = h0.slice();
  for(let block of dataBlocks) {
    h = sha1_block(h, block);
  }

  return convert32to8(h);
}

/**
 * Asynchronously calculates a SHA1 hash over iterator of Uint8Array buffers.
 */
export async function sha1(msg: AsyncIterable<Uint8Array>) {
  let count = 0n;
  let rest = new Uint8Array(0);

  var h = h0.slice();
  for await (let msgPart of msg) {
    let dataBlocks = splitIntoBlocks(join(rest, msgPart), blockLength);
    rest = new Uint8Array(0); //will be overwritten if there a short block to carry over

    for(let block of dataBlocks) {
      if (block.length == blockLength) {
        h = sha1_block(h, block);
        count += blockLengthN;
      } else {
        // if the last block is of insufficient length, it should carry over
        rest = block;
      }
    }
  }

  //pad last block with length info (or, if everything adds up, add an extra block with padding + length)
  for (let block of shapad(rest, blockLength, LengthSize.Len64Bits, count)) {
    h = sha1_block(h, block);
  }

  return convert32to8(h);
}
