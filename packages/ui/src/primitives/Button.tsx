import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

type Variant = "primary" | "ghost" | "danger";
type Size = "md" | "auto";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "wh-btn--primary",
  ghost: "wh-btn--ghost",
  danger: "wh-btn--danger",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export const Button = ({
  variant = "primary",
  size = "md",
  leading,
  trailing,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    className={cn("wh-btn", VARIANT_CLASS[variant], size === "auto" && "wh-btn--auto", className)}
    {...rest}
  >
    {leading}
    {children}
    {trailing}
  </button>
);
