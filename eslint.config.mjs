import path from "node:path";
import { fileURLToPath } from "node:url";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { defineConfig, globalIgnores } from "eslint/config";
import jest from "eslint-plugin-jest";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores([
    "dist",
    "tmp",
    ".cache",
    "node_modules",
    "coverage",
    "docs",
    "./*.mjs",
    "**/*.js",
    "__tests__/fixtures",
  ]),
  unicorn.configs.recommended,
  {
    extends: fixupConfigRules(
      compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "plugin:jest/recommended",
        "plugin:jest/style",
        "prettier",
      ),
    ),

    plugins: {
      jest: fixupPluginRules(jest),
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
    },

    languageOptions: {
      globals: {
        ...globals.node,
        ...Object.fromEntries(Object.entries(globals.browser).map(([key]) => [key, "off"])),
      },

      parser: tsParser,
      ecmaVersion: 5,
      sourceType: "module",

      parserOptions: {
        project: path.join(__dirname, "tsconfig.json"),
        tsconfigRootDir: __dirname,
      },
    },

    settings: {
      "import/resolver": {
        node: {
          extensions: [".ts", ".mjs", ".js", ".cjs", ".json"],
        },
      },
    },

    rules: {
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/default-param-last": "error",
      "@typescript-eslint/naming-convention": "error",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/only-throw-error": "off",
      "@typescript-eslint/prefer-for-of": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/prefer-reduce-type-parameter": "error",
      "@typescript-eslint/prefer-ts-expect-error": "error",
      "@typescript-eslint/promise-function-async": "error",
      "@typescript-eslint/return-await": "error",
      "@typescript-eslint/unified-signatures": "error",
      "no-await-in-loop": "error",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-template": "error",
      "sort-vars": "error",
      "unicorn/no-anonymous-default-export": "off",
      "unicorn/no-array-reverse": "off",
      "unicorn/no-array-sort": "off",
      "unicorn/no-null": "off",
      "unicorn/prefer-json-parse-buffer": "off",
      "unicorn/prefer-module": "off",
      "unicorn/prefer-node-protocol": "off",
      "unicorn/prefer-set-has": "off",
      "unicorn/prevent-abbreviations": "off",

      yoda: [
        "error",
        "never",
        {
          exceptRange: true,
        },
      ],
    },
  },
]);
