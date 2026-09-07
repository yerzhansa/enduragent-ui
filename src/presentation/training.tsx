import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "../cn.js";

const styles = {
  weekSection: "min-w-0",
  weekHero:
    "grid min-w-0 grid-cols-[minmax(210px,0.82fr)_minmax(0,1.18fr)] items-stretch gap-6 max-[761px]:grid-cols-1 max-[761px]:gap-[18px]",
  weekFacts: "min-w-0",
  weekEyebrow: "m-0 text-xs leading-4 font-semibold text-ink-3",
  weekTime:
    "mt-2 [overflow-wrap:anywhere] text-2xl leading-8 font-semibold tracking-normal tabular-nums",
  weekMetrics: "mt-2.5 min-h-5 min-w-0 text-sm leading-5 text-ink-2 tabular-nums",
  trend:
    "m-0 grid min-w-0 grid-rows-[auto_1fr] gap-2.5 border-l border-line pl-6 max-[761px]:border-t max-[761px]:border-l-0 max-[761px]:pt-3.5 max-[761px]:pl-0",
  trendCaption:
    "flex items-baseline justify-between gap-row text-xs leading-4 font-normal text-ink-3",
  trendBars:
    "grid min-h-23 grid-cols-6 items-end gap-inset border-b border-line max-[761px]:min-h-19",
  trendColumn: "grid h-full min-w-0 grid-rows-[1fr_auto] items-end gap-1",
  trendBar: "training-trend-bar w-full rounded-t-chip bg-line-2",
  trendLabel:
    "overflow-hidden text-center text-xs leading-4 text-ink-3 text-ellipsis whitespace-nowrap",
  trendUnavailable: "mt-2 text-sm leading-5 font-medium text-ink",
  trendReason: "mt-1 text-xs leading-5 text-ink-2",
  ridesHeading:
    "mb-row flex items-baseline justify-between gap-row [&_h2]:m-0 [&_h2]:text-lg [&_h2]:leading-7 [&_h2]:font-semibold [&_span]:text-xs [&_span]:leading-4 [&_span]:text-ink-3",
  historyRideItem: "group/callout border-t border-line last:border-b",
  historyRideButton:
    "group/ride relative grid min-h-19.5 w-full min-w-0 grid-cols-[58px_minmax(0,1fr)_auto_18px] items-center gap-3.5 bg-transparent px-inset py-row text-left text-ink outline-none transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink group-data-[callout=true]/callout:bg-[color-mix(in_srgb,var(--brand-soft)_58%,transparent)] motion-reduce:transition-none max-[761px]:grid-cols-[46px_minmax(0,1fr)_18px] max-[761px]:gap-row",
  historyRideDate:
    "grid gap-0.5 text-center text-xs leading-4 text-ink-3 [&>strong]:text-lg [&>strong]:leading-7 [&>strong]:font-semibold [&>strong]:text-ink [&>strong]:tabular-nums",
  historyRideMain: "grid min-w-0 gap-1",
  historyRideTitle:
    "flex min-w-0 flex-wrap items-center gap-inset [&>strong]:overflow-hidden [&>strong]:text-sm [&>strong]:leading-5 [&>strong]:font-semibold [&>strong]:text-ellipsis [&>strong]:whitespace-nowrap [&>span]:inline-flex [&>span]:min-h-5 [&>span]:items-center [&>span]:rounded-chip [&>span]:bg-brand-soft [&>span]:px-1.5 [&>span]:text-xs [&>span]:leading-4 [&>span]:font-medium [&>span]:text-brand",
  historyRideMeta:
    "overflow-hidden text-xs leading-4 text-ink-3 text-ellipsis whitespace-nowrap max-[761px]:hidden",
  historyRideReason:
    "overflow-hidden text-xs leading-4 font-medium text-brand text-ellipsis whitespace-nowrap",
  historyRideStats:
    "grid grid-cols-[repeat(2,auto)] gap-x-[18px] gap-y-1 text-right text-xs leading-4 text-ink-2 tabular-nums [&>strong]:font-medium [&>strong]:text-ink max-[761px]:col-start-2 max-[761px]:row-start-2 max-[761px]:justify-start max-[761px]:text-left",
  historyRideArrow:
    "grid place-items-center text-base leading-4 text-ink-3 transition-transform group-hover/ride:translate-x-0.5 motion-reduce:transition-none max-[761px]:col-start-3 max-[761px]:row-span-2 max-[761px]:row-start-1",
  recordedMetrics:
    "my-3.5 grid grid-cols-4 gap-3.5 border-y border-line py-3.5 max-[761px]:grid-cols-2 max-[520px]:grid-cols-1 [&>div]:min-w-0 [&_dt]:text-xs [&_dt]:font-medium [&_dt]:text-ink-3 [&_dd]:mt-1 [&_dd]:[overflow-wrap:anywhere] [&_dd]:text-sm [&_dd]:font-medium [&_dd]:tabular-nums",
  calloutReason:
    "mt-3.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 rounded-ctl bg-brand-soft px-3 py-2.5 text-sm text-brand [&_strong]:font-semibold [&_span]:text-xs [&_span]:leading-5",
};

export type TrendBucket = {
  readonly id: string;
  readonly label: ReactNode;
  readonly range: ReactNode;
  readonly value: number;
  readonly count: ReactNode;
  readonly formattedValue: ReactNode;
};

export function CompactTrend({
  title,
  period,
  content,
  className,
  ...props
}: Omit<ComponentProps<"figure">, "title" | "children" | "content"> & {
  readonly title: ReactNode;
  readonly period: ReactNode;
  readonly content:
    | {
        readonly kind: "ready";
        readonly buckets: readonly TrendBucket[];
        readonly headings: readonly [ReactNode, ReactNode, ReactNode];
      }
    | { readonly kind: "unavailable"; readonly message: ReactNode; readonly reason: ReactNode };
}) {
  const id = useId();
  const maximum =
    content.kind === "ready" ? Math.max(...content.buckets.map((bucket) => bucket.value), 1) : 1;
  return (
    <figure {...props} className={cn(styles.trend, className)} aria-labelledby={id}>
      <figcaption id={id} className={styles.trendCaption}>
        <span>{title}</span> <span>{period}</span>
      </figcaption>
      {content.kind === "unavailable" ? (
        <>
          <p className={styles.trendUnavailable}>{content.message}</p>
          <p className={styles.trendReason}>{content.reason}</p>
        </>
      ) : (
        <>
          <div className={styles.trendBars} aria-hidden="true">
            {content.buckets.map((bucket) => (
              <span className={styles.trendColumn} key={bucket.id}>
                <span
                  className={styles.trendBar}
                  style={{ height: `${(bucket.value / maximum) * 75}%` }}
                />
                <span className={styles.trendLabel}>{bucket.label}</span>
              </span>
            ))}
          </div>
          <table className="sr-only">
            <caption>
              {title} {period}
            </caption>
            <thead>
              <tr>
                {content.headings.map((heading, index) => (
                  <th scope="col" key={index}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.buckets.map((bucket) => (
                <tr key={bucket.id}>
                  <th scope="row">{bucket.range}</th>
                  <td>{bucket.count}</td>
                  <td>{bucket.formattedValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </figure>
  );
}

export function WeeklySummary({
  label,
  ridingTime,
  rideCount,
  distance,
  load,
  trend,
  heading = "Weekly summary",
  className,
  ...props
}: Omit<ComponentProps<"section">, "children"> & {
  readonly label: ReactNode;
  readonly ridingTime: ReactNode;
  readonly rideCount: ReactNode;
  readonly distance: ReactNode;
  readonly load: ReactNode;
  readonly trend: ReactNode;
  readonly heading?: ReactNode;
}) {
  const id = useId();
  return (
    <section {...props} className={cn(styles.weekSection, className)} aria-labelledby={id}>
      <h2 id={id} className="sr-only">
        {heading}
      </h2>
      <div className={styles.weekHero}>
        <div className={styles.weekFacts}>
          <p className={styles.weekEyebrow}>{label}</p>
          <p className={styles.weekTime} data-summary-metric="riding-time">
            {ridingTime}
          </p>
          <p className={styles.weekMetrics}>
            <span data-summary-metric="ride-count">{rideCount}</span>
            {" · "}
            <span data-summary-metric="distance">{distance}</span>
            {" · "}
            <span data-summary-metric="load">{load}</span>
          </p>
        </div>
        {trend}
      </div>
    </section>
  );
}

export function SectionHeading({
  title,
  meta,
  headingId,
  className,
  ...props
}: Omit<ComponentProps<"div">, "title" | "children"> & {
  readonly title: ReactNode;
  readonly meta?: ReactNode;
  readonly headingId?: string;
}) {
  return (
    <div {...props} className={cn(styles.ridesHeading, className)}>
      <h2 id={headingId}>{title}</h2>
      {meta == null ? null : <span>{meta}</span>}
    </div>
  );
}

export function SelectableRideRow({
  date,
  title,
  meta,
  duration,
  load,
  callout,
  className,
  ...buttonProps
}: Omit<ComponentProps<"button">, "title" | "children"> & {
  readonly date: { readonly iso: string; readonly weekday: ReactNode; readonly day: ReactNode };
  readonly title: ReactNode;
  readonly meta: ReactNode;
  readonly duration?: ReactNode;
  readonly load?: ReactNode;
  readonly callout?: { readonly label: ReactNode; readonly reason: string };
}) {
  return (
    <li className={styles.historyRideItem} data-callout={callout ? "true" : undefined}>
      <button {...buttonProps} type="button" className={cn(styles.historyRideButton, className)}>
        <time className={styles.historyRideDate} data-parity="ride-day" dateTime={date.iso}>
          <span>{date.weekday}</span>
          <strong>{date.day}</strong>
        </time>
        <span className={styles.historyRideMain}>
          <span className={styles.historyRideTitle}>
            <strong>{title}</strong>
            {callout ? <span>{callout.label}</span> : null}
          </span>
          <span className={styles.historyRideMeta} data-parity="ride-meta">
            {meta}
          </span>
          {callout ? (
            <span className={styles.historyRideReason} title={callout.reason}>
              {callout.reason}
            </span>
          ) : null}
        </span>
        <span className={styles.historyRideStats} data-parity="ride-stats">
          {duration == null ? null : <strong>{duration}</strong>}
          {load == null ? null : <span>{load}</span>}
        </span>
        <span className={styles.historyRideArrow} aria-hidden="true">
          →
        </span>
      </button>
    </li>
  );
}

export function RideMetricList({
  rows,
  className,
  ...props
}: Omit<ComponentProps<"dl">, "children"> & {
  readonly rows: readonly {
    readonly id: string;
    readonly label: ReactNode;
    readonly value: ReactNode;
  }[];
}) {
  return (
    <dl {...props} className={cn(styles.recordedMetrics, className)}>
      {rows.map((row) => (
        <div key={row.id}>
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function FactualCallout({
  title,
  children,
  className,
  ...props
}: Omit<ComponentProps<"p">, "title"> & { readonly title: ReactNode }) {
  return (
    <p {...props} className={cn(styles.calloutReason, className)}>
      <strong>{title}</strong>
      <span>{children}</span>
    </p>
  );
}
