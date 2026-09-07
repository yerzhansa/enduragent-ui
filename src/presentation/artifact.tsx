import { LoaderCircle } from "lucide-react";
import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "../cn.js";

export function ArtifactCard({
  eyebrow,
  title,
  headingLevel = 3,
  titleProps,
  summary,
  status,
  actions,
  children,
  className,
  ...props
}: Omit<ComponentProps<"section">, "title"> & {
  readonly eyebrow?: ReactNode;
  readonly title: ReactNode;
  readonly headingLevel?: 2 | 3;
  readonly titleProps?: Omit<ComponentProps<"h2">, "children">;
  readonly summary?: ReactNode;
  readonly status?: ReactNode;
  readonly actions?: ReactNode;
}) {
  const generatedTitleId = useId();
  const titleId = titleProps?.id ?? generatedTitleId;
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <section
      aria-labelledby={titleId}
      {...props}
      className={cn(
        "min-w-0 overflow-hidden rounded-card border border-line bg-surface text-sm",
        className,
      )}
    >
      <header className="grid gap-inset p-4">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-inset">
          <div className="grid min-w-0 flex-1 gap-inset">
            {eyebrow === undefined ? null : (
              <p className="m-0 text-xs font-medium text-ink-2 uppercase">{eyebrow}</p>
            )}
            <Heading
              {...titleProps}
              id={titleId}
              className={cn(
                "m-0 text-base font-semibold [overflow-wrap:anywhere]",
                titleProps?.className,
              )}
            >
              {title}
            </Heading>
          </div>
          {status === undefined ? null : (
            <span className="shrink-0 rounded-chip bg-surface-2 px-inset py-0.5 text-xs text-ink-2">
              {status}
            </span>
          )}
        </div>
        {summary === undefined ? null : (
          <div className="text-sm text-ink-2 [overflow-wrap:anywhere]">{summary}</div>
        )}
      </header>
      {children}
      {actions === undefined ? null : (
        <footer className="flex min-w-0 flex-wrap items-center gap-inset border-t border-line px-4 py-3">
          {actions}
        </footer>
      )}
    </section>
  );
}

export type ProgressValue =
  | { readonly kind: "count"; readonly completed: number; readonly total: number }
  | { readonly kind: "indeterminate" };

export function ProgressDisplay({
  label,
  value,
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  readonly label: string;
  readonly value: ProgressValue;
}) {
  const labelId = useId();
  return (
    <div {...props} className={cn("grid min-w-0 gap-inset", className)}>
      <div role="status" className="flex items-center gap-inset text-sm text-ink">
        {value.kind === "indeterminate" ? (
          <LoaderCircle
            className="size-3.5 shrink-0 animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        ) : null}
        <span id={labelId}>{label}</span>
      </div>
      <progress
        aria-labelledby={labelId}
        max={value.kind === "count" ? value.total : undefined}
        value={value.kind === "count" ? value.completed : undefined}
        className="block h-0.75 w-full overflow-hidden rounded-full border-0 bg-line accent-ink [&::-webkit-progress-bar]:bg-line [&::-webkit-progress-value]:bg-ink [&::-moz-progress-bar]:bg-ink"
      />
    </div>
  );
}

export type WorkoutListItem = {
  readonly id: string;
  readonly when: ReactNode;
  readonly title: ReactNode;
  readonly detail?: ReactNode;
  readonly status?: ReactNode;
};

export function WorkoutList({
  label,
  rows,
  empty = "No Workouts this week.",
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  readonly label: string;
  readonly rows: readonly WorkoutListItem[];
  readonly empty?: ReactNode;
}) {
  return (
    <div
      {...props}
      role={rows.length === 0 ? "group" : "list"}
      aria-label={label}
      className={cn("min-w-0", className)}
    >
      {rows.length === 0 ? (
        <p className="m-0 px-4 py-3 text-sm text-ink-2">{empty}</p>
      ) : (
        rows.map((row) => (
          <div
            role="listitem"
            key={row.id}
            className="grid min-w-0 grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)_auto] items-start gap-3 border-t border-line px-4 py-3 first:border-t-0 max-[560px]:grid-cols-[minmax(0,1fr)_auto]"
          >
            <span className="text-xs text-ink-2 [overflow-wrap:anywhere] max-[560px]:col-span-2">
              {row.when}
            </span>
            <div className="min-w-0 text-sm [overflow-wrap:anywhere]">
              <strong className="font-medium">{row.title}</strong>
              {row.detail === undefined ? null : <span> · {row.detail}</span>}
            </div>
            {row.status === undefined ? null : (
              <span className="rounded-chip bg-surface-2 px-inset py-0.5 text-xs text-ink-2">
                {row.status}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  );
}
