import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  BeforeAfterList,
  Button,
  Disclosure,
  EvidenceList,
  MetricList,
  NoticeRow,
} from "../src/index";

const meta = { title: "Shared/Facts" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const rows = [
  { id: "hours", label: "Weekly time", source: "your answer", value: "6 hours" },
  { id: "ride", label: "Longest Workout", source: "your answer", value: "90 min" },
  { id: "power", label: "Average power", source: "recorded activity", value: "—" },
];

export const Evidence: Story = {
  render: () => <EvidenceList label="Confirmed facts" rows={rows} />,
};
export const Metrics: Story = { render: () => <MetricList label="Recorded metrics" rows={rows} /> };
export const SourceDisclosure: Story = {
  render: () => (
    <Disclosure summary="How this Plan was built">
      <EvidenceList label="Plan basis" rows={rows} />
    </Disclosure>
  ),
};
export const Notices: Story = {
  render: () => (
    <div className="grid w-full gap-4">
      <NoticeRow title="Recorded through 6 September 1998">
        The last known rides remain visible.
      </NoticeRow>
      <NoticeRow tone="warning" title="Some rides are still syncing">
        Trend unavailable until the week is complete.
      </NoticeRow>
      <NoticeRow
        tone="danger"
        title="The file could not be prepared"
        action={
          <Button variant="outline" size="sm">
            Try again
          </Button>
        }
      >
        Your message draft is safe.
      </NoticeRow>
      <NoticeRow tone="success" title="Answer recorded">
        Your usual week is saved.
      </NoticeRow>
    </div>
  ),
};
export const Changes: Story = {
  render: () => (
    <BeforeAfterList
      label="Workout changes"
      itemLabel="Workout"
      rows={[
        { id: "tue", label: "Tuesday · Tempo", before: "60 min · 180 W", after: "45 min · 180 W" },
        { id: "sat", label: "Saturday · Endurance", before: "90 min", after: "90 min" },
      ]}
    />
  ),
};
export const NoChanges: Story = {
  render: () => <BeforeAfterList label="Workout changes" rows={[]} empty="No workout changes." />,
};
