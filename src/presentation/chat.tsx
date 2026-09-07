import type { ComponentProps, ReactNode } from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "../cn.js";
import { Button } from "../components/button.js";

export function ChatTurn({
  speaker,
  label,
  className,
  children,
  ...props
}: ComponentProps<"article"> & { readonly speaker: "athlete" | "coach"; readonly label: string }) {
  return (
    <article
      {...props}
      className={cn(
        "chat-message grid min-w-0 data-[delivery=interrupted]:text-ink-2",
        speaker === "coach"
          ? "chat-message--coach max-w-full justify-self-start text-sm leading-5"
          : "chat-message--athlete max-w-[76%] justify-self-end rounded-card rounded-br-ctl border border-line bg-surface px-4 py-3",
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      {children}
    </article>
  );
}

export function MessageContent({
  command = false,
  className,
  ...props
}: ComponentProps<"div"> & { readonly command?: boolean }) {
  return (
    <div
      {...props}
      className={cn(
        "chat-message__text m-0 min-w-0 whitespace-pre-wrap text-sm leading-5 wrap-anywhere [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_pre]:my-2 [&_h1]:mt-3 [&_h1]:mb-1 [&_h1]:text-xl [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-lg [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-base [&_h4]:mt-3 [&_h4]:mb-1 [&_h4]:text-base [&_h5]:mt-3 [&_h5]:mb-1 [&_h5]:text-base [&_h6]:mt-3 [&_h6]:mb-1 [&_h6]:text-base [&_ul]:ps-6 [&_ol]:ps-6 [&_li+li]:mt-1 [&_code]:rounded-chip [&_code]:bg-ink/9 [&_code]:px-1 [&_code]:text-xs [&_code]:font-mono [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_pre]:rounded-ctl [&_pre]:border [&_pre]:border-line [&_pre]:bg-sunk [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:whitespace-pre [&_pre_code]:wrap-normal [&_a]:font-semibold [&_a]:text-inherit [&_a]:underline-offset-2 [&_.chat-markdown\\_\\_table-scroll]:my-2 [&_.chat-markdown\\_\\_table-scroll]:max-w-full [&_.chat-markdown\\_\\_table-scroll]:overflow-x-auto [&_table]:min-w-full [&_table]:border-collapse [&_table]:text-xs [&_th]:border [&_th]:border-line [&_th]:px-2 [&_th]:py-1 [&_th]:text-start [&_th]:align-top [&_th]:font-medium [&_th]:whitespace-nowrap [&_th]:text-ink-2 [&_td]:border [&_td]:border-line [&_td]:px-2 [&_td]:py-1 [&_td]:text-start [&_td]:align-top [&_td]:whitespace-nowrap",
        command && "chat-message__command font-medium tracking-normal",
        className,
      )}
    />
  );
}

export function ReplyActions({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn("mt-inset flex flex-wrap items-center gap-inset text-ink-2", className)}
    />
  );
}

export function ComposerControls({
  children,
  actions,
  className,
  ...props
}: ComponentProps<"div"> & { readonly actions: ReactNode }) {
  return (
    <div
      {...props}
      className={cn(
        "chat-composer__controls grid grid-rows-[minmax(var(--ctl-h-lg),auto)_var(--ctl-h-lg)] gap-[calc(var(--inset)/2)] rounded-card border border-line-2 bg-surface pt-row pr-ctl-px pb-row pl-[calc(var(--inset)*2)] shadow-elev-2 transition-[border-color,box-shadow] duration-120 motion-reduce:transition-none focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20",
        className,
      )}
    >
      {children}
      <div className="chat-composer__toolbar flex items-center justify-between gap-inset [&>:only-child]:ml-auto">
        {actions}
      </div>
    </div>
  );
}

export function ComposerInput({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-10 max-h-[140px] w-full resize-none border-0 bg-transparent py-[3px] text-sm text-ink outline-0 placeholder:text-ink-3 focus-visible:outline-0",
        className,
      )}
    />
  );
}

export function ComposerAction({
  mode,
  onClick,
  ...props
}: Omit<ComponentProps<typeof Button>, "children" | "size" | "variant"> & {
  readonly mode: "send" | "stop";
}) {
  return (
    <Button
      type={mode === "send" ? "submit" : "button"}
      aria-label={mode === "send" ? "Send message" : "Stop responding"}
      {...props}
      onClick={(event) => {
        if (mode === "stop") event.preventDefault();
        onClick?.(event);
      }}
      variant="default"
      size="icon-lg"
    >
      {mode === "send" ? (
        <ArrowUp aria-hidden="true" />
      ) : (
        <Square className="size-2.5 fill-current stroke-none" aria-hidden="true" />
      )}
    </Button>
  );
}

export function AttachmentPreview({
  title,
  detail,
  icon,
  actions,
  children,
  className,
  ...props
}: Omit<ComponentProps<"section">, "title"> & {
  readonly title: ReactNode;
  readonly detail: ReactNode;
  readonly icon?: ReactNode;
  readonly actions?: ReactNode;
}) {
  return (
    <section
      {...props}
      className={cn(
        "overflow-hidden rounded-card border border-line-2 bg-surface shadow-elev-2",
        className,
      )}
    >
      <div className="flex min-h-14 min-w-0 items-center gap-3 px-4 py-2">
        {icon}
        <div className="min-w-0 flex-1">
          <strong className="block truncate text-sm font-medium">{title}</strong>
          <small className="mt-1 block text-xs text-ink-2">{detail}</small>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function AttachmentList({ className, ...props }: ComponentProps<"div">) {
  return <div {...props} className={cn("mb-2.5 grid gap-2.5", className)} />;
}

export function QueuedMessageList({
  title,
  count,
  announcement,
  children,
  notice,
  className,
  ...props
}: Omit<ComponentProps<"section">, "title"> & {
  readonly title: ReactNode;
  readonly count: ReactNode;
  readonly announcement: string;
  readonly notice?: ReactNode;
}) {
  return (
    <section
      {...props}
      className={cn(
        "chat-queue mb-inset min-w-0 overflow-hidden rounded-card border border-line bg-surface shadow-elev-2",
        className,
      )}
    >
      <div className="flex min-h-ctl items-center justify-between gap-inset px-ctl-px">
        <h2 className="m-0 text-xs font-semibold text-ink">{title}</h2>
        <span className="rounded-chip bg-sunk px-inset text-xs text-ink-2" aria-hidden="true">
          {count}
        </span>
        <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {announcement}
        </span>
      </div>
      {notice}
      <ul className="m-0 flex list-none flex-col border-t border-line p-0" role="list">
        {children}
      </ul>
    </section>
  );
}

export function QueuedMessageRow({
  children,
  actions,
  command = false,
  className,
  ...props
}: ComponentProps<"li"> & { readonly actions: ReactNode; readonly command?: boolean }) {
  return (
    <li
      {...props}
      className={cn(
        "chat-queue__item flex min-h-ctl min-w-0 flex-wrap items-center gap-inset border-b border-line px-ctl-px py-inset last:border-b-0",
        className,
      )}
    >
      <span
        className={cn(
          "chat-queue__text min-w-0 flex-1 basis-48 whitespace-pre-wrap break-words text-sm text-ink-2",
          command && "chat-queue__command font-medium",
        )}
      >
        {children}
      </span>
      <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-inset">
        {actions}
      </div>
    </li>
  );
}
