import { createRef, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { flushSync } from "react-dom";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../src/components/button.js";
import {
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

describe("Chat presentation", () => {
  it("preserves streaming hosts and caller delivery attributes", () => {
    const host = createRef<HTMLDivElement>();
    const { rerender } = render(
      <ChatTurn
        speaker="coach"
        label="Coach response"
        data-message-id="fictional-turn"
        data-delivery="streaming"
        aria-busy="true"
      >
        <MessageContent ref={host} />
      </ChatTurn>,
    );
    const node = host.current;
    expect(node).not.toBeNull();
    node?.append(document.createTextNode("Three rides recorded."));
    rerender(
      <ChatTurn
        speaker="coach"
        label="Coach response"
        data-message-id="fictional-turn"
        data-delivery="complete"
      >
        <MessageContent ref={host} />
      </ChatTurn>,
    );
    expect(host.current).toBe(node);
    expect(screen.getByText("Three rides recorded.")).toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveAttribute("data-message-id", "fictional-turn");
  });
  it("leaves input, submission and stop callbacks with the caller", () => {
    const submitted = vi.fn((event: React.FormEvent) => event.preventDefault());
    const stopped = vi.fn();
    const changed = vi.fn();
    const input = createRef<HTMLTextAreaElement>();
    const { rerender } = render(
      <form onSubmit={submitted}>
        <ComposerControls actions={<ComposerAction mode="send" />}>
          <ComposerInput ref={input} aria-label="Message your coach" onChange={changed} />
        </ComposerControls>
      </form>,
    );
    input.current?.focus();
    expect(screen.getByRole("textbox")).toHaveFocus();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "A short ride" } });
    expect(changed).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(submitted).toHaveBeenCalledOnce();
    rerender(
      <form onSubmit={submitted}>
        <ComposerControls actions={<ComposerAction mode="stop" onClick={stopped} />}>
          <ComposerInput aria-label="Message your coach" />
        </ComposerControls>
      </form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Stop responding" }));
    expect(stopped).toHaveBeenCalledOnce();
    expect(submitted).toHaveBeenCalledOnce();
  });
  it("does not submit when stopping synchronously changes the action to send", () => {
    const submitted = vi.fn((event: React.FormEvent) => event.preventDefault());
    const stopped = vi.fn();
    function SynchronousStop() {
      const [replying, setReplying] = useState(true);
      return (
        <form onSubmit={submitted}>
          <ComposerAction
            mode={replying ? "stop" : "send"}
            onClick={() => {
              stopped();
              flushSync(() => setReplying(false));
            }}
          />
        </form>
      );
    }
    render(<SynchronousStop />);
    fireEvent.click(screen.getByRole("button", { name: "Stop responding" }));
    expect(stopped).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Send message" })).toHaveAttribute("type", "submit");
    expect(submitted).not.toHaveBeenCalled();
  });
  it("keeps attachment and queue action order and callbacks", () => {
    const removed = vi.fn();
    const retried = vi.fn();
    render(
      <>
        <AttachmentPreview
          title="Notes.txt"
          detail="TXT · 2 KB"
          aria-label="Notes attachment"
          actions={<Button onClick={removed}>Remove attachment</Button>}
        >
          Ready to send
        </AttachmentPreview>
        <QueuedMessageList title="Queued messages" count={1} announcement="1 queued message">
          <QueuedMessageRow actions={<Button onClick={removed}>Remove queued message</Button>}>
            What comes next?
          </QueuedMessageRow>
        </QueuedMessageList>
        <ReplyActions>
          <Button onClick={retried}>Try again</Button>
        </ReplyActions>
      </>,
    );
    expect(screen.getByRole("region", { name: "Notes attachment" })).toHaveTextContent(
      "Ready to send",
    );
    expect(screen.getByRole("listitem")).toHaveTextContent("What comes next?");
    expect(screen.getByRole("status")).toHaveTextContent("1 queued message");
    fireEvent.click(screen.getByRole("button", { name: "Remove attachment" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove queued message" }));
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(removed).toHaveBeenCalledTimes(2);
    expect(retried).toHaveBeenCalledOnce();
  });
});
