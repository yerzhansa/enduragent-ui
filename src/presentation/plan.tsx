import { Children, type ComponentProps, type ReactNode } from "react";
import { cn } from "../cn.js";

export function PlanAction({
  className = "",
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        className.startsWith("nav-item")
          ? ""
          : "action-button min-h-ctl max-w-full rounded-ctl border border-line bg-surface px-ctl-px py-0 text-sm leading-5 text-ink [&.primary]:border-brand [&.primary]:bg-brand [&.primary]:text-brand-ink [&.danger]:border-danger/52 [&.danger]:bg-danger/8 [&.danger]:text-danger",
        className
      )}
    />
  );
}

export function PlanEvidenceRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: ReactNode;
}) {
  return (
    <div
      className="evidence-row grid grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] items-start gap-ctl-px border-b border-line px-4.5 py-[11px]"
      role="row"
    >
      <span className="text-xs text-ink-2" role="rowheader">
        {label}
      </span>
      <strong
        className="w-full min-w-0 text-right text-sm font-medium"
        role="cell"
      >
        {value}
      </strong>
    </div>
  );
}

export function PlanEvidenceTable({
  label = "Facts",
  className,
  ...props
}: ComponentProps<"div"> & { readonly label?: string }) {
  return (
    <div
      {...props}
      className={cn("evidence-table border-t border-line", className)}
      role="table"
      aria-label={label}
    />
  );
}

export function PlanProjectionCard({
  eyebrow = "",
  title,
  status = "",
  plainStatus = false,
  summary = "",
  children,
  actions,
  className,
  ...props
}: Omit<ComponentProps<"section">, "title"> & {
  readonly eyebrow?: string;
  readonly title: string;
  readonly status?: string;
  readonly plainStatus?: boolean;
  readonly summary?: string;
  readonly actions?: ReactNode;
}) {
  const hasBody = Children.toArray(children).some((child) => child !== "");
  const hasActions = Children.toArray(actions).some((child) => child !== "");
  return (
    <section
      {...props}
      className={cn(
        "artifact evidence-status-card plan-projection-card my-4 overflow-hidden rounded-card border border-line bg-surface p-0",
        className
      )}
    >
      <div className="evidence-card-head p-4">
        <div className="artifact-title-row flex items-start justify-between gap-3">
          <div className="min-w-0 [overflow-wrap:anywhere]">
            {eyebrow ? (
              <p className="artifact-eyebrow m-0 mb-[calc(var(--inset)/2)] text-xs font-semibold text-ink-2 uppercase">
                {eyebrow}
              </p>
            ) : null}
            <h3 className="m-0 text-sm font-bold" tabIndex={-1}>
              {title}
            </h3>
          </div>
          {status ? (
            <span
              className={cn(
                "status-chip inline-flex shrink-0 items-center whitespace-nowrap text-xs text-ink-2",
                plainStatus
                  ? "is-plain rounded-none bg-transparent p-0"
                  : "gap-[5px] rounded-full bg-sunk px-2 py-[3px]"
              )}
            >
              {status}
            </span>
          ) : null}
        </div>
        {summary ? <p className="m-0 mt-inset">{summary}</p> : null}
      </div>
      {hasBody ? (
        <div className="plan-card-body px-4 pb-4">{children}</div>
      ) : null}
      {hasActions ? (
        <div className="card-actions flex flex-wrap gap-inset px-4 pb-4">
          {actions}
        </div>
      ) : null}
    </section>
  );
}

export function PlanResultNotice({ text }: { readonly text: string }) {
  if (!text) return null;
  if (text === "Plan creation discarded") {
    return (
      <article
        className="plan-result-note block rounded-ctl bg-surface-2 p-row"
        role="status"
      >
        <strong className="text-sm leading-5">Plan creation discarded</strong>
        <p className="m-0 mt-[calc(var(--inset)/2)] text-xs text-ink-2">
          No Plan was created. Your active Plan, Schedule, training
          restrictions, saved preferences, and chat history are unchanged.
        </p>
      </article>
    );
  }
  return (
    <div
      className="plan-result-note block rounded-ctl bg-surface-2 p-row"
      role="status"
    >
      <p className="m-0 text-xs text-ink-2">{text}</p>
    </div>
  );
}

export function PlanChoiceOption({
  marker,
  label,
  detail = "",
  className,
  ...props
}: Omit<ComponentProps<"button">, "children"> & {
  readonly marker: ReactNode;
  readonly label: string;
  readonly detail?: string;
}) {
  return (
    <button
      {...props}
      className={cn(
        "choice-option grid min-h-13 grid-cols-[var(--ctl-h-sm)_minmax(0,1fr)_20px] items-center gap-2 rounded-ctl border-0 bg-transparent px-2 py-1.5 text-left text-ink",
        className
      )}
      type="button"
    >
      <span
        className="choice-number grid size-ctl-sm place-items-center rounded-full border border-line-2 text-xs text-ink-2"
        aria-hidden="true"
      >
        {marker}
      </span>
      <span className="choice-copy block">
        <span className="choice-label block text-sm font-medium leading-5 text-ink">
          {label}
        </span>
        {detail ? (
          <span className="choice-detail mt-[calc(var(--inset)/2)] block text-sm leading-5 text-ink-2">
            {detail}
          </span>
        ) : null}
      </span>
      <span className="choice-arrow text-ink-2" aria-hidden="true">
        ›
      </span>
    </button>
  );
}
