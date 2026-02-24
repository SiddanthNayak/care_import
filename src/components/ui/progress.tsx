import type { HTMLAttributes } from "react";

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
}

export function Progress({ value, className = "", ...props }: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-gray-100 ${className}`}
      {...props}
    >
      <div
        className="h-full bg-blue-600 transition-all"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
