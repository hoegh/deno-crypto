export const w = 64n;
export type T = bigint;

// this is mostly like primitives32, but there are subtle differences; it can handle unsigned 64-bit, but needs to be clamped.

export function rotl(n: T) {
  return (x:T) => BigInt.asUintN(64, x << n) | (x >> w-n)
}

export function rotr(n: T) {
  return rotl(w-n)
}

export function ch(x: T, y: T, z: T) {
  return (x & y) ^ (~x & z);
}

export function maj(x: T, y: T, z: T) {
  return (x & y) ^ (x & z) ^ (y & z);
}

export function Sigma(n1: T, n2: T, n3: T) {
  let rotr_n1 = rotr(n1);
  let rotr_n2 = rotr(n2);
  let rotr_n3 = rotr(n3);
  return (x:T) => rotr_n1(x) ^ rotr_n2(x) ^ rotr_n3(x);
}

export function sigma(n1: T, n2: T, n3: T) {
  let rotr_n1 = rotr(n1);
  let rotr_n2 = rotr(n2);
  return (x:T) => rotr_n1(x) ^ rotr_n2(x) ^ (x >> n3);
}
