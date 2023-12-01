import type { Config } from "jest";

const config: Config = {
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  collectCoverage: true,
};

export default config;

// module.exports = {
//   preset: "ts-jest",
//   testEnvironment: "node",
//   transform: {
//     "^.+\\.ts?$": "ts-jest",
//   },
//   transformIgnorePatterns: ["<rootDir>/node_modules/"],
// };
