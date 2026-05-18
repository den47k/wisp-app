interface AuroraProps {
  intensity?: number;
  hue1?: number;
  hue2?: number;
}

export const Aurora = ({ intensity = 0.35, hue1 = 250, hue2 = 290 }: AuroraProps) => {
  const baseOpacity = 0.3 + intensity * 0.5;
  return (
    <div className="wh-aurora" aria-hidden="true">
      <div
        className="wh-orb wh-orb--1"
        style={{
          background: `radial-gradient(circle, oklch(0.72 0.17 ${hue1} / ${baseOpacity}) 0%, transparent 70%)`,
        }}
      />
      <div
        className="wh-orb wh-orb--2"
        style={{
          background: `radial-gradient(circle, oklch(0.68 0.19 ${hue2} / ${baseOpacity}) 0%, transparent 70%)`,
        }}
      />
      <div
        className="wh-orb wh-orb--3"
        style={{
          background: `radial-gradient(circle, oklch(0.75 0.14 ${(hue1 + hue2) / 2} / ${baseOpacity * 0.7}) 0%, transparent 70%)`,
        }}
      />
      <div className="wh-grain" />
    </div>
  );
};
