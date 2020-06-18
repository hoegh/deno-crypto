export const w = 32;
export type T = number;

export function rotl(n: T) {
  return (x:T) => (x << n) | (x >>> w-n)
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
  return (x:T) => rotr_n1(x) ^ rotr_n2(x) ^ (x >>> n3);
}
