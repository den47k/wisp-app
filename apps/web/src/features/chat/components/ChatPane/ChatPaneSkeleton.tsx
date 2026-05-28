import { Skeleton } from "@chat/ui";

const THREAD = [
  { side: "them", w: 168, h: 36 },
  { side: "them", w: 232, h: 52 },
  { side: "me", w: 196, h: 36 },
  { side: "me", w: 132, h: 36 },
  { side: "them", w: 276, h: 52 },
  { side: "me", w: 152, h: 36 },
] as const;

export const ChatPaneSkeleton = () => (
  <div
    className="wh-chat-scroll wh-chat-scroll--skl"
    aria-busy="true"
    aria-label="Loading messages"
  >
    <div className="wh-day-sep wh-day-sep--skl">
      <Skeleton width={48} height={9} radius={4} />
    </div>
    {THREAD.map((r, i) => (
      <div
        key={i}
        className={"wh-msg " + (r.side === "me" ? "wh-msg--me" : "wh-msg--them")}
        aria-hidden="true"
      >
        {r.side === "them" && (
          <div className="wh-msg-avatar">
            <Skeleton
              width={28}
              height={28}
              radius={999}
              delay={i * 80}
              style={{ display: "block" }}
            />
          </div>
        )}
        <div className="wh-msg-col">
          <Skeleton className="wh-skl--bubble" width={r.w} height={r.h} delay={i * 80 + 60} />
        </div>
      </div>
    ))}
  </div>
);
