import { cn } from "../cn";

interface ToggleProps {
  on: boolean;
  onChange: (on: boolean) => void;
  label?: string;
  className?: string;
}

export const Toggle = ({ on, onChange, label, className }: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    className={cn("wh-mini-toggle", on && "wh-mini-toggle--on", className)}
    onClick={() => onChange(!on)}
  >
    <span />
  </button>
);
