import "../stories/application.css";
import "../stories/story.css";
import type { Preview } from "@storybook/react-vite";
import { applyPalette } from "../src/theme/applyPalette";
import { DEFAULT_PALETTE_ID, PALETTES, paletteById } from "../src/theme/palettes";

const __PREVIEW_REVISION__ = "package-preview";

const preview: Preview = {
  initialGlobals: { theme: "light", palette: DEFAULT_PALETTE_ID },
  globalTypes: {
    theme: {
      description: "Appearance",
      toolbar: { icon: "circlehollow", items: ["light", "dark"], dynamicTitle: true },
    },
    palette: {
      description: "Production palette",
      toolbar: {
        icon: "paintbrush",
        items: PALETTES.map(({ id, name }) => ({ value: id, title: name })),
        dynamicTitle: true,
      },
    },
  },
  parameters: { layout: "fullscreen", docs: { story: { inline: false } } },
  decorators: [
    (Story, context) => {
      const theme: unknown = context.globals.theme;
      const palette: unknown = context.globals.palette;
      if (theme !== "light" && theme !== "dark") throw new Error("Invalid preview theme");
      if (typeof palette !== "string" || !PALETTES.some(({ id }) => id === palette))
        throw new Error("Invalid preview palette");
      applyPalette({
        root: document.documentElement,
        palette: paletteById(palette),
        appearance: theme,
      });
      return (
        <>
          <aside className="story-identity">
            Fictional preview · {context.id} · {__PREVIEW_REVISION__}
          </aside>
          <div
            id="preview-stage"
            data-scenario={context.id}
            data-preview-kind={context.title.startsWith("Shared/") ? "component" : "page"}
          >
            <Story />
          </div>
        </>
      );
    },
  ],
};

export default preview;
