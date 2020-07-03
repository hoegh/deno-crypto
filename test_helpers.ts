/** collects a iterator of Uint8Array into an Uint8Array[] */
export function collect(iter: Iterable<Uint8Array>) {
  let result = new Array<Uint8Array>();
  for(let part of iter) {
    result.push(part);
  }
  return result;
}

/** collects a iterator of Uint8Array into an Uint8Array[] */
export async function collectAsync(iter: AsyncIterable<Uint8Array>) {
  let result = new Array<Uint8Array>();
  for await(let part of iter) {
    result.push(part);
  }
  return result;
}

/** wraps an iterator into an async interator */
export async function* asynchify<T>(iter: Iterable<T>) {
  for(let chunk of iter) yield chunk;
}

function *iterateArrays(input: Uint8Array[]) {
  for(let arr of input) {
    for(let b of arr) {
      yield b
    }
  }
}

/** flattens an Uint8Array[] into an Uint8Array */
export function flatten(input: Uint8Array[]) {
  return Uint8Array.from(iterateArrays(input));
}
