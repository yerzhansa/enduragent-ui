import { useRef, useState } from "react";
import {
  ArtifactCard,
  Button,
  EvidenceList,
  Disclosure,
  QuestionCard,
  QuestionOptions,
  QuestionOption,
  ComposerControls,
  ComposerInput,
  ComposerAction,
  CompactTrend,
  SelectableRideRow,
} from "@enduragent/ui";

export function PresentationProof() {
  const option = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const [answer, setAnswer] = useState("Not answered");
  const [message, setMessage] = useState("");
  const [replying, setReplying] = useState(false);
  const [sent, setSent] = useState("");
  const [selected, setSelected] = useState(false);
  return (
    <section aria-label="Packed presentation proof">
      <ArtifactCard
        data-testid="packed-artifact"
        title="Fictional Draft"
        eyebrow="Draft"
        summary="7 Sep 1998 · 8 weeks"
        status="Needs review"
      >
        <Disclosure summary="Inspect fictional evidence">
          <EvidenceList
            label="Fictional evidence"
            rows={[
              { id: "fictional-hours", label: "Weekly hours", source: "your answer", value: "6 h" },
            ]}
          />
        </Disclosure>
      </ArtifactCard>
      <Button onClick={() => option.current?.focus()}>Focus first choice</Button>
      <QuestionCard title="Choose a schedule" titleId="fictional-question" eyebrow="Plan creation">
        <QuestionOptions>
          <QuestionOption
            ref={option}
            marker="1"
            label="Fixed Schedule"
            description="Use the same weekdays"
            onClick={() => setAnswer("Fixed Schedule recorded")}
          />
          <QuestionOption
            marker="2"
            label="Unavailable choice"
            description="Answer the previous question first"
            disabled
          />
        </QuestionOptions>
      </QuestionCard>
      <output aria-label="Recorded choice">{answer}</output>
      <Button onClick={() => input.current?.focus()}>Focus message</Button>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSent(message);
          setReplying(true);
        }}
      >
        <ComposerControls
          data-testid="packed-composer"
          actions={
            <ComposerAction
              mode={replying ? "stop" : "send"}
              disabled={!replying && message.trim().length === 0}
              onClick={
                replying
                  ? () => {
                      setReplying(false);
                    }
                  : undefined
              }
            />
          }
        >
          <ComposerInput
            ref={input}
            aria-label="Fictional message"
            value={message}
            onChange={(event) => setMessage(event.currentTarget.value)}
          />
        </ComposerControls>
      </form>
      <output aria-label="Sent message">{sent}</output>
      <CompactTrend
        data-testid="packed-trend"
        title="Fictional weekly riding"
        period="27 Jul–6 Sep 1998"
        content={{
          kind: "ready",
          headings: ["Week", "Rides", "Time"],
          buckets: [
            {
              id: "fictional-first",
              label: "27 Jul",
              range: "27 Jul–2 Aug 1998",
              value: 120,
              count: "2 rides",
              formattedValue: "2 h",
            },
            {
              id: "fictional-second",
              label: "3 Aug",
              range: "3–9 Aug 1998",
              value: 180,
              count: "3 rides",
              formattedValue: "3 h",
            },
            {
              id: "fictional-third",
              label: "10 Aug",
              range: "10–16 Aug 1998",
              value: 240,
              count: "4 rides",
              formattedValue: "4 h",
            },
            {
              id: "fictional-fourth",
              label: "17 Aug",
              range: "17–23 Aug 1998",
              value: 180,
              count: "3 rides",
              formattedValue: "3 h",
            },
            {
              id: "fictional-fifth",
              label: "24 Aug",
              range: "24–30 Aug 1998",
              value: 120,
              count: "2 rides",
              formattedValue: "2 h",
            },
            {
              id: "fictional-sixth",
              label: "31 Aug",
              range: "31 Aug–6 Sep 1998",
              value: 180,
              count: "3 rides",
              formattedValue: "3 h",
            },
          ],
        }}
      />
      <CompactTrend
        data-testid="packed-short-trend"
        title="Fictional two-week riding"
        period="24 Aug–6 Sep 1998"
        content={{
          kind: "ready",
          headings: ["Week", "Rides", "Time"],
          buckets: [
            {
              id: "fictional-short-first",
              label: "24 Aug",
              range: "24–30 Aug 1998",
              value: 120,
              count: "2 rides",
              formattedValue: "2 h",
            },
            {
              id: "fictional-short-second",
              label: "31 Aug",
              range: "31 Aug–6 Sep 1998",
              value: 180,
              count: "3 rides",
              formattedValue: "3 h",
            },
          ],
        }}
      />
      <ul>
        <SelectableRideRow
          aria-label="Inspect fictional ride"
          aria-pressed={selected}
          date={{ iso: "1998-09-07", weekday: "Mon", day: "7" }}
          title="Fictional easy ride"
          meta="Cycling · 20 km"
          duration="45 min"
          load="Load 30"
          onClick={() => setSelected(!selected)}
        />
      </ul>
    </section>
  );
}
