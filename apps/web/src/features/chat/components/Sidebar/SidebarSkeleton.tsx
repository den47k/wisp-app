import { Skeleton } from "@chat/ui";

const PINNED = [
  { name: "64%", last: "78%", time: 22 },
  { name: "52%", last: "88%", time: 20 },
];

const RECENT = [
  { name: "72%", last: "65%", time: 22 },
  { name: "56%", last: "82%", time: 18 },
  { name: "68%", last: "70%", time: 26 },
  { name: "46%", last: "92%", time: 22 },
  { name: "78%", last: "58%", time: 28 },
];

interface RowProps {
  widths: { name: string; last: string; time: number };
  delay?: number;
}

const ConvoRow = ({ widths, delay = 0 }: RowProps) => (
  <div className="wh-convo wh-convo--skl" aria-hidden="true">
    <Skeleton width={38} height={38} radius={999} delay={delay} />
    <div className="wh-convo-body">
      <div className="wh-convo-top">
        <Skeleton width={widths.name} height={10} delay={delay + 60} />
        <Skeleton width={widths.time} height={8} delay={delay + 120} />
      </div>
      <div className="wh-convo-bot">
        <Skeleton width={widths.last} delay={delay + 180} />
      </div>
    </div>
  </div>
);

const Search = () => (
  <div className="wh-search wh-search--skl" aria-hidden="true">
    <Skeleton width={12} height={12} radius={3} />
    <Skeleton width={56} delay={80} />
    <Skeleton width={22} height={12} radius={4} delay={140} />
  </div>
);

const ConvoList = () => (
  <div
    className="wh-sb-scroll wh-sb-scroll--skl"
    aria-busy="true"
    aria-label="Loading conversations"
  >
    <div className="wh-sb-section wh-sb-section--skl">
      <span className="wh-skl wh-skl--pin" />
      <Skeleton width={36} height={8} radius={3} delay={40} />
    </div>
    {PINNED.map((w, i) => (
      <ConvoRow key={`p${i}`} widths={w} delay={80 + i * 60} />
    ))}
    <div className="wh-sb-section wh-sb-section--skl">
      <Skeleton width={44} height={8} radius={3} delay={260} />
    </div>
    {RECENT.map((w, i) => (
      <ConvoRow key={`r${i}`} widths={w} delay={320 + i * 60} />
    ))}
  </div>
);

const Me = () => (
  <div className="wh-me wh-me--skl" aria-hidden="true">
    <Skeleton width={32} height={32} radius={999} />
    <div className="wh-me-body">
      <Skeleton width={92} delay={80} />
      <Skeleton width={56} height={7} delay={140} style={{ marginTop: 6 }} />
    </div>
    <Skeleton width={14} height={14} radius={4} delay={200} />
  </div>
);

export const SidebarSkeleton = { Search, ConvoList, Me };
