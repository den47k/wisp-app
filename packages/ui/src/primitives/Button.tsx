import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

type Variant = "primary" | "ghost";

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
    className={cn("wh-btn", variant === "primary" ? "wh-btn--primary" : "wh-btn--ghost", className)}
    {...rest}
  >
    {leading}
    {children}
    {trailing}
  </button>
);
