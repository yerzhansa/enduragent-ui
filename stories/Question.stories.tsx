import type { Meta, StoryObj } from "@storybook/react-vite";
import { useId, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "../src/components/button.js";
import {
  QuestionCard,
  QuestionEditor,
  QuestionInput,
  QuestionOption,
  QuestionOptions,
  RecordedAnswer,
} from "../src/presentation/question.js";

const meta = {
  title: "Presentation/Question",
  component: QuestionCard,
  args: {
    title: "Available hours?",
    titleId: "fictional-question",
    eyebrow: "Coach needs your answer",
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof QuestionCard>;
export default meta;
type Story = StoryObj<typeof meta>;
function QuestionExample({
  initialCustom = false,
  initialAnswer = null,
  error = false,
}: {
  readonly initialCustom?: boolean;
  readonly initialAnswer?: string | null;
  readonly error?: boolean;
}) {
  const id = useId();
  const inputId = useId();
  const [custom, setCustom] = useState(initialCustom);
  const [text, setText] = useState("");
  const [answer, setAnswer] = useState<string | null>(initialAnswer);
  const trigger = useRef<HTMLButtonElement>(null);
  if (answer !== null)
    return (
      <RecordedAnswer
        title="Your choice is saved"
        actions={
          <Button variant="ghost" size="sm" onClick={() => setAnswer(null)}>
            Edit
          </Button>
        }
      >
        {answer}
      </RecordedAnswer>
    );
  return (
    <QuestionCard
      title="How much time can you ride this week?"
      titleId={id}
      eyebrow="Coach needs your answer"
      aria-live="polite"
      actions={
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Skip question"
          onClick={() => setAnswer("Question skipped")}
        >
          <X aria-hidden="true" />
        </Button>
      }
    >
      {custom ? (
        <QuestionEditor>
          <label htmlFor={inputId} className="text-xs font-semibold text-ink-2">
            What would work better?
          </label>
          <QuestionInput
            id={inputId}
            autoFocus
            rows={2}
            value={text}
            onChange={(event) => setText(event.currentTarget.value)}
          />
          <div className="flex justify-end gap-inset">
            <Button
              variant="outline"
              onClick={() => {
                setCustom(false);
                requestAnimationFrame(() => trigger.current?.focus());
              }}
            >
              Back
            </Button>
            <Button disabled={text.trim().length === 0} onClick={() => setAnswer(text.trim())}>
              Continue
            </Button>
          </div>
        </QuestionEditor>
      ) : (
        <QuestionOptions>
          <QuestionOption
            marker="1"
            label="Three hours"
            description="Three short rides."
            annotation="Recommended"
            onClick={() => setAnswer("Three hours")}
          />
          <QuestionOption
            marker="2"
            label="Five hours"
            description="Not available with your selected days."
            disabled
          />
          <QuestionOption
            ref={trigger}
            marker={<Plus className="size-4" aria-hidden="true" />}
            label="Something else"
            description="Answer in your own words."
            onClick={() => setCustom(true)}
          />
          {error ? (
            <p role="alert" className="m-0 px-2 pb-2 text-xs text-danger">
              Your answer couldn’t be saved. Try again.
            </p>
          ) : null}
        </QuestionOptions>
      )}
    </QuestionCard>
  );
}
export const Unanswered: Story = { render: () => <QuestionExample /> };
export const Custom: Story = { render: () => <QuestionExample initialCustom /> };
export const Error: Story = { render: () => <QuestionExample error /> };
export const Recorded: Story = {
  render: () => <QuestionExample initialAnswer="Three hours · week of 7 September 1998" />,
};
export const Busy: Story = {
  render: () => (
    <RecordedAnswer title="Continuing with your choice…" busy aria-live="polite">
      Three hours
    </RecordedAnswer>
  ),
};
