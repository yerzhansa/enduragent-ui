import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  globalSetup: "./tests/browser/global-setup.mjs",
  workers: 1,
  retries: 0,
  snapshotPathTemplate: "{testDir}/baselines/extracted/{projectName}/{arg}{ext}",
  updateSnapshots: "none",
  expect: { toHaveScreenshot: { animations: "disabled", caret: "hide", maxDiffPixels: 0 } },
  webServer: {
    command:
      "pnpm exec vite preview --outDir dist-storybook --host 127.0.0.1 --port 5193 --strictPort",
    url: "http://127.0.0.1:5193/index.json",
    reuseExistingServer: false,
  },
  use: {
    baseURL: "http://127.0.0.1:5193",
    locale: "en-US",
    timezoneId: "UTC",
    deviceScaleFactor: 1,
    contextOptions: { reducedMotion: "reduce" },
    serviceWorkers: "block",
  },
  projects: [
    { name: "wide-light", use: { viewport: { width: 1180, height: 820 }, colorScheme: "light" } },
    { name: "wide-dark", use: { viewport: { width: 1180, height: 820 }, colorScheme: "dark" } },
    { name: "compact-light", use: { viewport: { width: 760, height: 760 }, colorScheme: "light" } },
    { name: "compact-dark", use: { viewport: { width: 760, height: 760 }, colorScheme: "dark" } },
  ],
});
