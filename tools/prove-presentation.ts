import { expect, type Page } from "@playwright/test";

export async function provePresentation(page: Page): Promise<void> {
  const proof = page.getByRole("region", { name: "Packed presentation proof" });
  const artifact = proof.getByTestId("packed-artifact");
  const disclosure = proof.getByText("Inspect fictional evidence", { exact: true });
  await disclosure.focus();
  await page.keyboard.press("Enter");
  await expect(proof.getByRole("table", { name: "Fictional evidence" })).toBeVisible();
  await expect(proof.getByRole("rowheader", { name: "Weekly hours · your answer" })).toBeVisible();
  await expect(proof.getByRole("cell", { name: "6 h" })).toBeVisible();
  await proof.getByRole("button", { name: "Focus first choice" }).click();
  const choice = proof.getByRole("button", { name: /Fixed Schedule Use the same weekdays/ });
  await expect(choice).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(proof.getByLabel("Recorded choice")).toHaveText("Fixed Schedule recorded");
  await expect(proof.getByRole("button", { name: /Unavailable choice/ })).toBeDisabled();
  await proof.getByRole("button", { name: "Focus message" }).click();
  const input = proof.getByRole("textbox", { name: "Fictional message" });
  await expect(input).toBeFocused();
  await expect(proof.getByRole("button", { name: "Send message" })).toBeDisabled();
  await input.fill("Review my fictional week");
  await page.keyboard.press("Tab");
  await expect(proof.getByRole("button", { name: "Send message" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(proof.getByLabel("Sent message")).toHaveText("Review my fictional week");
  await proof.getByRole("button", { name: "Stop responding" }).click();
  await expect(proof.getByRole("button", { name: "Send message" })).toBeVisible();
  const ride = proof.getByRole("button", { name: "Inspect fictional ride" });
  await ride.focus();
  await page.keyboard.press("Space");
  await expect(ride).toHaveAttribute("aria-pressed", "true");
  const trend = proof.getByTestId("packed-trend");
  const table = trend.getByRole("table", { name: "Fictional weekly riding 27 Jul–6 Sep 1998" });
  await expect(table.getByRole("row")).toHaveCount(7);
  await expect(table.getByRole("rowheader", { name: "27 Jul–2 Aug 1998" })).toHaveCount(1);
  await expect(table).toHaveCSS("position", "absolute");
  await expect(table).toHaveCSS("clip-path", "inset(50%)");
  const colors: string[] = [];
  await page.evaluate(() => document.documentElement.removeAttribute("style"));
  for (const theme of ["light", "dark"]) {
    await page.evaluate(
      (value) => document.documentElement.setAttribute("data-theme", value),
      theme,
    );
    for (const width of [1100, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(artifact).toHaveCSS("border-top-width", "1px");
      await expect(artifact).toHaveCSS("border-radius", "12px");
      await expect(artifact.getByRole("heading")).toHaveCSS("font-size", "16px");
      await expect(choice).toHaveCSS("display", "grid");
      await expect(proof.getByTestId("packed-composer")).toHaveCSS("display", "grid");
      await expect(input).toHaveCSS("font-size", "14px");
      await expect(proof.getByRole("button", { name: "Send message" })).toHaveCSS("height", "40px");
      await expect(ride).toHaveCSS("display", "grid");
      await expect(trend).toHaveCSS(
        width === 390 ? "border-top-width" : "border-left-width",
        "1px",
      );
      await expect(proof.getByRole("cell", { name: "6 h" })).toHaveCSS(
        "text-align",
        width === 390 ? "left" : "right",
      );
      expect(await proof.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
        true,
      );
      expect(
        await trend
          .locator(".training-trend-bar")
          .first()
          .evaluate((element) => element.getBoundingClientRect().height),
      ).toBeGreaterThan(0);
    }
    colors.push(await artifact.evaluate((element) => getComputedStyle(element).backgroundColor));
  }
  expect(colors[0]).not.toBe(colors[1]);
  await page.setViewportSize({ width: 1280, height: 720 });
}
