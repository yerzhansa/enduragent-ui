import type { StorybookConfig } from "@storybook/react-vite";
import { previewSourceIdentity } from "../tools/preview-identity";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs"],
  framework: "@storybook/react-vite",
  async viteFinal(config) {
    return {
      ...config,
      plugins: [
        ...(config.plugins ?? []),
        tailwindcss(),
        previewSourceIdentity({ root: resolve(import.meta.dirname, "..") }),
      ],
    };
  },
};
export default config;
