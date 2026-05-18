import type { ReactNode } from "react";
import { cn } from "../cn";

interface Option<T extends string> {
  value: T;
  label: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<Option<T>>;
  className?: string;
}

export const SegmentedControl = <T extends string>({
  value,
  onChange,
  options,
  className,
}: SegmentedControlProps<T>) => {
  const idx = options.findIndex((o) => o.value === value);
  return (
    <div className={cn("wh-seg", className)}>
      <span
        className="wh-seg-thumb"
        style={{ left: `calc(${(idx / options.length) * 100}% + 4px)` }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={o.value === value ? "wh-seg-on" : ""}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
};
