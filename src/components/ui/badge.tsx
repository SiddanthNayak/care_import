import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "primary" | "secondary";
}

export function Badge({
  variant = "default",
  className = "",
  ...props
}: BadgeProps) {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    outline: "border border-gray-300 text-gray-700",
    primary: "bg-blue-600 text-white",
    secondary: "bg-gray-200 text-gray-800",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        variantClasses[variant]
      } ${className}`}
      {...props}
    />
  );
}
