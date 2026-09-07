import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "../cn.js";

export type PresentationTone = "neutral" | "success" | "warning" | "danger";

export type EvidenceItem = {
  readonly id: string;
  readonly label: ReactNode;
  readonly source?: ReactNode;
  readonly value: ReactNode;
};

export function EvidenceList({
  label,
  rows,
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  readonly label: string;
  readonly rows: readonly EvidenceItem[];
}) {
  return (
    <div {...props} role="table" aria-label={label} className={cn("min-w-0", className)}>
      {rows.map((row) => (
        <div
          key={row.id}
          role="row"
          className="grid min-w-0 grid-cols-[minmax(104px,0.72fr)_minmax(0,1.28fr)] gap-4 border-t border-line px-4 py-3 first:border-t-0 max-[560px]:grid-cols-1 max-[560px]:gap-1"
        >
          <span role="rowheader" className="text-xs text-ink-2 [overflow-wrap:anywhere]">
            {row.label}
            {row.source === undefined ? null : <> · {row.source}</>}
          </span>
          <strong
            role="cell"
            className="text-right text-sm font-semibold tabular-nums [overflow-wrap:anywhere] max-[560px]:text-left"
          >
            {row.value}
          </strong>
        </div>
      ))}
    </div>
  );
}

export function MetricList({
  label,
  rows,
  className,
  ...props
}: Omit<ComponentProps<"dl">, "children"> & {
  readonly label: string;
  readonly rows: readonly EvidenceItem[];
}) {
  return (
    <dl {...props} aria-label={label} className={cn("m-0 grid min-w-0 gap-0", className)}>
      {rows.map((row) => (
        <div
          key={row.id}
          className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-baseline gap-4 border-t border-line py-3 first:border-t-0"
        >
          <dt className="text-sm text-ink-2 [overflow-wrap:anywhere]">
            {row.label}
            {row.source === undefined ? null : <span className="text-xs"> · {row.source}</span>}
          </dt>
          <dd className="m-0 text-right text-sm font-semibold tabular-nums [overflow-wrap:anywhere]">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function Disclosure({
  summary,
  summaryProps,
  children,
  className,
  ...props
}: ComponentProps<"details"> & {
  readonly summary: ReactNode;
  readonly summaryProps?: ComponentProps<"summary">;
}) {
  return (
    <details {...props} className={cn("min-w-0 text-sm text-ink-2", className)}>
      <summary
        {...summaryProps}
        className={cn(
          "w-fit cursor-pointer rounded-ctl font-medium text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          summaryProps?.className,
        )}
      >
        {summary}
      </summary>
      <div className="mt-inset min-w-0">{children}</div>
    </details>
  );
}

const noticeTones = {
  neutral: "border-line-2 bg-surface-2",
  success: "border-ok bg-ok/5",
  warning: "border-warn bg-warn/5",
  danger: "border-danger bg-danger/5",
} satisfies Record<PresentationTone, string>;

export function NoticeRow({
  tone = "neutral",
  title,
  action,
  children,
  className,
  ...props
}: Omit<ComponentProps<"aside">, "title"> & {
  readonly tone?: PresentationTone;
  readonly title?: ReactNode;
  readonly action?: ReactNode;
}) {
  return (
    <aside
      {...props}
      data-tone={tone}
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-inset border-l-[3px] px-3 py-row text-sm text-ink-2",
        noticeTones[tone],
        className,
      )}
    >
      <div className="grid min-w-0 flex-1 gap-1 [overflow-wrap:anywhere]">
        {title === undefined ? null : <strong className="font-medium text-ink">{title}</strong>}
        {children}
      </div>
      {action === undefined ? null : <div className="shrink-0">{action}</div>}
    </aside>
  );
}

export type BeforeAfterItem = {
  readonly id: string;
  readonly label: ReactNode;
  readonly before: ReactNode;
  readonly after: ReactNode;
};

export function BeforeAfterList({
  label,
  rows,
  empty = "No changes.",
  itemLabel = "Item",
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  readonly label: string;
  readonly rows: readonly BeforeAfterItem[];
  readonly empty?: ReactNode;
  readonly itemLabel?: string;
}) {
  const id = useId();
  return (
    <div {...props} className={cn("min-w-0", className)}>
      {rows.length === 0 ? (
        <p className="m-0 text-sm text-ink-2">{empty}</p>
      ) : (
        <table className="w-full table-fixed border-collapse text-sm" aria-labelledby={id}>
          <caption id={id} className="sr-only">
            {label}
          </caption>
          <thead>
            <tr className="text-xs text-ink-2">
              <th scope="col" className="px-2 py-inset text-left font-medium">
                {itemLabel}
              </th>
              <th scope="col" className="px-2 py-inset text-left font-medium">
                Before
              </th>
              <th scope="col" className="px-2 py-inset text-left font-medium">
                After
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-line align-top [overflow-wrap:anywhere]">
                <th scope="row" className="px-2 py-3 text-left font-medium">
                  {row.label}
                </th>
                <td className="px-2 py-3 text-ink-2">{row.before}</td>
                <td className="px-2 py-3 font-medium text-ink">{row.after}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
