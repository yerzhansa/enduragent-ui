import type { ComponentProps, ReactNode } from "react";
import { ChevronRight, LoaderCircle } from "lucide-react";
import { cn } from "../cn.js";

export function QuestionCard({
  title,
  titleId,
  eyebrow,
  actions,
  children,
  className,
  ...props
}: Omit<ComponentProps<"section">, "title"> & {
  readonly title: ReactNode;
  readonly titleId: string;
  readonly eyebrow: ReactNode;
  readonly actions?: ReactNode;
}) {
  return (
    <section
      aria-labelledby={titleId}
      {...props}
      className={cn(
        "overflow-hidden rounded-card border border-line bg-surface shadow-elev-2",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-inset border-b border-line px-4 pt-4 pb-2">
        <div className="grid gap-[calc(var(--inset)/2)]">
          <p className="m-0 text-xs font-semibold leading-4 text-ink-2">{eyebrow}</p>
          <h2 id={titleId} className="m-0 text-sm font-medium leading-5">
            {title}
          </h2>
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}

export function QuestionOptions({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={cn("grid gap-1 p-2", className)} />;
}

export function QuestionOption({
  marker,
  label,
  description,
  annotation,
  className,
  ...props
}: Omit<ComponentProps<"button">, "children"> & {
  readonly marker: ReactNode;
  readonly label: ReactNode;
  readonly description: ReactNode;
  readonly annotation?: ReactNode;
}) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "grid min-h-[calc(var(--ctl-h-lg)+var(--row-inset))] w-full grid-cols-[var(--ctl-h-sm)_minmax(0,1fr)_auto] items-center gap-2 rounded-ctl border-0 bg-transparent px-2 py-1.5 text-left text-ink hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-64 disabled:cursor-default",
        className,
      )}
    >
      <span className="grid size-8 place-items-center rounded-full border border-line-2 text-xs leading-4 text-ink-2">
        {marker}
      </span>
      <span className="block min-w-0">
        <span className="flex flex-wrap items-center gap-1.5 text-sm font-medium leading-5">
          {label}
          {annotation === undefined ? null : (
            <span className="rounded-full bg-ink/7 px-1.5 py-0.5 text-xs font-medium leading-4 text-ink-2">
              {annotation}
            </span>
          )}
        </span>
        <span className="mt-[calc(var(--inset)/2)] block text-sm leading-5 text-ink-2">
          {description}
        </span>
      </span>
      <ChevronRight className="size-4 text-ink-2" aria-hidden="true" />
    </button>
  );
}

export function QuestionEditor({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={cn("grid gap-inset px-4 py-4", className)} />;
}

export function QuestionInput({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-[calc(var(--ctl-h-lg)+var(--inset))] resize-y rounded-ctl border border-line-2 bg-sunk px-3 py-2 text-sm leading-5 text-ink outline-none focus:border-ring focus:ring-3 focus:ring-ring/20",
        className,
      )}
    />
  );
}

export function RecordedAnswer({
  title,
  children,
  actions,
  busy = false,
  className,
  ...props
}: Omit<ComponentProps<"section">, "title"> & {
  readonly title: ReactNode;
  readonly actions?: ReactNode;
  readonly busy?: boolean;
}) {
  return (
    <section
      {...props}
      aria-busy={busy || undefined}
      className={cn(
        "grid gap-inset rounded-card border border-line bg-surface p-4 shadow-elev-2",
        className,
      )}
    >
      <div className="flex items-start gap-row">
        {busy ? (
          <LoaderCircle
            className="size-4 shrink-0 animate-spin text-ink-2 motion-reduce:animate-none"
            aria-hidden="true"
          />
        ) : null}
        <div className="grid min-w-0 gap-[calc(var(--inset)/2)]">
          <strong className="text-sm font-medium leading-5">{title}</strong>
          <div className="text-xs leading-4 text-ink-2">{children}</div>
        </div>
      </div>
      {actions === undefined ? null : <div className="flex justify-end gap-inset">{actions}</div>}
    </section>
  );
}
