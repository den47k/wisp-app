import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

type Variant = "primary" | "ghost" | "danger";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "wh-btn--primary",
  ghost: "wh-btn--ghost",
  danger: "wh-btn--danger",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export const Button = ({
  variant = "primary",
  leading,
  trailing,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    className={cn("wh-btn", VARIANT_CLASS[variant], className)}
    {...rest}
  >
    {leading}
    {children}
    {trailing}
  </button>
);
