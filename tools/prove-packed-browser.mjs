import { chromium, expect } from "@playwright/test";
import { provePresentation } from "./prove-presentation.ts";
import { writeFile, readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
export async function provePackedBrowser({ consumer, url, tarball }) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ reducedMotion: "reduce", colorScheme: "light" });
    const failures = [];
    page.on("pageerror", (error) => failures.push(error.message));
    await page.goto(url);
    const button = page.getByRole("button", { name: "Library button", exact: true });
    await expect(button).toHaveCSS("height", "32px");
    await expect(button).toHaveCSS("display", "flex");
    await expect(page.locator("main")).toHaveCSS("padding", "36px");
    await expect(page.getByRole("button", { name: "Consumer override" })).toHaveCSS(
      "height",
      "40px",
    );
    await expect(page.getByRole("button", { name: "Consumer override" })).toHaveCSS(
      "background-color",
      "rgb(255, 255, 255)",
    );
    await button.focus();
    await expect(button).toBeFocused();
    await expect(button).toHaveCSS("outline-width", "2px");
    await expect(button).toHaveCSS("transition-duration", "1e-05s");
    await page.getByRole("button", { name: "Open popover" }).click();
    const popup = page.locator('[data-slot="popover-content"]');
    await expect(popup).toBeVisible();
    await expect(popup).toHaveCSS("width", "288px");
    await expect(popup).toHaveCSS("border-radius", "12px");
    await expect(page.locator('main [data-slot="popover-content"]')).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(popup).toBeHidden();
    await expect(page.getByRole("button", { name: "Open popover" })).toBeFocused();
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(15, 21, 32)");
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(242, 245, 248)");
    await page.evaluate(() => document.documentElement.removeAttribute("data-theme"));
    await page.emulateMedia({ colorScheme: "light" });
    await page.getByRole("button", { name: "Dark theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(15, 21, 32)");
    await page.getByRole("button", { name: "Open dialog", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Open dialog", exact: true })).toBeFocused();
    const select = page.getByRole("combobox", { name: "Training day" });
    await expect(select).toContainText("Wednesday");
    await select.press("ArrowDown");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.getByRole("option", { name: "Monday" }).click();
    await expect(select).toContainText("Monday");
    await expect(page.getByText("Fictional card content", { exact: true })).toBeVisible();
    await expect(page.getByRole("region", { name: "Example page" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
    await expect(page.locator("[data-palette]")).toHaveCount(13);
    for (const palette of await page.locator("[data-palette]").all()) {
      await palette.click();
      expect(
        await page.locator("html").evaluate((element) => element.style.getPropertyValue("--brand")),
      ).toMatch(/^#[a-fA-F0-9]{6}$/);
    }
    const fonts = await page.evaluate(async () => {
      await document.fonts.ready;
      return {
        ui: document.fonts.check('14px "Inter Variable"'),
        mono: document.fonts.check('14px "Geist Mono Variable"'),
      };
    });
    expect(fonts).toEqual({ ui: true, mono: true });
    for (const asset of await readdir(`${consumer}/dist/assets`)) {
      if (asset.endsWith(".woff2"))
        expect((await page.request.get(`${url}/assets/${asset}`)).ok()).toBe(true);
    }
    await provePresentation(page);
    expect(failures).toEqual([]);
    await page.screenshot({ path: "artifacts/packed-proof.png" });
    await writeFile(
      "artifacts/packed-proof.json",
      JSON.stringify(
        {
          browser: browser.version(),
          fonts,
          failures,
          tarballSha512: createHash("sha512")
            .update(await readFile(tarball))
            .digest("hex"),
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
}
