import { normalizePath } from "../../utils/path";
import { Loader } from "../types";
import loadSass from "./load";
import { importer, importerSync } from "./importer";
import {
  Importer,
  FileImporter,
  NodePackageImporter,
  Options,
  PublicOptions,
  Result,
} from "./types";
import { pathToFileURL, fileURLToPath } from "url";

/** Options for Sass loader */
export interface SASSLoaderOptions extends Record<string, unknown>, PublicOptions {
  /** Force Sass implementation */
  impl?: string;
  /** Forcefully enable/disable sync mode */
  sync?: boolean;
}

const loader: Loader<SASSLoaderOptions> = {
  name: "sass",
  test: /\.(sass|scss)$/i,
  async process({ code, map }) {
    const options = { ...this.options };
    const [sass, type] = await loadSass(options.impl);
    const sync = options.sync ?? type !== "node-sass";
    const importers: (NodePackageImporter | Importer | FileImporter)[] = [
      sync ? importerSync : importer,
    ];

    if (options.importers) importers.push(...options.importers);

    const render = async (options: Options): Promise<Result> => {
      return sync
        ? new Promise(resolve => resolve(sass.compileString(code, options as Options<"sync">)))
        : sass.compileStringAsync(code, options);
    };

    // Remove non-Sass options
    delete options.impl;
    delete options.sync;

    const res = await render({
      ...options,
      url: pathToFileURL(this.id),
      syntax: /\.sass$/i.test(this.id) ? "indented" : "scss",
      sourceMap: true,
      sourceMapIncludeSources: true,
      importers: importers,
    });

    const deps = res.loadedUrls.map(u => fileURLToPath(u));
    for (const dep of deps) this.deps.add(normalizePath(dep));

    if (res.sourceMap) {
      res.sourceMap.sources = res.sourceMap.sources.map(s =>
        s.startsWith("file:///") ? fileURLToPath(s) : s,
      );
    }
    return {
      code: res.css,
      map: res.sourceMap ? JSON.stringify(res.sourceMap) : map,
    };
  },
};

export default loader;
