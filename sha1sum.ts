import { SHA1 } from "./sha.ts"
import { shasum } from "./shasum.ts"

const filenames = Deno.args;

shasum(SHA1, filenames)
