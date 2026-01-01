import path from "node:path";
import { packageFilterBuilder, resolveAsync, resolveSync } from "../../utils/resolve";
import { getUrlOfPartial, isModule, normalizeUrl } from "../../utils/url";
import { CanonicalizeContext, AsyncFileImporter, SyncFileImporter } from "./types";
import { pathToFileURL } from "url";

const extensions = [".scss", ".sass", ".css"];
const conditions = ["sass", "style"];

export const importer: AsyncFileImporter = {
  async findFileUrl(url: string, context: CanonicalizeContext): Promise<URL | null> {
    if (!isModule(url)) {
      return null;
    }
    const moduleUrl = normalizeUrl(url);
    const partialUrl = getUrlOfPartial(moduleUrl);
    const options = {
      caller: "Sass importer",
      basedirs: [path.dirname(context.containingUrl?.pathname ?? "./")],
      extensions,
      packageFilter: packageFilterBuilder({ conditions }),
    };
    // Give precedence to importing a partial
    try {
      const resolved = await resolveAsync([partialUrl, moduleUrl], options);

      if (!resolved) {
        return null;
      }
      return pathToFileURL(resolved.replace(/\.css$/i, ""));
    } catch {
      return null;
    }
  },
};

export const importerSync: SyncFileImporter = {
  findFileUrl(url: string, context: CanonicalizeContext): URL | null {
    if (!isModule(url)) {
      return null;
    }
    const moduleUrl = normalizeUrl(url);
    const partialUrl = getUrlOfPartial(moduleUrl);
    const options = {
      caller: "Sass importer",
      basedirs: [path.dirname(context.containingUrl?.pathname ?? "./")],
      extensions,
      packageFilter: packageFilterBuilder({ conditions }),
    };
    // Give precedence to importing a partial
    try {
      const resolved = resolveSync([partialUrl, moduleUrl], options);

      if (!resolved) {
        return null;
      }
      return pathToFileURL(resolved.replace(/\.css$/i, ""));
    } catch {
      return null;
    }
  },
};
