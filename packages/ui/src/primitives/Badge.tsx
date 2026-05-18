import type { ReactNode } from "react";
import { cn } from "../cn";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export const Badge = ({ children, className }: BadgeProps) => (
  <span className={cn("wh-convo-badge", className)}>{children}</span>
);
