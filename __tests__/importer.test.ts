import postcss from "postcss";
import type { ImportFile } from "src/loaders/postcss/import/resolve.js";
import importer, { type ImportOptions } from "../src/loaders/postcss/import/index.js";
import { fixture } from "./helpers/index.js";

const validateImport = async (
  css: string,
  options: ImportOptions = {},
  from = "dummy",
): Promise<string> => {
  const data = await postcss(importer(options)).process(css, { from });
  const [warning] = data.warnings();
  return warning.text;
};

describe("importer", () => {
  it("warns about not being top level", async () => {
    const warning = await validateImport('.foo{@import "smh.css"}');
    expect(warning).toMatchSnapshot("warning");
  });

  it("warns about lack of termination", async () => {
    const warning = await validateImport('@import "smh.css"\n.foo{color:red}');
    expect(warning).toMatchSnapshot("warning");
  });

  it("warns about no url", async () => {
    const warning = await validateImport("@import");
    expect(warning).toMatchSnapshot("warning");
  });

  it("warns about empty url", async () => {
    const warning = await validateImport('@import " "');
    expect(warning).toMatchSnapshot("warning");
  });

  it("warns about invalid url function", async () => {
    const warning = await validateImport('@import omg("smh.css")');
    expect(warning).toMatchSnapshot("warning");
  });

  it("warns about being unresolved", async () => {
    const warning = await validateImport('@import "smh.css"');
    expect(warning).toMatchSnapshot("warning");
  });

  it("warns about incorrect resolving", async () => {
    const warning = await validateImport('@import "smh.css"', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-return
      resolve: () => "lol" as unknown as Promise<ImportFile>,
    });
    expect(warning).toMatchSnapshot("warning");
  });

  it("warns about loop", async () => {
    const warning = await validateImport('@import "./foo.css"', {}, fixture("simple/foo.css"));
    expect(warning).toMatchSnapshot("warning");
  });
});
