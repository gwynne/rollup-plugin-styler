import path from "node:path";
import fs from "fs-extra";
import { type RawSourceMap, SourceMapConsumer } from "source-map-js";
import { dataURIRe } from "../loaders/postcss/common.js";
import { isAbsolutePath, normalizePath, relativePath, resolvePath } from "./path.js";

const mapBlockRe = /(?:\n|\r\n)?\/\*[#*@]+?\s*?sourceMappingURL\s*?=\s*?(\S+)\s*?\*+?\//gm;
const mapLineRe = /(?:\n|\r\n)?\/\/[#@]+?\s*?sourceMappingURL\s*?=\s*?(\S+)\s*?$/gm;

export async function getMap(code: string, id?: string): Promise<string | undefined> {
  const [, data] = mapBlockRe.exec(code) ?? mapLineRe.exec(code) ?? [];
  if (!data) return;

  const [, uriMap] = dataURIRe.exec(data) ?? [];
  if (uriMap) return Buffer.from(uriMap, "base64").toString();

  if (!id) throw new Error("Extracted map detected, but no ID is provided");
  const mapFileName = path.resolve(path.dirname(id), data);
  const exists = await fs.pathExists(mapFileName);
  if (!exists) return;
  return fs.readFile(mapFileName, "utf8");
}

export const stripMap = (code: string): string =>
  code.replaceAll(mapBlockRe, "").replaceAll(mapLineRe, "");

class MapModifier {
  private readonly map?: RawSourceMap;

  constructor(map?: string | RawSourceMap) {
    if (typeof map === "string")
      try {
        this.map = JSON.parse(map) as RawSourceMap;
      } catch {
        /* noop */
      }
    else this.map = map;
  }

  modify(f: (m: RawSourceMap) => void): this {
    if (!this.map) return this;
    f(this.map);
    return this;
  }

  modifySources(op: (source: string) => string): this {
    if (!this.map) return this;
    if (this.map.sources) this.map.sources = this.map.sources.map(s => op(s));
    return this;
  }

  resolve(dir = process.cwd()): this {
    return this.modifySources(source => {
      if (source === "<no source>") return source;
      return resolvePath(dir, source);
    });
  }

  relative(dir = process.cwd()): this {
    return this.modifySources(source => {
      if (source === "<no source>") return source;
      if (isAbsolutePath(source)) return relativePath(dir, source);
      return normalizePath(source);
    });
  }

  toObject(): RawSourceMap | undefined {
    return this.map;
  }

  toString(): string | undefined {
    if (!this.map) return this.map;
    return JSON.stringify(this.map);
  }

  toConsumer(): SourceMapConsumer | undefined {
    if (!this.map) return this.map;
    return new SourceMapConsumer(this.map);
  }

  toCommentData(): string {
    const map = this.toString();
    if (!map) return "";
    const sourceMapData = Buffer.from(map).toString("base64");
    return `\n/*# sourceMappingURL=data:application/json;base64,${sourceMapData} */`;
  }

  toCommentFile(fileName: string): string {
    if (!this.map) return "";
    return `\n/*# sourceMappingURL=${fileName} */`;
  }
}

export const mm = (map?: string | RawSourceMap): MapModifier => new MapModifier(map);
