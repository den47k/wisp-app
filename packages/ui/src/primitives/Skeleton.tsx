import type { CSSProperties } from "react";
import { cn } from "../cn";

interface SkeletonProps {
  width: number | string;
  height?: number | string;
  radius?: number;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

export const Skeleton = ({
  width,
  height = 9,
  radius = 5,
  delay = 0,
  className,
  style,
}: SkeletonProps) => (
  <span
    className={cn("wh-skl", className)}
    style={{
      width,
      height,
      borderRadius: radius,
      animationDelay: delay ? `${delay}ms` : undefined,
      ...style,
    }}
    aria-hidden="true"
  />
);
