import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

interface LinkButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: "default" | "danger";
  leading?: ReactNode;
}

export const LinkButton = ({
  tone = "default",
  leading,
  className,
  children,
  type = "button",
  ...rest
}: LinkButtonProps) => (
  <button
    type={type}
    className={cn("wh-link-btn", tone === "danger" && "wh-link-btn--danger", className)}
    {...rest}
  >
    {leading}
    {children}
  </button>
);
