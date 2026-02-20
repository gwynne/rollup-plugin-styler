import { getMap, stripMap } from "../utils/sourcemap.js";
import type { Loader } from "./types.js";

const loader: Loader = {
  name: "sourcemap",
  alwaysProcess: true,
  async process({ code, map }) {
    map = (await getMap(code, this.id)) ?? map;
    return { code: stripMap(code), map };
  },
};

export default loader;
