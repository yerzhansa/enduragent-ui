import { createRef } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  PlanAction,
  PlanChoiceOption,
  PlanEvidenceRow,
  PlanEvidenceTable,
  PlanProjectionCard,
  PlanResultNotice,
} from "../src/index";

describe("Plan presentation", () => {
  it("preserves the projection structure and allows the host to focus its heading", () => {
    render(
      <PlanProjectionCard
        eyebrow="Plan creation"
        title="Build consistency"
        status="Paused"
        plainStatus
        summary="3 of 7 answered. No Plan is active."
        actions={<PlanAction>Continue in Chat</PlanAction>}
      >
        <PlanEvidenceTable label="Accepted answers">
          <PlanEvidenceRow label="Weekly time limit" value="6 h" />
        </PlanEvidenceTable>
      </PlanProjectionCard>
    );
    const heading = screen.getByRole("heading", {
      name: "Build consistency",
      level: 3,
    });
    heading.focus();
    expect(heading).toHaveFocus();
    const card = heading.closest("section");
    expect(
      [...(card?.children ?? [])].map((element) => element.classList[0])
    ).toEqual(["evidence-card-head", "plan-card-body", "card-actions"]);
    expect(heading.parentElement?.parentElement).toHaveClass(
      "artifact-title-row"
    );
    expect(screen.getByText("Paused")).toHaveClass("status-chip", "is-plain");
    const table = screen.getByRole("table", { name: "Accepted answers" });
    const row = within(table).getByRole("row");
    expect(row.children).toHaveLength(2);
    expect(within(row).getByRole("rowheader")).toHaveTextContent(
      "Weekly time limit"
    );
    expect(within(row).getByRole("cell").tagName).toBe("STRONG");
    expect(within(row).getByRole("cell")).toHaveTextContent("6 h");
  });

  it("omits empty optional sections and escapes text", () => {
    const { container } = render(<PlanProjectionCard title="<Plan>" />);
    expect(screen.getByRole("heading")).toHaveTextContent("<Plan>");
    expect(container.querySelector("section")?.children).toHaveLength(1);
    expect(
      container.querySelector(
        ".status-chip, .artifact-eyebrow, .plan-card-body, .card-actions"
      )
    ).toBeNull();
    expect(container.querySelector("plan")).toBeNull();
  });

  it("keeps actions native, focusable, and controlled by the host", async () => {
    const user = userEvent.setup();
    const action = createRef<HTMLButtonElement>();
    const activated: string[] = [];
    render(
      <>
        <PlanAction
          ref={action}
          className="primary"
          data-command="4"
          onClick={() => activated.push("continue")}
        >
          Continue
        </PlanAction>
        <PlanAction className="nav-item is-active" aria-current="page">
          Plan library
        </PlanAction>
        <PlanAction disabled onClick={() => activated.push("disabled")}>
          Unavailable
        </PlanAction>
      </>
    );
    await user.tab();
    expect(action.current).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(activated).toEqual(["continue"]);
    expect(action.current).toHaveAttribute("type", "button");
    expect(action.current).toHaveAttribute("data-command", "4");
    expect(action.current).toHaveClass("action-button", "primary");
    await user.tab();
    const navigation = screen.getByRole("button", { name: "Plan library" });
    expect(navigation).toHaveFocus();
    expect(navigation).not.toHaveClass("action-button");
    await user.click(screen.getByRole("button", { name: "Unavailable" }));
    expect(activated).toEqual(["continue"]);
  });

  it("keeps the choice marker and arrow out of the accessible name", async () => {
    const user = userEvent.setup();
    let chosen = false;
    const { rerender } = render(
      <PlanChoiceOption
        marker={1}
        label="Fixed Schedule"
        detail="Workouts on set days"
        data-editor-trigger="mode"
        onClick={() => {
          chosen = true;
        }}
      />
    );
    const choice = screen.getByRole("button", {
      name: /^Fixed Schedule\s*Workouts on set days$/,
    });
    expect([...choice.children].map((element) => element.tagName)).toEqual([
      "SPAN",
      "SPAN",
      "SPAN",
    ]);
    expect(choice.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(choice.lastElementChild).toHaveTextContent("›");
    expect(choice.lastElementChild).toHaveAttribute("aria-hidden", "true");
    await user.tab();
    await user.keyboard(" ");
    expect(chosen).toBe(true);
    rerender(<PlanChoiceOption marker={2} label="Flexible Workout pool" />);
    expect(
      screen
        .getByRole("button", { name: "Flexible Workout pool" })
        .querySelector(".choice-detail")
    ).toBeNull();
  });

  it("announces results and preserves the complete discard consequence", () => {
    const { rerender, container } = render(<PlanResultNotice text="" />);
    expect(container).toBeEmptyDOMElement();
    rerender(<PlanResultNotice text="Plan activated" />);
    expect(screen.getByRole("status").tagName).toBe("DIV");
    expect(screen.getByRole("status")).toHaveTextContent("Plan activated");
    rerender(<PlanResultNotice text="Plan creation discarded" />);
    expect(screen.getByRole("status").tagName).toBe("ARTICLE");
    expect(screen.getByRole("status")).toHaveTextContent(
      "No Plan was created. Your active Plan, Schedule, training restrictions, saved preferences, and chat history are unchanged."
    );
  });
});
