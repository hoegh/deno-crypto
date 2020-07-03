import { splitBytesIntoBlocks } from "./block_splitter.ts"

/** The size of the message length counter added to the end of the padding */
export enum LengthSize {
  Len64Bits = 64,
  Len128Bits = 128
}

function pad(blockData: ArrayBuffer, fromIdx: number) {
  let uint8 = new Uint8Array(blockData);
  uint8.fill(0, fromIdx); //zero out padding
  uint8[fromIdx]=0x80 //padding start marker
}

function setLength(blockData: ArrayBuffer, lengthInBytes: bigint, lengthSize: LengthSize) {
  let lengthInBits = lengthInBytes*8n;

  let resultView = new DataView(blockData);
  resultView.setBigUint64(blockData.byteLength-8, lengthInBits, false);

  if (lengthSize==LengthSize.Len128Bits) {
    resultView.setBigUint64(blockData.byteLength-16, lengthInBits>>64n, false)
  }
}

/**
 * Adds a SHA padding to a sequence of uint8 bytes given by input iterator. The output will partitions into Uint8Array blocks.
 * A SHA pad consists of a "1"-bit (and as this is bytes, it will be a 0x80 byte) following by 0 bits up until a counter
 * of the number of bits in the message. If there isn't room for the 1-bit start plus length, another block will be added.
 *
 * An optional initialCount can be given, if shapad() isn't given the entire message, but only the last part; then the
 * message length emitted as part of the pad will be adjusted with the initialCount.
 */
export function* shapad(iter: Iterable<number>, blockSize: number, lengthSize: LengthSize, initialCount: bigint=0n): Generator<Uint8Array> {
  var count = initialCount;

  var lastBlock;
  for(let block of splitBytesIntoBlocks(iter, blockSize)) {
    count += BigInt(block.length);
    if (block.length==blockSize) {
      yield block;
    } else {
      lastBlock = block;
    }
  }

  if (lastBlock) {
    let result = new ArrayBuffer(blockSize);

    // copy over the last block
    let resUint8 = new Uint8Array(result);
    resUint8.set(lastBlock, 0);

    //pad out
    pad(result, lastBlock.length);

    if (blockSize-lengthSize/8>lastBlock.length) {
      //room for marker+length in the last block

      setLength(result, count, lengthSize);
      yield resUint8;
    } else {
      // insufficient room, make another block for length
      yield resUint8;

      let extra = new ArrayBuffer(blockSize);
      let extraUint8 = new Uint8Array(extra);
      extraUint8.fill(0);
      setLength(extra, count, lengthSize);
      yield extraUint8;
    }
  } else {
    // we ended up on a block boundary, emit a full block of padding
    let result = new ArrayBuffer(blockSize);
    pad(result, 0);
    setLength(result, count, lengthSize);

    yield new Uint8Array(result);
  }
}
