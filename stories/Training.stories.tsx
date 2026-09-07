import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import {
  CompactTrend,
  FactualCallout,
  RideMetricList,
  SectionHeading,
  SelectableRideRow,
  WeeklySummary,
} from "../src/presentation/training";
import { NoticeRow } from "../src/presentation/facts";

const buckets = [2, 3, 0, 4, 3, 5].map((value, index) => ({
  id: `week-${index}`,
  label: `${index + 1} Aug`,
  range: `Week ${index + 1}, August 1998`,
  value,
  count: `${value} rides`,
  formattedValue: `${value} hr`,
}));
const trend = (
  <CompactTrend
    title="Riding time"
    period="Last 6 weeks"
    content={{ kind: "ready", buckets, headings: ["Week", "Rides", "Riding time"] }}
  />
);
const unavailable = (reason: string) => (
  <CompactTrend
    title="Riding time"
    period="Last 6 weeks"
    content={{ kind: "unavailable", message: "Trend unavailable", reason }}
  />
);
const meta = {
  title: "Shared/Training",
  component: WeeklySummary,
  args: {
    label: "This week",
    ridingTime: "5 hr 20 min",
    rideCount: "4 rides",
    distance: "142 km",
    load: "Load 240",
    trend,
  },
} satisfies Meta<typeof WeeklySummary>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Normal: Story = {};
export const Zero: Story = {
  args: {
    ridingTime: "0 min",
    rideCount: "0 rides",
    distance: "0 km",
    load: "Load 0",
    trend: (
      <CompactTrend
        title="Riding time"
        period="Last 6 weeks"
        content={{
          kind: "ready",
          buckets: buckets.map((bucket) => ({
            ...bucket,
            value: 0,
            count: "0 rides",
            formattedValue: "0 min",
          })),
          headings: ["Week", "Rides", "Riding time"],
        }}
      />
    ),
  },
};
export const Limited: Story = { args: { trend: unavailable("More recorded weeks are needed.") } };
export const Incomplete: Story = {
  args: {
    ridingTime: "At least 2 hr",
    rideCount: "At least 2 rides",
    distance: "Not recorded",
    load: "Load Not recorded",
    trend: unavailable("Some weeks have incomplete records."),
  },
};
export const Stale: Story = {
  render: (args) => (
    <>
      <NoticeRow tone="warning" title="Recorded through 7 September 1998">
        The latest refresh did not finish. Showing saved training.
      </NoticeRow>
      <WeeklySummary {...args} label="Last recorded week" />
    </>
  ),
};
export const Unavailable: Story = {
  render: () => (
    <NoticeRow title="Training unavailable">
      Import ride files or connect a training source to see completed riding.
    </NoticeRow>
  ),
};
export const ChartReady: Story = { render: () => trend };
export const ChartUnavailable: Story = {
  render: () => unavailable("Riding time was not recorded for every week."),
};
export const MetricMissing: Story = {
  render: () => (
    <RideMetricList
      aria-label="Recorded metrics"
      rows={[
        { id: "power", label: "Average power", value: "Not recorded" },
        { id: "load", label: "Load", value: "42" },
        { id: "hr", label: "Average heart rate", value: "136 bpm" },
      ]}
    />
  ),
};
export const Callout: Story = {
  render: () => (
    <FactualCallout title="Worth a look">
      Longest recorded ride in the 28 days ending 7 September 1998
    </FactualCallout>
  ),
};
export const RideSelection: Story = {
  render: () => (
    <ol className="m-0 list-none p-0">
      <SelectableRideRow
        aria-label="Open ride review: River loop"
        date={{ iso: "1998-09-07", weekday: "Mon", day: "7" }}
        title="River loop"
        meta="Road · 42 km"
        duration="1 hr 30 min"
        load="Load 62"
        onClick={fn()}
      />
      <SelectableRideRow
        aria-label="Open ride review: Morning ride"
        date={{ iso: "1998-09-06", weekday: "Sun", day: "6" }}
        title="Morning ride"
        meta="Road · distance not recorded"
        onClick={fn()}
      />
    </ol>
  ),
};
export const Composition: Story = {
  render: (args) => (
    <div className="grid gap-7">
      <WeeklySummary {...args} />
      <section>
        <SectionHeading title="Recent rides" meta="Newest first" />
        <ol className="m-0 list-none p-0">
          <SelectableRideRow
            aria-label="Open ride review: River loop"
            date={{ iso: "1998-09-07", weekday: "Mon", day: "7" }}
            title="River loop"
            meta="Road · 72 km"
            duration="2 hr 30 min"
            load="Load 108"
            callout={{
              label: "Worth a look",
              reason: "Longest recorded ride in the 28 days ending 7 September 1998",
            }}
            onClick={fn()}
          />
        </ol>
      </section>
    </div>
  ),
};
