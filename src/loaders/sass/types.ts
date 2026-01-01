import type {
  Importer as SassImporter,
  FileImporter as SassFileImporter,
} from "sass/types/importer";
import type { StringOptions as SassOptions } from "sass/types/options";
import type { CompileResult } from "sass/types/compile";

export type { CanonicalizeContext, NodePackageImporter } from "sass/types/importer";
export type SassModule = typeof import("sass");
export type SyncImporter = SassImporter<"sync">;
export type SyncFileImporter = SassFileImporter<"sync">;
export type AsyncImporter = SassImporter<"async">;
export type AsyncFileImporter = SassFileImporter<"async">;
export type Importer = SyncImporter | AsyncImporter;
export type FileImporter = SyncFileImporter | AsyncFileImporter;

export type Type = "sync" | "async";

export interface PublicOptions<T extends Type = Type> extends Pick<
  SassOptions<T>,
  | "url"
  | "charset"
  | "loadPaths"
  | "importers"
  | "style"
  | "syntax"
  | "quietDeps"
  | "fatalDeprecations"
  | "futureDeprecations"
  | "silenceDeprecations"
  | "verbose"
> {}

export type Options<T extends Type = Type> = SassOptions<T>;

export type Result = CompileResult;
