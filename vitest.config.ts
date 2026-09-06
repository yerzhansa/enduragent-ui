import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "dom",
          environment: "jsdom",
          include: ["tests/*.test.ts", "tests/*.test.tsx"],
          exclude: [
            "tests/preview-identity.test.ts",
            "tests/coverage.test.ts",
            "tests/package-isolation.test.ts",
            "tests/record-browser.test.ts",
          ],
          setupFiles: ["tests/dom-setup.ts"],
        },
      },
      {
        test: {
          name: "tooling",
          environment: "node",
          include: [
            "tests/preview-identity.test.ts",
            "tests/coverage.test.ts",
            "tests/package-isolation.test.ts",
            "tests/record-browser.test.ts",
          ],
        },
      },
    ],
  },
});
