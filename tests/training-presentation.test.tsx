import { createRef } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CompactTrend, RideMetricList, SelectableRideRow } from "../src/presentation/training";

describe("Training presentation", () => {
  it("provides the same complete facts as a table without exposing decorative bars", () => {
    render(
      <CompactTrend
        title="Riding time"
        period="Last 6 weeks"
        content={{
          kind: "ready",
          headings: ["Week", "Rides", "Riding time"],
          buckets: [
            {
              id: "week-a",
              label: "7 Sep",
              range: "7–13 September 1998",
              value: 3600,
              count: "2 rides",
              formattedValue: "1 hr",
            },
            {
              id: "week-b",
              label: "14 Sep",
              range: "14–20 September 1998",
              value: 0,
              count: "0 rides",
              formattedValue: "0 min",
            },
          ],
        }}
      />,
    );
    const table = screen.getByRole("table", { name: "Riding time Last 6 weeks" });
    expect(
      within(table).getByRole("row", { name: "7–13 September 1998 2 rides 1 hr" }),
    ).toBeTruthy();
    expect(
      within(table).getByRole("row", { name: "14–20 September 1998 0 rides 0 min" }),
    ).toBeTruthy();
    expect(screen.getByText("7 Sep").closest('[aria-hidden="true"]')).toBeTruthy();
  });
  it("does not manufacture a chart for unavailable data", () => {
    render(
      <CompactTrend
        title="Riding time"
        period="Last 6 weeks"
        content={{
          kind: "unavailable",
          message: "Trend unavailable",
          reason: "Missing riding time",
        }}
      />,
    );
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByText("Missing riding time")).toBeTruthy();
  });
  it("preserves native row focus and keyboard selection without selecting another ride", async () => {
    const onClick = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    render(
      <ol>
        <SelectableRideRow
          ref={ref}
          aria-label="Open River loop"
          date={{ iso: "1998-09-07", weekday: "Mon", day: "7" }}
          title="River loop"
          meta="Road · 42 km"
          onClick={onClick}
        />
      </ol>,
    );
    ref.current?.focus();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open River loop" }));
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  it("keeps caller supplied missing values visible", () => {
    render(
      <RideMetricList rows={[{ id: "power", label: "Average power", value: "Not recorded" }]} />,
    );
    expect(screen.getByText("Not recorded").tagName).toBe("DD");
  });
});
