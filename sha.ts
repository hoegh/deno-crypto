import {shapad, LengthSize} from "./padder.ts"
import {convert32to8, convert64to8} from "./converters.ts"
import {splitBlocksIntoBlocks} from "./block_splitter.ts"

import {sha1_h0, sha1_block} from "./sha1.ts"
import {sha256_h0, sha256_block} from "./sha256.ts"
import {sha512_h0, sha512_block} from "./sha512.ts"

type shaBlockFunc<T> = (h: T, m: Uint8Array) => T

export interface ShaParams<T>{
  shaFunc: shaBlockFunc<T>;
  h0: () => T;
  blockLength: number,
  lengthSize: LengthSize;
  converter: (a:T) => Uint8Array;
}

/** parameters for SHA-1 */
export const SHA1: ShaParams<Uint32Array> = {
  shaFunc: sha1_block,
  h0: sha1_h0,
  blockLength: 64,
  lengthSize: LengthSize.Len64Bits,
  converter: convert32to8
}

/** parameters for SHA-256 */
export const SHA256: ShaParams<Uint32Array> = {
  shaFunc: sha256_block,
  h0: sha256_h0,
  blockLength: 64,
  lengthSize: LengthSize.Len64Bits,
  converter: convert32to8
}

export const SHA512: ShaParams<BigUint64Array> = {
  shaFunc: sha512_block,
  h0: sha512_h0,
  blockLength: 128,
  lengthSize: LengthSize.Len128Bits,
  converter: convert64to8
}

function shaSyncFunc<T>(params: ShaParams<T>) {
  return (msg: Iterable<number>) => {
    let dataBlocks = shapad(msg, params.blockLength, params.lengthSize);

    var h = params.h0();
    for(let block of dataBlocks) {
      h = params.shaFunc(h, block);
    }

    return params.converter(h);
  }
}

function shaFunc<T>(params: ShaParams<T>) {
  let blockLengthN = BigInt(params.blockLength);
  return async (msg: AsyncIterable<Uint8Array>) => {
    let count = 0n;
    let rest = new Uint8Array(0);

    var h = params.h0();
    let dataBlocks = splitBlocksIntoBlocks(msg, params.blockLength);
    rest = new Uint8Array(0); //will be overwritten if there a short block to carry over

    for await (let block of dataBlocks) {
      if (block.length == params.blockLength) {
        h = params.shaFunc(h, block);
        count += blockLengthN;
      } else {
        // if the last block is of insufficient length, it should carry over
        rest = block.slice();
      }
    }

    //pad last block with length info (or, if everything adds up, add an extra block with padding + length)
    for (let block of shapad(rest, params.blockLength, params.lengthSize, count)) {
      h = params.shaFunc(h, block);
    }

    return params.converter(h);
  }
}

/**
 * Calculates a hash over an iterator of uint8 numbers.
 */
export let shaSync = <T>(params: ShaParams<T>, msg: Iterable<number>) => shaSyncFunc(params)(msg);

/**
 * Asynchronously calculates a hash over iterator of Uint8Array buffers.
 */
export let sha = <T>(params: ShaParams<T>, msg: AsyncIterable<Uint8Array>) => shaFunc(params)(msg);
