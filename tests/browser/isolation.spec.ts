import { test, expect } from "@playwright/test";

test("theme changes stay ephemeral and navigation resets within one preview document", async ({
  page,
}, info) => {
  const theme = info.project.name.endsWith("dark") ? "dark" : "light";
  await page.addInitScript(() => {
    if (window.top === window) return;
    const writes: string[] = [];
    Object.defineProperty(window, "previewWrites", { value: writes });
    for (const method of ["setItem", "removeItem", "clear"] as const) {
      const original = Storage.prototype[method];
      Object.defineProperty(Storage.prototype, method, {
        value: function (...args: string[]) {
          writes.push(method);
          return Reflect.apply(original, this, args);
        },
      });
    }
  });
  await page.goto(`/?path=/story/shared-theme--default&globals=theme:${theme};palette:patrol`);
  const frame = page.frameLocator("#storybook-preview-iframe");
  const stage = frame.locator("#preview-stage");
  await expect(stage).toHaveAttribute("data-scenario", "shared-theme--default");
  const brand = await frame
    .locator("html")
    .evaluate((el) => getComputedStyle(el).getPropertyValue("--brand"));
  await frame.getByRole("button", { name: "Change example theme" }).click();
  await expect(frame.locator("html")).toHaveAttribute(
    "data-theme",
    theme === "dark" ? "light" : "dark",
  );
  expect(
    await frame.locator("html").evaluate((el) => getComputedStyle(el).getPropertyValue("--brand")),
  ).not.toBe(brand);
  await frame
    .locator("html")
    .evaluate(() =>
      Object.defineProperty(window, "previewNavigationToken", { value: "same-document" }),
    );
  await page.locator("#shared").getByRole("button", { name: "Expand all", exact: true }).click();
  await page.locator('a[href*="shared-controls--buttons"]').click();
  await expect(stage).toHaveAttribute("data-scenario", "shared-controls--buttons");
  await page.locator('a[href*="shared-theme--default"]').click();
  await expect(frame.getByRole("button", { name: "Change example theme" })).toBeVisible();
  await expect(frame.locator("html")).toHaveAttribute("data-theme", theme);
  expect(
    await frame.locator("html").evaluate((el) => getComputedStyle(el).getPropertyValue("--brand")),
  ).toBe(brand);
  expect(
    await frame.locator("html").evaluate(() => Reflect.get(window, "previewNavigationToken")),
  ).toBe("same-document");
  expect(await frame.locator("html").evaluate(() => Reflect.get(window, "previewWrites"))).toEqual(
    [],
  );
  expect(await frame.locator("html").evaluate(() => "enduragentAuth" in window)).toBe(false);
});
