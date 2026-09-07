import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import {
  ArtifactCard,
  BeforeAfterList,
  Button,
  Disclosure,
  EvidenceList,
  NoticeRow,
  ProgressDisplay,
  WorkoutList,
} from "../src/index";

const meta = {
  title: "Compositions/Plan",
  component: ArtifactCard,
  args: { title: "Plan" },
} satisfies Meta<typeof ArtifactCard>;
export default meta;
type Story = StoryObj<typeof meta>;
const action = fn();
const evidence = [
  { id: "goal", label: "Main Goal", source: "your answer", value: "Build consistency" },
  { id: "hours", label: "Weekly time limit", source: "your answer", value: "6 h" },
  { id: "days", label: "Usable weekdays", source: "your answer", value: "Mon, Wed, Sat" },
  {
    id: "baseline",
    label: "Recent riding",
    source: "intervals.icu",
    value: "6 h 40 weekly · longest 2 h 10",
  },
  { id: "ftp", label: "FTP", source: "intervals.icu", value: "220 W" },
  { id: "approach", label: "Training approach", source: "disclosed default", value: "Balanced" },
];
const workouts = [
  {
    id: "fictional-easy",
    when: "Mon 7 Sep 1998",
    title: "Easy ride",
    detail: "45 min",
    status: "Planned",
  },
  {
    id: "fictional-steady",
    when: "Wed 9 Sep 1998",
    title: "Steady ride",
    detail: "60 min",
    status: "Planned",
  },
  {
    id: "fictional-long",
    when: "Sat 12 Sep 1998",
    title: "Long ride",
    detail: "90 min",
    status: "Planned",
  },
];
const changes = [
  { id: "changed", label: "Wed 9 Sep 1998 · Steady ride", before: "60 min", after: "45 min" },
  { id: "removed", label: "Fri 11 Sep 1998 · Easy ride", before: "30 min", after: "Not in Plan" },
  { id: "added", label: "Sun 13 Sep 1998 · Easy ride", before: "Not in Plan", after: "30 min" },
];
const draftActions = (
  <>
    <Button variant="destructive" onClick={action}>
      Discard
    </Button>
    <Button variant="outline" onClick={action}>
      Edit answers
    </Button>
    <Button onClick={action}>Activate Plan</Button>
  </>
);
function DraftEvidence() {
  return (
    <>
      <Disclosure summary="How this Plan was built">
        <EvidenceList label="Draft inputs" rows={evidence} />
      </Disclosure>
      <WorkoutList label="Week 1 · exact Workouts" rows={workouts} />
      <Disclosure summary="Week 2 · 14–20 Sep 1998">
        <WorkoutList
          label="Week 2 Workouts"
          rows={workouts.map((workout, index) => ({
            ...workout,
            id: `next-${workout.id}`,
            when: ["Mon 14 Sep 1998", "Wed 16 Sep 1998", "Sat 19 Sep 1998"][index],
          }))}
        />
      </Disclosure>
    </>
  );
}
export const Creation: Story = {
  render: () => (
    <ArtifactCard
      eyebrow="Plan creation"
      title="Build consistency"
      status="In progress"
      summary="3 of 7 answered. No Plan is active."
      actions={
        <Button variant="destructive" onClick={action}>
          Discard
        </Button>
      }
    />
  ),
};
export const Resume: Story = {
  render: () => (
    <ArtifactCard
      eyebrow="Plan creation"
      title="Build consistency"
      status="Paused"
      summary="3 of 7 answered. Your active Plan keeps running."
      actions={
        <>
          <Button variant="destructive" onClick={action}>
            Discard
          </Button>
          <Button onClick={action}>Continue in Chat</Button>
        </>
      }
    />
  ),
};
export const Building: Story = {
  render: () => (
    <ArtifactCard
      eyebrow="Draft"
      title="Building your Draft"
      status="In progress"
      summary="1 of 8 weeks complete."
    >
      <ProgressDisplay label="Weeks complete" value={{ kind: "count", completed: 1, total: 8 }} />
      <WorkoutList label="Week 1 Workouts" rows={workouts} />
      <EvidenceList
        label="Later build outline"
        rows={[
          { id: "later", label: "Weeks 2 to 8", value: "Not started · Workouts will appear here" },
        ]}
      />
    </ArtifactCard>
  ),
};
export const DraftFresh: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("How this Plan was built"));
    await expect(canvas.getByRole("table", { name: "Draft inputs" })).toBeVisible();
    await userEvent.click(canvas.getByText("Week 2 · 14–20 Sep 1998"));
    await expect(canvas.getByText("Mon 14 Sep 1998")).toBeVisible();
    const labels = canvas.getAllByRole("button").map((button) => button.textContent);
    await expect(labels).toEqual(["Discard", "Edit answers", "Activate Plan"]);
  },
  render: () => (
    <ArtifactCard
      eyebrow="Draft"
      title="Build consistency"
      status="Ready to review"
      summary="7 Sep to 1 Nov 1998 · 8 weeks · Fixed Schedule"
      actions={draftActions}
    >
      <DraftEvidence />
    </ArtifactCard>
  ),
};
export const DraftStale: Story = {
  render: () => (
    <ArtifactCard
      eyebrow="Draft"
      title="Build consistency"
      status="Stale"
      summary="7 Sep to 1 Nov 1998 · 8 weeks · Fixed Schedule"
      actions={
        <>
          <Button variant="destructive" onClick={action}>
            Discard
          </Button>
          <Button variant="outline" onClick={action}>
            Edit answers
          </Button>
          <Button onClick={action}>Rebuild Draft</Button>
        </>
      }
    >
      <NoticeRow tone="warning" title="Answers changed">
        Rebuild the Draft before activating it. These Workouts use your earlier answers.
      </NoticeRow>
      <DraftEvidence />
    </ArtifactCard>
  ),
};
export const LibraryEmpty: Story = {
  render: () => <ArtifactCard title="No active Plan" summary="Create a Plan when you are ready." />,
};
export const LibraryActive: Story = {
  render: () => (
    <ArtifactCard
      eyebrow="Active Plan"
      title="Build consistency"
      status="Active"
      summary="7 Sep to 1 Nov 1998 · 8 weeks · Calendar up to date"
      actions={
        <>
          <Button variant="destructive" onClick={action}>
            Stop Plan
          </Button>
          <Button variant="outline" onClick={action}>
            Read Plan details
          </Button>
          <Button onClick={action}>Change in Chat</Button>
        </>
      }
    />
  ),
};
export const LibraryClosed: Story = {
  render: () => (
    <ArtifactCard
      eyebrow="Closed Plan"
      title="Build consistency"
      status="Closed"
      summary="13 Jul to 6 Sep 1998 · 8 weeks · Completed"
      actions={
        <Button variant="outline" onClick={action}>
          Read final details
        </Button>
      }
    />
  ),
};
export const ChangeReview: Story = {
  render: () => (
    <ArtifactCard
      eyebrow="Plan change"
      title="Shorter Wednesday rides"
      status="Needs approval"
      summary="Future Workouts reflect a 45 min weekday limit."
      actions={
        <>
          <Button variant="outline" onClick={action}>
            Discard
          </Button>
          <Button onClick={action}>Apply change</Button>
        </>
      }
    >
      <BeforeAfterList label="Affected individual Workouts" rows={changes} />
      <BeforeAfterList
        label="Before and after totals"
        rows={[
          { id: "week", label: "Week 1", before: "225 min", after: "210 min" },
          { id: "unchanged", label: "Week 2", before: "195 min", after: "195 min" },
        ]}
      />
    </ArtifactCard>
  ),
};
export const ChangeNoop: Story = {
  render: () => (
    <ArtifactCard
      eyebrow="Plan change"
      title="No Workout changes"
      summary="These Workouts already fit your confirmed limits."
      actions={
        <Button variant="outline" onClick={action}>
          Back to Plan
        </Button>
      }
    >
      <BeforeAfterList label="Affected individual Workouts" rows={[]} empty="No Workout changes." />
    </ArtifactCard>
  ),
};
export const ChangeStale: Story = {
  render: () => (
    <ArtifactCard
      eyebrow="Plan change"
      title="Shorter Wednesday rides"
      status="Stale"
      actions={
        <>
          <Button variant="outline" onClick={action}>
            Discard
          </Button>
          <Button onClick={action}>Rebuild change</Button>
        </>
      }
    >
      <NoticeRow tone="warning" title="The Plan changed">
        Review a rebuilt proposal before applying this change.
      </NoticeRow>
      <BeforeAfterList label="Earlier proposed changes" rows={changes} />
    </ArtifactCard>
  ),
};
export const ChangeFailure: Story = {
  render: () => (
    <ArtifactCard
      eyebrow="Plan change"
      title="Change could not be applied"
      actions={
        <>
          <Button variant="outline" onClick={action}>
            Back to Plan
          </Button>
          <Button onClick={action}>Retry</Button>
        </>
      }
    >
      <NoticeRow tone="danger" title="Your current Plan is unchanged">
        Try again when the connection is available.
      </NoticeRow>
      <BeforeAfterList label="Proposed changes" rows={changes} />
    </ArtifactCard>
  ),
};
export const ChangeHistory: Story = {
  render: () => (
    <ArtifactCard
      eyebrow="Plan change"
      title="Shorter Wednesday rides"
      status="Applied"
      summary="7 Sep 1998 · Saved changes cannot be edited."
      actions={
        <Button variant="outline" onClick={action}>
          Read Plan details
        </Button>
      }
    >
      <BeforeAfterList label="Applied changes" rows={changes} />
      <Disclosure summary="Change evidence">
        <EvidenceList
          label="Confirmed limits"
          rows={[
            { id: "limit", label: "Weekday duration cap", source: "your answer", value: "45 min" },
            { id: "scope", label: "Applies to", value: "Future Workouts" },
          ]}
        />
      </Disclosure>
    </ArtifactCard>
  ),
};
