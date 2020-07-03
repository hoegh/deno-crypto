import {shapad, LengthSize} from "./padder.ts"
import {convert32to8} from "./converters.ts"
import {splitBlocksIntoBlocks} from "./block_splitter.ts"

import {sha1_h0, sha1_block} from "./sha1.ts"
import {sha256_h0, sha256_block} from "./sha256.ts"

const blockLength = 64;
const blockLengthN = 64n;

type shaBlockFunc = (h: Uint32Array, m: Uint8Array) => Uint32Array

export interface ShaParams{
  shaFunc: shaBlockFunc;
  h0: () => Uint32Array;
}

/** parameters for SHA-1 */
export const SHA1: ShaParams = {
  shaFunc: sha1_block,
  h0: sha1_h0
}

/** parameters for SHA-256 */
export const SHA256: ShaParams = {
  shaFunc: sha256_block,
  h0: sha256_h0
}

function shaSyncFunc(params: ShaParams) {
  return (msg: Iterable<number>) => {
    let dataBlocks = shapad(msg, blockLength, LengthSize.Len64Bits);

    var h = params.h0();
    for(let block of dataBlocks) {
      h = params.shaFunc(h, block);
    }

    return convert32to8(h);
  }
}

function shaFunc(params: ShaParams) {
  return async (msg: AsyncIterable<Uint8Array>) => {
    let count = 0n;
    let rest = new Uint8Array(0);

    var h = params.h0();
    let dataBlocks = splitBlocksIntoBlocks(msg, blockLength);
    rest = new Uint8Array(0); //will be overwritten if there a short block to carry over

    for await (let block of dataBlocks) {
      if (block.length == blockLength) {
        h = params.shaFunc(h, block);
        count += blockLengthN;
      } else {
        // if the last block is of insufficient length, it should carry over
        rest = block.slice();
      }
    }

    //pad last block with length info (or, if everything adds up, add an extra block with padding + length)
    for (let block of shapad(rest, blockLength, LengthSize.Len64Bits, count)) {
      h = params.shaFunc(h, block);
    }

    return convert32to8(h);
  }
}

/**
 * Calculates a hash over an iterator of uint8 numbers.
 */
export let shaSync = (params: ShaParams, msg: Iterable<number>) => shaSyncFunc(params)(msg);

/**
 * Asynchronously calculates a hash over iterator of Uint8Array buffers.
 */
export let sha = (params: ShaParams, msg: AsyncIterable<Uint8Array>) => shaFunc(params)(msg);
