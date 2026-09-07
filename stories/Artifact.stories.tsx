import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArtifactCard, Button, EvidenceList, ProgressDisplay, WorkoutList } from "../src/index";

const meta = { title: "Shared/Artifacts", component: ArtifactCard } satisfies Meta<
  typeof ArtifactCard
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Plain: Story = {
  args: { title: "Sunday endurance ride", summary: "A steady ride at conversational effort." },
};
export const WithEvidence: Story = {
  args: {
    eyebrow: "Ride review",
    title: "Sunday endurance ride",
    summary: "6 September 1998 · 2h 14m · 68.4 km",
    status: "Added to Training",
    children: (
      <EvidenceList
        label="Ride facts"
        rows={[
          { id: "duration", label: "Riding time", source: "recorded activity", value: "2h 14m" },
          { id: "power", label: "Average power", value: "176 W" },
          { id: "load", label: "Load", value: "124" },
        ]}
      />
    ),
    actions: (
      <>
        <Button variant="outline" size="sm">
          View details
        </Button>
        <Button variant="outline" size="sm">
          Ask Coach
        </Button>
      </>
    ),
  },
};
export const WorkoutRows: Story = {
  args: {
    eyebrow: "Current week",
    title: "Build consistency",
    children: (
      <WorkoutList
        label="Week 1 Workouts"
        rows={[
          {
            id: "easy",
            when: "Mon 7 Sep",
            title: "Easy ride",
            detail: "45 min · Perceived effort",
            status: "Planned",
          },
          {
            id: "steady",
            when: "Priority 2 · Undated",
            title: "Steady endurance",
            detail: "75 min",
            status: "Pinned",
          },
        ]}
      />
    ),
  },
};
export const EmptyWeek: Story = {
  args: { title: "Recovery week", children: <WorkoutList label="Recovery Workouts" rows={[]} /> },
};
export const CountedProgress: Story = {
  args: {
    title: "Build consistency",
    children: (
      <div className="px-4 pb-4">
        <ProgressDisplay
          label="Validating week 6 of 12"
          value={{ kind: "count", completed: 6, total: 12 }}
        />
      </div>
    ),
  },
};
export const Working: Story = {
  args: {
    title: "Checking recent training",
    children: (
      <div className="px-4 pb-4">
        <ProgressDisplay label="Reading the completed ride" value={{ kind: "indeterminate" }} />
      </div>
    ),
  },
};
