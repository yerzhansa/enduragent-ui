import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button, applyPalette, paletteById, type ResolvedTheme } from "../src/index";

function ThemeExample() {
  const [changed, setChanged] = useState(false);
  return (
    <Button
      onClick={() => {
        const appearance: ResolvedTheme =
          document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyPalette({ root: document.documentElement, palette: paletteById("moss"), appearance });
        setChanged(true);
      }}
    >
      {changed ? "Theme changed" : "Change example theme"}
    </Button>
  );
}
const meta = { title: "Shared/Theme", component: ThemeExample } satisfies Meta<typeof ThemeExample>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
