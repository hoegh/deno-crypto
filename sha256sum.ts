import { encodeToString } from "https://deno.land/std/encoding/hex.ts";
import { sha, SHA256 } from "./sha.ts"

const filenames = Deno.args;
for (const filename of filenames) {
  const filestat = await Deno.stat(filename);
  if (filestat.isFile) {
    const file = await Deno.open(filename);
    const iter = Deno.iter(file, {
      bufSize: 1024 * 1024
    });

    const hash = await sha(SHA256, iter);
    const hashHex = encodeToString(hash);

    Deno.close(file.rid);

    console.log(hashHex+"  "+filename);
  }
}
