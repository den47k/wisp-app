const THREAD_SKL = [
  { side: "them", w: 168, h: 36 },
  { side: "them", w: 232, h: 52 },
  { side: "me", w: 196, h: 36 },
  { side: "me", w: 132, h: 36 },
  { side: "them", w: 276, h: 52 },
  { side: "me", w: 152, h: 36 },
] as const;

export const ChatThreadSkeleton = () => (
  <div
    className="wh-chat-scroll wh-chat-scroll--skl"
    aria-busy="true"
    aria-label="Loading messages"
  >
    <div className="wh-day-sep wh-day-sep--skl">
      <span className="wh-skl" style={{ width: 48, height: 9, borderRadius: 4 }} />
    </div>
    {THREAD_SKL.map((r, i) => (
      <div
        key={i}
        className={"wh-msg " + (r.side === "me" ? "wh-msg--me" : "wh-msg--them")}
        aria-hidden="true"
      >
        {r.side === "them" && (
          <div className="wh-msg-avatar">
            <span
              className="wh-skl"
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                display: "block",
                animationDelay: `${i * 80}ms`,
              }}
            />
          </div>
        )}
        <div className="wh-msg-col">
          <span
            className="wh-skl wh-skl--bubble"
            style={{
              width: r.w,
              height: r.h,
              animationDelay: `${i * 80 + 60}ms`,
            }}
          />
        </div>
      </div>
    ))}
  </div>
);
