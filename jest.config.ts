import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "node",
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/e2e/"],
  collectCoverageFrom: [
    "src/components/room/layout.ts",
    "src/components/minime/hairLocks.ts",
    "src/lib/chapters.ts",
    "src/lib/cursor.ts",
    "src/content/**/*.ts",
    "!src/content/types.ts",
  ],
};

/** Packages that ship only ES modules, so jest has to compile them like our own code. */
const ESM_PACKAGES = ["three"];

/** next/jest always ignores node_modules for transforms; let the ESM-only packages through. */
function allowEsm(pattern: string): string {
  const list = ESM_PACKAGES.join("|");
  if (pattern === "/node_modules/") return `/node_modules/(?!(${list})/)`;
  const transpiled = "/node_modules/(?!.pnpm)(?!(";
  return pattern.startsWith(transpiled) ? pattern.replace(transpiled, `${transpiled}${list}|`) : pattern;
}

export default async function jestConfig(): Promise<Config> {
  const resolved = await createJestConfig(config)();
  return { ...resolved, transformIgnorePatterns: (resolved.transformIgnorePatterns ?? []).map(allowEsm) };
}
