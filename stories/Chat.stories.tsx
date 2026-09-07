import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FileText, Paperclip } from "lucide-react";
import { Button } from "../src/components/button.js";
import { ArtifactCard } from "../src/presentation/artifact.js";
import { EvidenceList, NoticeRow } from "../src/presentation/facts.js";
import {
  AttachmentList,
  AttachmentPreview,
  ChatTurn,
  ComposerAction,
  ComposerControls,
  ComposerInput,
  MessageContent,
  QueuedMessageList,
  QueuedMessageRow,
  ReplyActions,
} from "../src/presentation/chat.js";

const meta = {
  title: "Presentation/Chat",
  component: ChatTurn,
  args: { speaker: "coach", label: "Coach response" },
  parameters: { layout: "padded" },
} satisfies Meta<typeof ChatTurn>;
export default meta;
type Story = StoryObj<typeof meta>;

function Conversation({
  delivery = "complete",
  card = false,
}: {
  readonly delivery?: "complete" | "streaming" | "interrupted";
  readonly card?: boolean;
}) {
  const [notice, setNotice] = useState("");
  return (
    <div className="grid gap-7">
      <ChatTurn speaker="athlete" label="Your message">
        <MessageContent>How did my week go?</MessageContent>
      </ChatTurn>
      <ChatTurn
        speaker="coach"
        label="Coach response"
        data-delivery={delivery}
        aria-busy={delivery === "streaming"}
      >
        <MessageContent>
          <p>You rode three times in the week of 7 September 1998.</p>
          <h2>Recorded training</h2>
          <ul>
            <li>Two easy rides</li>
            <li>One longer ride</li>
          </ul>
          <p>
            Use <code>/review</code> to inspect the recorded rides.
          </p>
        </MessageContent>
        {card ? (
          <ArtifactCard title="This week's training" summary="Three rides · 3h 20m">
            <p className="m-0 text-sm text-ink-2">Recorded through 13 September 1998.</p>
          </ArtifactCard>
        ) : null}
        {delivery === "interrupted" ? (
          <NoticeRow tone="warning" title="Response interrupted">
            The partial answer is shown above.
          </NoticeRow>
        ) : null}
        {delivery === "streaming" ? (
          <p role="status" className="text-xs text-ink-2">
            Coach is responding…
          </p>
        ) : (
          <ReplyActions>
            <Button variant="ghost" size="xs" onClick={() => setNotice("Copied")}>
              Copy
            </Button>
            {card ? null : (
              <Button variant="ghost" size="xs" onClick={() => setNotice("Trying again…")}>
                Try again
              </Button>
            )}
          </ReplyActions>
        )}
      </ChatTurn>
      <span role="status" className="text-xs text-ink-2">
        {notice}
      </span>
    </div>
  );
}
export const Prose: Story = { render: () => <Conversation /> };
export const Card: Story = { render: () => <Conversation card /> };
export const Streaming: Story = { render: () => <Conversation delivery="streaming" /> };
export const Interrupted: Story = { render: () => <Conversation delivery="interrupted" /> };

function ComposerExample({
  initialStreaming = false,
  disabled = false,
}: {
  readonly initialStreaming?: boolean;
  readonly disabled?: boolean;
}) {
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(initialStreaming);
  const [status, setStatus] = useState("");
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setStatus(`Sent: ${text}`);
        setText("");
        setStreaming(true);
      }}
    >
      <label htmlFor="fictional-message" className="sr-only">
        Message your coach
      </label>
      <ComposerControls
        actions={
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Attach files"
              disabled={disabled}
              onClick={() => setStatus("Fictional attachment selected")}
            >
              <Paperclip aria-hidden="true" />
            </Button>
            <ComposerAction
              mode={streaming ? "stop" : "send"}
              disabled={disabled || (!streaming && text.trim().length === 0)}
              onClick={
                streaming
                  ? () => {
                      setStreaming(false);
                      setStatus("Response stopped");
                    }
                  : undefined
              }
            />
          </>
        }
      >
        <ComposerInput
          id="fictional-message"
          rows={2}
          value={text}
          disabled={disabled}
          placeholder={streaming ? "Coach is responding…" : "Message your coach"}
          onChange={(event) => setText(event.currentTarget.value)}
        />
      </ComposerControls>
      <p role="status" className="text-xs text-ink-2">
        {status}
      </p>
    </form>
  );
}
export const Composer: Story = { render: () => <ComposerExample /> };
export const ComposerStop: Story = { render: () => <ComposerExample initialStreaming /> };
export const ComposerDisabled: Story = { render: () => <ComposerExample disabled /> };

function AttachmentsExample() {
  const [removed, setRemoved] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  return (
    <AttachmentList aria-live="polite">
      {[
        {
          id: "ready",
          title: "Ride notes.txt",
          detail: "TXT · 2 KB",
          notice: "Stored locally",
          copy: "Ready to include with your message.",
        },
        {
          id: "processing",
          title: "Easy ride.fit",
          detail: "FIT · 24 KB · processing locally",
          notice: "Processing locally",
          copy: "The file is being checked.",
        },
        {
          id: "blocked",
          title: "Training diary.pdf",
          detail: "PDF · 54 KB",
          notice: "This PDF is password protected",
          copy: "Choose an unlocked PDF; the current draft is preserved.",
        },
        {
          id: "failed",
          title: "Weekend ride.tcx",
          detail: "TCX · 18 KB",
          notice: "This file couldn’t be prepared",
          copy: "Your message draft is safe.",
        },
      ]
        .filter((item) => !removed.includes(item.id))
        .map((item) => (
          <AttachmentPreview
            key={item.id}
            aria-label={`${item.title} attachment`}
            title={item.title}
            detail={item.detail}
            icon={<FileText className="size-5 shrink-0 text-ink-2" aria-hidden="true" />}
            actions={
              <Button variant="ghost" size="sm" onClick={() => setRemoved([...removed, item.id])}>
                Remove
              </Button>
            }
          >
            <NoticeRow
              tone={item.id === "blocked" || item.id === "failed" ? "warning" : "neutral"}
              title={item.notice}
              action={
                item.id === "failed" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStatus("Retrying Weekend ride.tcx")}
                  >
                    Try again
                  </Button>
                ) : undefined
              }
            >
              {item.copy}
            </NoticeRow>
          </AttachmentPreview>
        ))}
      <span role="status" className="text-xs text-ink-2">
        {status}
      </span>
    </AttachmentList>
  );
}
export const Attachments: Story = { render: () => <AttachmentsExample /> };
function QueueExample() {
  const [queued, setQueued] = useState(["How should I approach tomorrow?", "/review"]);
  const [status, setStatus] = useState("");
  return (
    <>
      <QueuedMessageList
        title="Queued messages"
        count={queued.length}
        announcement={`${queued.length} queued messages`}
        aria-label="Queued messages"
      >
        {queued.map((text, index) => (
          <QueuedMessageRow
            key={text}
            command={text.startsWith("/")}
            actions={
              <>
                {text.startsWith("/") ? (
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => setStatus("Command selected")}
                  >
                    Run command
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="xs"
                  aria-label={`Remove queued message ${index + 1}`}
                  onClick={() => setQueued(queued.filter((item) => item !== text))}
                >
                  Remove
                </Button>
              </>
            }
          >
            {text}
          </QueuedMessageRow>
        ))}
      </QueuedMessageList>
      <span role="status" className="text-xs text-ink-2">
        {status}
      </span>
    </>
  );
}
export const Queue: Story = { render: () => <QueueExample /> };

function AttachmentTypesExample() {
  const [selected, setSelected] = useState("easy");
  const [status, setStatus] = useState("");
  return (
    <AttachmentList aria-live="polite">
      <AttachmentPreview
        title="Morning ride.fit"
        detail="FIT · 24 KB"
        aria-label="Activity attachment"
      >
        <EvidenceList
          label="Recorded activity"
          rows={[
            { id: "date", label: "Date", value: "7 September 1998" },
            { id: "duration", label: "Duration", value: "45 min" },
            { id: "distance", label: "Distance", value: "18.4 km" },
          ]}
        />
        <NoticeRow title="Will add to Training when sent">
          Send confirms the import; Plan and Calendar stay unchanged.
        </NoticeRow>
      </AttachmentPreview>
      <AttachmentPreview
        title="Week workouts.zwo"
        detail="ZWO · 3 KB"
        aria-label="Workout attachment"
      >
        <fieldset className="m-0 grid gap-inset border-0 border-t border-line p-4">
          <legend className="text-xs text-ink-2">Select a workout</legend>
          {[
            { id: "easy", title: "Easy ride", detail: "45 min · Endurance" },
            { id: "steady", title: "Steady ride", detail: "60 min · Tempo" },
          ].map((workout) => (
            <Button
              key={workout.id}
              variant={selected === workout.id ? "secondary" : "ghost"}
              aria-pressed={selected === workout.id}
              onClick={() => setSelected(workout.id)}
            >
              {workout.title} · {workout.detail}
            </Button>
          ))}
        </fieldset>
        <NoticeRow
          title={selected === "easy" ? "Easy ride selected" : "Steady ride selected"}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatus("Opening selected Workout in Plan")}
            >
              Review in Plan
            </Button>
          }
        >
          Send asks Coach to analyze it, or review it in Plan now.
        </NoticeRow>
      </AttachmentPreview>
      <AttachmentPreview
        title="Training notes.png"
        detail="PNG · 42 KB"
        aria-label="Available image attachment"
      >
        <NoticeRow title="Image input available">
          The configured model can view this image (640 × 480).
        </NoticeRow>
      </AttachmentPreview>
      <AttachmentPreview
        title="Route map.webp"
        detail="WEBP · 22 KB"
        aria-label="Unavailable image attachment"
      >
        <NoticeRow
          tone="warning"
          title="This model can’t view this file"
          action={
            <Button variant="outline" size="sm" onClick={() => setStatus("Opening Settings")}>
              Open Settings
            </Button>
          }
        >
          Remove it or choose a compatible model in Settings.
        </NoticeRow>
      </AttachmentPreview>
      <AttachmentPreview
        title="Training archive.zip"
        detail="Unknown format"
        aria-label="Unsupported attachment"
      >
        <NoticeRow
          tone="warning"
          title="This file type isn’t supported"
          action={
            <Button variant="outline" size="sm" onClick={() => setStatus("Choosing another file")}>
              Choose another file
            </Button>
          }
        >
          Try FIT, TCX, GPX, ZWO, ERG, MRC, PDF, TXT, CSV, DOCX, PNG, JPG, or WEBP.
        </NoticeRow>
      </AttachmentPreview>
      <span role="status" className="text-xs text-ink-2">
        {status}
      </span>
    </AttachmentList>
  );
}
export const AttachmentTypes: Story = { render: () => <AttachmentTypesExample /> };

function QueueRecoveryExample() {
  const [retrying, setRetrying] = useState(false);
  const [removed, setRemoved] = useState(false);
  const error = "Could not remove this queued message. Try again.";
  if (removed)
    return (
      <p role="status" className="text-xs text-ink-2">
        Queued message removed
      </p>
    );
  return (
    <QueuedMessageList
      title="Queued messages"
      count={1}
      announcement="1 queued message"
      aria-label="Interrupted queued messages"
      notice={
        <div className="grid gap-inset border-t border-line px-ctl-px py-inset">
          <Button
            variant="secondary"
            size="xs"
            disabled={retrying}
            onClick={() => setRetrying(true)}
          >
            {retrying ? "Retrying interrupted message…" : "Retry interrupted message"}
          </Button>
          <p role="status" className="m-0 text-xs text-danger">
            {error}
          </p>
        </div>
      }
    >
      <QueuedMessageRow
        actions={
          <Button variant="ghost" size="xs" disabled={retrying} onClick={() => setRemoved(true)}>
            Remove
          </Button>
        }
      >
        Review my ride from 7 September 1998.
      </QueuedMessageRow>
    </QueuedMessageList>
  );
}
export const QueueRecovery: Story = { render: () => <QueueRecoveryExample /> };
