/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.m?tsx?$": ["ts-jest", { useESM: true }],
    "^.+\\.m?jsx?$": "babel-jest",
  },
  testMatch: ["<rootDir>/__tests__/*.(spec|test).[jt]s?(x)"],
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  collectCoverageFrom: [
    "<rootDir>/src/**/*.[jt]s?(x)",
    "<rootDir>/__tests__/*.[jt]s?(x)",
    "<rootDir>/__tests__/helpers/*.[jt]s?(x)",
    "!**/*.d.ts",
    "!**/.eslintrc.cjs",
  ],
};
