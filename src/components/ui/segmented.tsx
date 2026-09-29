import { cn } from "@/lib/utils";

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div className="segmented" role="tablist" aria-label={ariaLabel}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn("segmented-item", active && "is-active")}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function Stepper({
  value,
  min,
  max,
  onChange,
  suffix,
  ariaLabel,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  suffix: string;
  ariaLabel: string;
}) {
  return (
    <div className="stepper" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        className="stepper-btn"
        aria-label="Decrease"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
          <path d="M3.5 8h9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      <span className="stepper-value tabular-nums">
        {value} {suffix}
      </span>
      <button
        type="button"
        className="stepper-btn"
        aria-label="Increase"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
          <path d="M3.5 8h9M8 3.5v9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
