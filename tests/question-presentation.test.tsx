import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  QuestionCard,
  QuestionInput,
  QuestionOption,
  QuestionOptions,
  RecordedAnswer,
} from "../src/presentation/question.js";
import { Button } from "../src/components/button.js";

describe("Question presentation", () => {
  it("preserves caller option order, refs, shortcuts and disabled semantics", () => {
    const choose = vi.fn();
    const shortcut = vi.fn();
    const option = createRef<HTMLButtonElement>();
    render(
      <QuestionCard
        title="Available hours?"
        titleId="fictional-question"
        eyebrow="Coach needs your answer"
        onKeyDown={shortcut}
      >
        <QuestionOptions>
          <QuestionOption
            ref={option}
            marker="1"
            label="Three hours"
            description="Three short rides"
            onClick={choose}
          />
          <QuestionOption
            marker="2"
            label="Five hours"
            description="Not available this week"
            disabled
            onClick={choose}
          />
        </QuestionOptions>
      </QuestionCard>,
    );
    expect(screen.getByRole("region", { name: "Available hours?" })).toBeInTheDocument();
    const choices = screen.getAllByRole("button");
    expect(choices[0]).toHaveTextContent("Three hours");
    option.current?.focus();
    expect(choices[0]).toHaveFocus();
    fireEvent.keyDown(choices[0]!, { key: "ArrowDown" });
    expect(shortcut).toHaveBeenCalledOnce();
    fireEvent.click(choices[0]!);
    fireEvent.click(choices[1]!);
    expect(choose).toHaveBeenCalledOnce();
  });
  it("forwards custom editor labels, validation and focus", () => {
    const input = createRef<HTMLTextAreaElement>();
    const changed = vi.fn();
    render(
      <>
        <label htmlFor="fictional-answer">Your answer</label>
        <QuestionInput
          id="fictional-answer"
          ref={input}
          aria-invalid="true"
          aria-describedby="fictional-error"
          onChange={changed}
        />
        <p id="fictional-error" role="alert">
          Enter an answer
        </p>
      </>,
    );
    input.current?.focus();
    const textbox = screen.getByRole("textbox", { name: "Your answer" });
    expect(textbox).toHaveFocus();
    expect(textbox).toHaveAccessibleDescription("Enter an answer");
    fireEvent.change(textbox, { target: { value: "Four hours" } });
    expect(changed).toHaveBeenCalledOnce();
  });
  it("presents recorded answers and busy announcements without changing state", () => {
    const edit = vi.fn();
    const { rerender } = render(
      <RecordedAnswer
        title="Your choice is saved"
        aria-label="Recorded answer"
        actions={<Button onClick={edit}>Edit</Button>}
      >
        Three hours
      </RecordedAnswer>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(edit).toHaveBeenCalledOnce();
    rerender(
      <RecordedAnswer
        title="Continuing with your choice…"
        aria-label="Recorded answer"
        aria-live="polite"
        busy
      >
        Three hours
      </RecordedAnswer>,
    );
    expect(screen.getByRole("region", { name: "Recorded answer" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByText("Three hours")).toBeInTheDocument();
  });
});
