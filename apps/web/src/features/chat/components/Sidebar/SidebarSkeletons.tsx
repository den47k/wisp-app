import type { CSSProperties } from "react";

const SKL_PINNED = [
  { name: "64%", last: "78%", time: 22 },
  { name: "52%", last: "88%", time: 20 },
];

const SKL_RECENT = [
  { name: "72%", last: "65%", time: 22 },
  { name: "56%", last: "82%", time: 18 },
  { name: "68%", last: "70%", time: 26 },
  { name: "46%", last: "92%", time: 22 },
  { name: "78%", last: "58%", time: 28 },
];

interface SklBarProps {
  w: number | string;
  h?: number;
  r?: number;
  delay?: number;
  style?: CSSProperties;
}

const SklBar = ({ w, h = 9, r = 5, delay = 0, style }: SklBarProps) => (
  <span
    className="wh-skl"
    style={{
      width: w,
      height: h,
      borderRadius: r,
      animationDelay: `${delay}ms`,
      ...style,
    }}
  />
);

interface SklRowProps {
  widths: { name: string; last: string; time: number };
  delay?: number;
}

const SklRow = ({ widths, delay = 0 }: SklRowProps) => (
  <div className="wh-convo wh-convo--skl" aria-hidden="true">
    <SklBar w={38} h={38} r={999} delay={delay} />
    <div className="wh-convo-body">
      <div className="wh-convo-top">
        <SklBar w={widths.name} h={10} delay={delay + 60} />
        <SklBar w={widths.time} h={8} delay={delay + 120} />
      </div>
      <div className="wh-convo-bot">
        <SklBar w={widths.last} h={9} delay={delay + 180} />
      </div>
    </div>
  </div>
);

export const SidebarSkeleton = () => (
  <div
    className="wh-sb-scroll wh-sb-scroll--skl"
    aria-busy="true"
    aria-label="Loading conversations"
  >
    <div className="wh-sb-section wh-sb-section--skl">
      <span className="wh-skl wh-skl--pin" />
      <SklBar w={36} h={8} r={3} delay={40} />
    </div>
    {SKL_PINNED.map((w, i) => (
      <SklRow key={`p${i}`} widths={w} delay={80 + i * 60} />
    ))}
    <div className="wh-sb-section wh-sb-section--skl">
      <SklBar w={44} h={8} r={3} delay={260} />
    </div>
    {SKL_RECENT.map((w, i) => (
      <SklRow key={`r${i}`} widths={w} delay={320 + i * 60} />
    ))}
  </div>
);

export const SidebarSearchSkeleton = () => (
  <div className="wh-search wh-search--skl" aria-hidden="true">
    <SklBar w={12} h={12} r={3} />
    <SklBar w={56} h={9} delay={80} />
    <SklBar w={22} h={12} r={4} delay={140} />
  </div>
);

export const SidebarMeSkeleton = () => (
  <div className="wh-me wh-me--skl" aria-hidden="true">
    <SklBar w={32} h={32} r={999} />
    <div className="wh-me-body">
      <SklBar w={92} h={9} delay={80} />
      <SklBar w={56} h={7} delay={140} style={{ marginTop: 6 }} />
    </div>
    <SklBar w={14} h={14} r={4} delay={200} />
  </div>
);
