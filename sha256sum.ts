import { SHA256 } from "./sha.ts"
import { shasum } from "./shasum.ts"

const filenames = Deno.args;

shasum(SHA256, filenames)
