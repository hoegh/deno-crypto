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
