import type { ButtonHTMLAttributes } from "react";
import { cn } from "../cn";
import { Icon, type IconName } from "../icons";

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  icon: IconName;
  size?: number;
  label: string;
}

export const IconButton = ({ icon, size = 16, label, className, type = "button", ...rest }: IconButtonProps) => (
  <button type={type} title={label} aria-label={label} className={cn("wh-icon-btn", className)} {...rest}>
    <Icon name={icon} size={size} />
  </button>
);
