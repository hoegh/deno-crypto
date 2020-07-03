/** Makes an compound interator out of a prefix and an iterator */
export function* join(prefix: Uint8Array, iter: Iterable<number>) {
  yield* prefix;
  yield* iter;
}

/**
 * Makes an iterator group an input iterator of uint8 into blocks of a certain length. The last block may be shorter.
 * If no uint8 is given (an empty input iterator), then no blocks will be emitted.
 */
export function* splitBytesIntoBlocks(iter: Iterable<number>, blockSize: number) {
  let block = new Uint8Array(blockSize);
  var idx = 0;
  for(let value of iter) {
    block[idx] = value;
    idx++;

    if (idx==blockSize) {
      idx = 0;
      yield block.slice();
    }
  }
  if (idx > 0) yield block.slice(0,idx);
}

/**
 * Makes an iterator group an input iterator of Uint8Array into blocks of a certain length. The last block may be shorter.
 * If an empty input iterator is given, then no blocks will be emitted.
 */
export async function* splitBlocksIntoBlocks(iter: AsyncIterable<Uint8Array>, blockSize: number) {
  let block = new Uint8Array(blockSize);
  let offset = 0;
  for await (let chunk of iter) {

    if (offset !== 0) {
      let borrow = blockSize-offset;
      if (borrow>chunk.length) {
        // current chunk was too short to have enough to emit, so make a copy and get another chuck
        block.set(chunk, offset);
        offset += chunk.length;
        continue;
      } else {
        block.set(chunk.slice(0, borrow), offset);
        yield block.slice();
        offset = borrow;
      }
    }

    for(;offset<chunk.length-blockSize;offset+=blockSize) {
      yield chunk.slice(offset, offset+blockSize);
    }
    let rest = chunk.slice(offset);
    block.set(rest);
    offset = rest.length;
  }
  if (offset > 0) yield block.slice(0,offset);
}
