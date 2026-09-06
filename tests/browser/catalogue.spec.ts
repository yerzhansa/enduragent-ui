import { test, expect, type Page, type TestInfo } from "@playwright/test";
import { coverage, readyIds } from "../../stories/catalogue";
import { verifyStoryCoverage } from "../../tools/coverage";

async function open(page: Page, info: TestInfo, id: string) {
  const theme = info.project.name.endsWith("dark") ? "dark" : "light";
  await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};palette:patrol`);
  await expect(page.locator("#preview-stage")).toHaveAttribute("data-scenario", id);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
}

test.beforeEach(async ({ page, context }) => {
  expect(context.browser()?.version()).toBe("151.0.7922.34");
  page.on("pageerror", (error) => {
    throw error;
  });
  await context.route("**/*", async (route) => {
    expect(new URL(route.request().url()).origin).toBe("http://127.0.0.1:5193");
    await route.continue();
  });
});
test.afterEach(async ({ page }) => {
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  expect(await page.evaluate(() => "enduragentAuth" in window)).toBe(false);
});
for (const id of readyIds)
  test(`${id} renders`, async ({ page }, info) => {
    await open(page, info, id);
    if (id.startsWith("shared-select")) {
      await expect(page.getByRole("combobox", { name: "Training day" })).toBeVisible();
      if (id.endsWith("disabled")) await expect(page.getByRole("combobox")).toBeDisabled();
    } else if (id.startsWith("shared-inline")) {
      await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeVisible();
      if (id.endsWith("busy"))
        await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeDisabled();
      if (id.endsWith("disabled"))
        await expect(
          page.getByRole("button", { name: "Remove all credentials", exact: true }),
        ).toBeDisabled();
    }
    if (id.startsWith("shared-select") || id.startsWith("shared-inline"))
      await expect(page.locator("#preview-stage")).toHaveScreenshot(`${id}.png`);
    else {
      if (id.endsWith("dialogs")) {
        await page.getByRole("button", { name: "Open dialog" }).click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(page.getByRole("button", { name: "Open dialog" })).toBeFocused();
      }
      if (id.endsWith("popovers")) {
        await page.getByRole("button", { name: "Open popover" }).click();
        await expect(page.locator('[data-slot="popover-content"]')).toBeVisible();
        await page.keyboard.press("Escape");
      }
      await info.attach("representative", {
        body: await page.locator("#preview-stage").screenshot(),
        contentType: "image/png",
      });
    }
  });
test("Select icon inset and keyboard focus", async ({ page }, info) => {
  await open(page, info, "shared-select--default");
  const trigger = page.getByRole("combobox");
  await expect(trigger.locator("svg")).toHaveCount(1);
  const inset = await trigger.evaluate((element) => {
    const icon = element.querySelector("svg");
    if (!icon) throw Error("Missing icon");
    const style = getComputedStyle(element);
    return {
      actual: element.getBoundingClientRect().right - icon.getBoundingClientRect().right,
      expected: parseFloat(style.paddingRight) + parseFloat(style.borderRightWidth),
    };
  });
  expect(inset.actual).toBeCloseTo(inset.expected, 1);
  await expect(trigger).toHaveScreenshot("select.png");
  await trigger.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});
test("Confirmation Cancel focus and action order", async ({ page }, info) => {
  await open(page, info, "shared-inline-confirmation--default");
  const cancel = page.getByRole("button", { name: "Cancel", exact: true });
  await expect(cancel).toBeFocused();
  const buttons = page.locator("[data-inline-confirmation] button");
  expect(await buttons.allTextContents()).toEqual(["Cancel", "Remove all credentials"]);
  const left = await buttons.nth(0).boundingBox();
  const right = await buttons.nth(1).boundingBox();
  if (!left || !right) throw Error("Missing actions");
  expect(left.x + left.width).toBeLessThanOrEqual(right.x);
  await expect(page.locator("[data-inline-confirmation]")).toHaveScreenshot("confirmation.png");
});
test("Exact ready catalogue and build identity", async ({ page, request }, info) => {
  expect(
    verifyStoryCoverage(await (await request.get("/index.json")).json(), coverage).readyIds,
  ).toEqual(readyIds);
  expect(await (await request.get("/preview-source.json")).json()).toMatchObject({
    mode: "build",
    graphCoverage: "complete-build",
  });
  await open(page, info, readyIds[0]);
});
