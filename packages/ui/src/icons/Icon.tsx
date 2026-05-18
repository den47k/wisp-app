import { ICON_PATHS, type IconName } from "./icons";

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  className?: string;
  fill?: string;
}

export const Icon = ({
  name,
  size = 18,
  stroke = 1.5,
  className,
  fill = "none",
}: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {ICON_PATHS[name]}
  </svg>
);
