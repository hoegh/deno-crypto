/** Makes an compound interator out of a prefix and an iterator */
export function* join(prefix: Uint8Array, iter: Iterable<number>) {
  yield* prefix;
  yield* iter;
}

/**
 * Makes an iterator group in input iterator of uint8 into blocks of a certain length. The last block may be shorter.
 * If no uint8 is given (an empty input iterator), then no blocks will be emitted.
 */
export function* splitIntoBlocks(iter: Iterable<number>, blockSize: number) {
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
