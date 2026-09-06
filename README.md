# Enduragent UI

Shared React controls, layout patterns, fonts, and palettes used by Enduragent applications. Storybook owns reusable examples; application state and services belong to each consumer.

## Use

Install the reviewed version of `@enduragent/ui` with compatible React 19, React DOM 19, and Tailwind CSS 4 peers. Version `0.0.0` is an unpublished development placeholder.

```tsx
import { Button, Page, applyPalette, paletteById } from '@enduragent/ui';

applyPalette({
  root: document.documentElement,
  palette: paletteById('patrol'),
  appearance: 'system',
});

export function Example() {
  return <Page title="Example"><Button>Save</Button></Page>;
}
```

Use one consumer CSS entry with one Tailwind compiler:

```css
@layer theme, base, surface, components, utilities;
@import '@enduragent/ui/tailwind.css';
@import 'tailwindcss/preflight.css' layer(base);
@import 'tailwindcss/utilities.css' layer(utilities);
@source './';
```

The stylesheet supplies tokens, local fonts, animation definitions, Tailwind aliases, and package-relative registration of the distributed component classes. Keep preflight and utilities in the consumer entry. Add the consumer's source paths and viewport behavior there. Consumer classes passed through `className` use the shared token-aware `cn` merge behavior.

The package exports `Button`, `Card`, `Dialog`, `Popover`, `Select`, their associated public controls, `Page`, `InlineConfirmation`, `buttonVariants`, `cn`, and palette functions and types from its root. The only public CSS entry is `@enduragent/ui/tailwind.css`. Palette persistence, system-theme subscriptions, and native integrations stay in the application.

## Develop and verify

Use Node 24 and the pinned pnpm version. Run `pnpm install`, then:

- `pnpm check` checks types and rejects preview imports from the runtime graph.
- `pnpm test` runs component, palette, styling, catalogue, and identity assertions.
- `pnpm check:packed` installs an actual tarball in a temporary consumer, builds it, and verifies styling, fonts, portals, keyboard behavior, exports, and one React runtime.
- `pnpm storybook` opens the catalogue on port 5188.
- `pnpm check:ui` builds the catalogue and runs the browser matrix on port 5193.

Install Chromium with `pnpm exec playwright install chromium` before browser checks. Screenshot comparisons require the recorded macOS arm64 environment and Chromium `151.0.7922.34`. The wide and compact light/dark matrix preserves the 28 transferred reference images at zero differing pixels. New control examples also receive browser and interaction checks.

Source identity records include the repository revision, working-tree state, lockfile, consumed source and font hashes, transformed modules, import graph, and output hashes. The screenshot reference records its original revision and image hashes independently of the current build.

## Credits

Component recipes use Base UI, class-variance-authority, clsx, tailwind-merge, and Lucide. Inter Variable and Geist Mono are distributed locally with their licenses. Animation definitions use tw-animate-css. See [NOTICE.md](NOTICE.md) for bundled dependency notices and [LICENSE](LICENSE) for the package license.
