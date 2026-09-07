import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  PlanAction,
  PlanChoiceOption,
  PlanEvidenceRow,
  PlanEvidenceTable,
  PlanProjectionCard,
  PlanResultNotice,
} from "../src/index";

const meta = {
  title: "Presentation/Plan projection",
  component: PlanProjectionCard,
  args: { title: "Build consistency" },
} satisfies Meta<typeof PlanProjectionCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Paused: Story = {
  args: {
    eyebrow: "Plan creation",
    status: "Paused",
    summary: "3 of 7 answered. No Plan is active.",
    actions: (
      <>
        <PlanAction className="danger">Discard</PlanAction>
        <PlanAction className="primary">Continue in Chat</PlanAction>
      </>
    ),
  },
};

export const Evidence: Story = {
  args: {
    eyebrow: "Draft",
    status: "Ready for review",
    plainStatus: true,
    summary: "Review the answers used to build this Plan.",
    children: (
      <PlanEvidenceTable label="Draft inputs">
        <PlanEvidenceRow
          label="Main Goal · your answer"
          value="Build consistency"
        />
        <PlanEvidenceRow label="Weekly time limit · your answer" value="6 h" />
      </PlanEvidenceTable>
    ),
    actions: (
      <>
        <PlanAction>Edit answers</PlanAction>
        <PlanAction className="primary">Activate Plan</PlanAction>
      </>
    ),
  },
};

export const Choices: Story = {
  render: () => (
    <div className="grid gap-1">
      <PlanChoiceOption
        marker={1}
        label="Fixed Schedule"
        detail="Workouts on set days"
      />
      <PlanChoiceOption
        marker={2}
        label="Flexible Workout pool"
        detail="Choose when to ride each week"
      />
    </div>
  ),
};

export const Results: Story = {
  render: () => (
    <div className="grid gap-4">
      <PlanResultNotice text="Plan activated" />
      <PlanResultNotice text="Plan creation discarded" />
    </div>
  ),
};
