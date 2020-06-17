/** Converts an Uint8Array to an Uint32Array using bigendianess */
export function convert8to32(input: Uint8Array) {
  let len=input.byteLength/Uint32Array.BYTES_PER_ELEMENT;

  let result = new Uint32Array(len);

  let inputView = new DataView(input.buffer);
  for (let idx=0; idx < len; idx++) {
    result[idx]=inputView.getUint32(idx*Uint32Array.BYTES_PER_ELEMENT, false);
  }

  return result;
}

/** Converts an Uint8Array to an BigUint64Array using bigendianess */
export function convert8to64(input: Uint8Array) {
  let len=input.byteLength/BigUint64Array.BYTES_PER_ELEMENT;

  let result = new BigUint64Array(len);

  let inputView = new DataView(input.buffer);
  for (let idx=0; idx < len; idx++) {
    result[idx]=inputView.getBigUint64(idx*BigUint64Array.BYTES_PER_ELEMENT, false);
  }

  return result;
}

/** Converts an Uint32Array to an Uint8Array using bigendianess */
export function convert32to8(input: Uint32Array) {
  let result = new Uint8Array(input.byteLength);

  let resultView = new DataView(result.buffer);
  for(let idx=0; idx<input.length; idx++) {
    resultView.setUint32(idx*input.BYTES_PER_ELEMENT, input[idx], false);
  }
  return result;
}

/** Converts an BigUint64Array to an Uint8Array using bigendianess */
export function convert64to8(input: BigUint64Array) {
  let result = new Uint8Array(input.byteLength);

  let resultView = new DataView(result.buffer);
  for(let idx=0; idx<input.length; idx++) {
    resultView.setBigUint64(idx*input.BYTES_PER_ELEMENT, input[idx], false);
  }
  return result;
}
