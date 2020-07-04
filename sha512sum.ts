import { SHA512 } from "./sha.ts"
import { shasum } from "./shasum.ts"

const filenames = Deno.args;

shasum(SHA512, filenames)
