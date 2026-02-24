import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
      {...props}
    />
  );
}

export function CardHeader({ className = "", ...props }: CardProps) {
  return <div className={`p-6 ${className}`} {...props} />;
}

export function CardTitle({ className = "", ...props }: CardProps) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props} />
  );
}

export function CardDescription({ className = "", ...props }: CardProps) {
  return (
    <p className={`text-sm text-gray-600 ${className}`} {...props} />
  );
}

export function CardContent({ className = "", ...props }: CardProps) {
  return <div className={`p-6 pt-0 ${className}`} {...props} />;
}
