import { expect, test, type Page, type TestInfo } from "@playwright/test";

async function open(page: Page, info: TestInfo, id: string) {
  const theme = info.project.name.endsWith("dark") ? "dark" : "light";
  await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=theme:${theme};palette:patrol`);
  await expect(page.locator("#preview-stage")).toHaveAttribute("data-scenario", id);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
}

async function capture(page: Page, info: TestInfo, name: string) {
  const path = info.outputPath(`${name}.png`);
  await page.locator("#preview-stage").screenshot({ path });
  await info.attach(name, { path, contentType: "image/png" });
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

test("Question choice records an answer and Edit restores choices", async ({ page }, info) => {
  await open(page, info, "presentation-question--unanswered");
  await expect(page.getByRole("button", { name: /Five hours/ })).toBeDisabled();
  const choice = page.getByRole("button", { name: /Three hours/ });
  await choice.focus();
  await choice.press("Enter");
  await expect(page.getByText("Your choice is saved", { exact: true })).toBeVisible();
  await expect(page.getByText("Three hours", { exact: true })).toBeVisible();
  await capture(page, info, "recorded-answer");
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(page.getByRole("button", { name: /Three hours/ })).toBeVisible();
});

test("Question custom editor validates input and restores Back focus", async ({ page }, info) => {
  await open(page, info, "presentation-question--unanswered");
  const custom = page.getByRole("button", { name: /Something else/ });
  await custom.click();
  const input = page.getByRole("textbox", { name: "What would work better?" });
  await expect(input).toBeFocused();
  await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeDisabled();
  await input.fill("   ");
  await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(custom).toBeFocused();
  await custom.press("Enter");
  await input.fill("Four hours across three rides");
  expect(await page.locator("#preview-stage button").allTextContents()).toEqual([
    "",
    "Back",
    "Continue",
  ]);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText("Four hours across three rides", { exact: true })).toBeVisible();
});

test("Composer sends entered text and stops the fictional response", async ({ page }, info) => {
  await open(page, info, "presentation-chat--composer");
  const input = page.getByRole("textbox", { name: "Message your coach" });
  await expect(page.getByRole("button", { name: "Send message" })).toBeDisabled();
  await input.fill("Review my ride from 7 September 1998");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(input).toHaveValue("");
  await expect(page.getByRole("status")).toHaveText("Sent: Review my ride from 7 September 1998");
  await page.getByRole("button", { name: "Stop responding" }).click();
  await expect(page.getByRole("status")).toHaveText("Response stopped");
  await expect(page.getByRole("button", { name: "Send message" })).toBeDisabled();
  await open(page, info, "presentation-chat--composer-disabled");
  await expect(page.getByRole("textbox")).toBeDisabled();
  await expect(page.getByRole("button", { name: "Attach files" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Send message" })).toBeDisabled();
});

test("Attachments retry a failed preview and remove only the selected file", async ({
  page,
}, info) => {
  await open(page, info, "presentation-chat--attachments");
  const ready = page.getByRole("region", { name: "Ride notes.txt attachment" });
  const failed = page.getByRole("region", { name: "Weekend ride.tcx attachment" });
  await failed.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("status")).toHaveText("Retrying Weekend ride.tcx");
  await ready.getByRole("button", { name: "Remove", exact: true }).click();
  await expect(ready).toHaveCount(0);
  await expect(failed).toBeVisible();
  await expect(page.getByRole("region", { name: "Training diary.pdf attachment" })).toBeVisible();
  await capture(page, info, "attachment-retry-and-removal");
});

test("Attachment content retains facts and forwards selected workout actions", async ({
  page,
}, info) => {
  await open(page, info, "presentation-chat--attachment-types");
  const activity = page.getByRole("table", { name: "Recorded activity" });
  await expect(activity).toContainText("7 September 1998");
  await expect(activity).toContainText("18.4 km");
  const workout = page.getByRole("region", { name: "Workout attachment" });
  const steady = workout.getByRole("button", { name: /Steady ride/ });
  await steady.click();
  await expect(steady).toHaveAttribute("aria-pressed", "true");
  await expect(workout.getByRole("button", { name: /Easy ride/ })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(workout.getByText("Steady ride selected", { exact: true })).toBeVisible();
  await workout.getByRole("button", { name: "Review in Plan" }).click();
  await expect(page.getByRole("status")).toHaveText("Opening selected Workout in Plan");
  await page.getByRole("button", { name: "Open Settings" }).click();
  await expect(page.getByRole("status")).toHaveText("Opening Settings");
  await page.getByRole("button", { name: "Choose another file" }).click();
  await expect(page.getByRole("status")).toHaveText("Choosing another file");
});

test("Queue removal updates its count and keeps command action usable", async ({ page }, info) => {
  await open(page, info, "presentation-chat--queue");
  await page.getByRole("button", { name: "Remove queued message 1" }).click();
  await expect(page.getByRole("listitem")).toHaveCount(1);
  await expect(page.getByRole("listitem")).toHaveText(/\/review/);
  await expect(page.getByRole("status").first()).toHaveText("1 queued messages");
  await page.getByRole("button", { name: "Run command" }).click();
  await expect(page.getByRole("status").last()).toHaveText("Command selected");
});

test("Queue retry disables repeat actions while removal clears the queue", async ({
  page,
}, info) => {
  await open(page, info, "presentation-chat--queue-recovery");
  await expect(
    page.getByText("Could not remove this queued message. Try again.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Retry interrupted message" }).click();
  await expect(page.getByRole("button", { name: "Retrying interrupted message…" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Remove", exact: true })).toBeDisabled();
  await capture(page, info, "queue-retrying");
  await open(page, info, "presentation-chat--queue-recovery");
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Queued message removed");
  await expect(page.getByRole("list")).toHaveCount(0);
});

test("Disclosure expands and collapses from the keyboard", async ({ page }, info) => {
  await open(page, info, "shared-facts--source-disclosure");
  const summary = page.locator("summary");
  const facts = page.getByRole("table", { name: "Plan basis" });
  await expect(facts).toBeHidden();
  await summary.focus();
  await summary.press("Enter");
  await expect(facts).toBeVisible();
  await expect(facts).toContainText("your answer");
  await summary.press("Space");
  await expect(facts).toBeHidden();
  await expect(summary).toBeFocused();
});

test("Training rows are keyboard reachable and chart values have a table equivalent", async ({
  page,
}, info) => {
  await open(page, info, "shared-training--ride-selection");
  const river = page.getByRole("button", { name: "Open ride review: River loop" });
  await river.focus();
  await river.press("Enter");
  await expect(river).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Open ride review: Morning ride" })).toBeFocused();
  await open(page, info, "shared-training--chart-ready");
  const table = page.getByRole("table", { name: "Riding time Last 6 weeks" });
  await expect(table).toHaveCount(1);
  expect(await table.getByRole("columnheader").allTextContents()).toEqual([
    "Week",
    "Rides",
    "Riding time",
  ]);
  await expect(table.getByRole("row")).toHaveCount(7);
  await expect(table).toContainText("Week 3, August 1998");
  await expect(table).toContainText("0 rides");
  await capture(page, info, "training-chart-equivalent");
});

test("Plan Draft exposes evidence and keeps primary action after secondary actions", async ({
  page,
}, info) => {
  await open(page, info, "compositions-plan--draft-stale");
  const stage = page.locator("#preview-stage");
  expect(await stage.getByRole("button").allTextContents()).toEqual([
    "Discard",
    "Edit answers",
    "Rebuild Draft",
  ]);
  await expect(page.getByRole("table", { name: "Draft inputs" })).toBeHidden();
  await page.locator("summary").filter({ hasText: "How this Plan was built" }).click();
  await expect(page.getByRole("table", { name: "Draft inputs" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Draft inputs" })).toContainText("220 W");
  await page.locator("summary").filter({ hasText: "Week 2" }).click();
  await expect(page.getByText("Mon 14 Sep 1998", { exact: true })).toBeVisible();
  await capture(page, info, "draft-evidence-expanded");
});
