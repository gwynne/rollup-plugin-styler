import type { CSSImports } from "icss-utils";
import type { ProcessOptions } from "postcss";
import type Processor from "postcss/lib/processor";
import type { Load } from "./load.js";

export default async function (
  icssImports: CSSImports,
  load: Load,
  file: string,
  extensions: string[],
  processor: Processor,
  opts?: ProcessOptions,
): Promise<Record<string, string>> {
  const imports: Record<string, string> = {};

  for await (const [url, values] of Object.entries(icssImports)) {
    const exports = await load(url, file, extensions, processor, opts);
    for (const [k, v] of Object.entries(values)) {
      imports[k] = exports[v];
    }
  }

  return imports;
}
