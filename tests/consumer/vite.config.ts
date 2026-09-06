import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "installed-react-identity",
      generateBundle() {
        const modules = [...this.getModuleIds()].filter(
          (id) => !id.startsWith("\0") && /\/node_modules\/react\//.test(id),
        );
        const roots = [
          ...new Set(
            modules.map((id) =>
              id.slice(0, id.lastIndexOf("/node_modules/react/") + "/node_modules/react".length),
            ),
          ),
        ];
        if (roots.length !== 1) throw Error(`Expected one React runtime, found ${roots.length}`);
        this.emitFile({
          type: "asset",
          fileName: "react-identity.json",
          source: JSON.stringify({ roots, modules }),
        });
      },
    },
  ],
});
