import { createRef } from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ArtifactCard,
  BeforeAfterList,
  Disclosure,
  EvidenceList,
  NoticeRow,
  ProgressDisplay,
  WorkoutList,
} from "../src/index";

describe("shared presentation foundations", () => {
  it("preserves sourced, zero, and missing facts without manufacturing values", () => {
    render(
      <EvidenceList
        label="Recorded facts"
        rows={[
          { id: "duration", label: "Riding time", source: "completed rides", value: "0 min" },
          { id: "power", label: "Average power", value: "—" },
        ]}
      />,
    );
    const table = screen.getByRole("table", { name: "Recorded facts" });
    expect(within(table).getAllByRole("row")).toHaveLength(2);
    expect(
      within(table).getByRole("rowheader", { name: "Riding time · completed rides" }),
    ).toBeVisible();
    expect(within(table).getByRole("cell", { name: "0 min" })).toBeVisible();
    expect(within(table).getByRole("cell", { name: "—" })).toBeVisible();
  });

  it("preserves heading focus targets and accessible card naming", () => {
    const heading = createRef<HTMLHeadingElement>();
    render(
      <ArtifactCard
        title="Review your Draft"
        headingLevel={2}
        titleProps={{ id: "draft-title", ref: heading, tabIndex: -1 }}
        actions={
          <>
            <button>Discard</button>
            <button>Edit answers</button>
            <button>Activate Plan</button>
          </>
        }
      />,
    );
    expect(screen.getByRole("region", { name: "Review your Draft" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 2 })).toBe(heading.current);
    heading.current?.focus();
    expect(heading.current).toHaveFocus();
    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual([
      "Discard",
      "Edit answers",
      "Activate Plan",
    ]);
  });

  it("keeps native disclosure state and its focusable trigger available to consumers", () => {
    const trigger = createRef<HTMLElement>();
    const { rerender } = render(
      <Disclosure summary="Data reviewed" summaryProps={{ ref: trigger }}>
        Completed rides
      </Disclosure>,
    );
    expect(trigger.current?.closest("details")).not.toHaveAttribute("open");
    rerender(
      <Disclosure summary="Data reviewed" summaryProps={{ ref: trigger }} open>
        Completed rides
      </Disclosure>,
    );
    expect(trigger.current?.closest("details")).toHaveAttribute("open");
  });

  it("exposes real progress counts and omits a made-up count for indeterminate work", () => {
    const { rerender } = render(
      <ProgressDisplay
        label="Validating week 6 of 12"
        value={{ kind: "count", completed: 6, total: 12 }}
      />,
    );
    expect(screen.getByRole("progressbar", { name: "Validating week 6 of 12" })).toHaveAttribute(
      "value",
      "6",
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute("max", "12");
    rerender(
      <ProgressDisplay label="Checking recent training" value={{ kind: "indeterminate" }} />,
    );
    expect(
      screen.getByRole("progressbar", { name: "Checking recent training" }),
    ).not.toHaveAttribute("value");
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("max");
  });

  it("renders workout context and names an empty week without inventing a workout", () => {
    const { rerender } = render(
      <WorkoutList
        label="Week 1"
        rows={[
          {
            id: "easy",
            when: "Mon 7 Sep",
            title: "Easy ride",
            detail: "45 min",
            status: "Planned",
          },
        ]}
      />,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Mon 7 Sep")).toBeVisible();
    rerender(<WorkoutList label="Week 1" rows={[]} />);
    expect(screen.queryByRole("listitem")).toBeNull();
    expect(screen.getByRole("group", { name: "Week 1" })).toHaveTextContent(
      "No Workouts this week.",
    );
  });

  it("distinguishes before and after values and preserves the supplied empty explanation", () => {
    const { rerender } = render(
      <BeforeAfterList
        label="Weekly time changes"
        rows={[{ id: "week", label: "Week 1", before: "6 hours", after: "5 hours" }]}
      />,
    );
    expect(screen.getByRole("columnheader", { name: "Before" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "After" })).toBeVisible();
    expect(screen.getByRole("row", { name: "Week 1 6 hours 5 hours" })).toBeVisible();
    rerender(
      <BeforeAfterList
        label="Weekly time changes"
        rows={[]}
        empty="The weekly total stays the same."
      />,
    );
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getByText("The weekly total stays the same.")).toBeVisible();
  });

  it("keeps actionable failure copy and caller-owned recovery controls together", () => {
    render(
      <NoticeRow
        tone="danger"
        role="alert"
        title="Sync could not finish"
        action={<button>Try again</button>}
      >
        Recorded rides are still available.
      </NoticeRow>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Recorded rides are still available.");
    expect(
      within(screen.getByRole("alert")).getByRole("button", { name: "Try again" }),
    ).toBeVisible();
  });
});
