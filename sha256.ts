import {ch, maj, Sigma, sigma} from "./primitives32.ts"

import {splitIntoBlocks, join} from "./block_splitter.ts"
import {shapad, LengthSize} from "./padder.ts"
import {convert8to32, convert32to8} from "./converters.ts"

const a=0, b=1, c=2, d=3, e=4, f=5, g=6, h=7;

const blockLength = 64;
const blockLengthN = 64n;
const roundCount = 64;

const h0 = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
const k = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);

let Sigma0 = Sigma(2, 13, 22);
let Sigma1 = Sigma(6, 11, 25);
let sigma0 = sigma(7, 18, 3);
let sigma1 = sigma(17, 19, 10)

function messageSchedule (m: Uint8Array): Uint32Array {
  let w = new Uint32Array(roundCount);
  w.set(convert8to32(m), 0);

  for(let t=16; t<roundCount; t++) {
    w[t] = sigma1(w[t-2]) + w[t-7] + sigma0(w[t-15]) + w[t-16];
  }

  return w;
}

function sha256_block(hash: Uint32Array, m: Uint8Array): Uint32Array {
  let w = messageSchedule(m);
  let vars = new Uint32Array(8);

  vars.set(hash, 0);

  for(let t=0; t<roundCount; t++) {
    let T1 = vars[h] + Sigma1(vars[e]) + ch(vars[e], vars[f], vars[g]) + k[t] + w[t];
    let T2 = Sigma0(vars[a]) + maj(vars[a], vars[b], vars[c]);
    vars[h] = vars[g];
    vars[g] = vars[f];
    vars[f] = vars[e];
    vars[e] = vars[d] + T1;
    vars[d] = vars[c];
    vars[c] = vars[b];
    vars[b] = vars[a];
    vars[a] = T1 + T2
  }

  for(var idx = 0; idx<8; idx++) {
    vars[idx] = (vars[idx] | 0) + hash[idx];
  }

  return vars;
}

/**
 * Calculates a SHA256 hash over an iterator of uint8 numbers.
 */
export function sha256Sync(msg: Iterable<number>): Uint8Array {
  let dataBlocks = shapad(msg, blockLength, LengthSize.Len64Bits);

  var h = h0.slice();
  for(let block of dataBlocks) {
    h = sha256_block(h, block);
  }

  return convert32to8(h);
}

/**
 * Asynchronously calculates a SHA256 hash over iterator of Uint8Array buffers.
 */
export async function sha256(msg: AsyncIterable<Uint8Array>) {
  let count = 0n;
  let rest = new Uint8Array(0);

  var h = h0.slice();
  for await (let msgPart of msg) {
    let dataBlocks = splitIntoBlocks(join(rest, msgPart), blockLength);
    rest = new Uint8Array(0); //will be overwritten if there a short block to carry over

    for(let block of dataBlocks) {
      if (block.length == blockLength) {
        h = sha256_block(h, block);
        count += blockLengthN;
      } else {
        // if the last block is of insufficient length, it should carry over
        rest = block;
      }
    }
  }

  //pad last block with length info (or, if everything adds up, add an extra block with padding + length)
  for (let block of shapad(rest, blockLength, LengthSize.Len64Bits, count)) {
    h = sha256_block(h, block);
  }

  return convert32to8(h);
}
