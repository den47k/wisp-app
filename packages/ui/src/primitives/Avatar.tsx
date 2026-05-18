import { AVATAR_GRADIENTS, hashSeed, gradientCount } from "../tokens";
import { cn } from "../cn";

interface AvatarProps {
  name?: string;
  seed?: string | number;
  gradientIdx?: number;
  size?: number;
  online?: boolean;
  group?: boolean;
  className?: string;
}

const initialsFor = (name: string | undefined): string => {
  if (!name) return "·";
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const out = parts.map((s) => s[0] ?? "").join("").toUpperCase();
  return out || "·";
};

export const Avatar = ({
  name,
  seed,
  gradientIdx,
  size = 36,
  online = false,
  group = false,
  className,
}: AvatarProps) => {
  const idx = gradientIdx ?? hashSeed(seed ?? name) % gradientCount;
  const [c1, c2] = AVATAR_GRADIENTS[idx % gradientCount]!;

  return (
    <div className={cn("wh-avatar-box", className)} style={{ width: size, height: size }}>
      <div
        className="wh-avatar"
        style={{
          background: `linear-gradient(135deg, ${c1}, ${c2})`,
          width: size,
          height: size,
          fontSize: size * 0.38,
        }}
      >
        {group ? "◵" : initialsFor(name)}
      </div>
      {online && <span className="wh-avatar-online" />}
    </div>
  );
};
