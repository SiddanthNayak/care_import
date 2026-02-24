import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  size?: "default" | "sm";
}

export function Button({
  variant = "default",
  size = "default",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
  const variantClasses =
    variant === "outline"
      ? "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
      : "bg-blue-600 text-white hover:bg-blue-700";
  const sizeClasses = size === "sm" ? "h-8 px-3" : "h-9 px-4";

  return (
    <button
      className={`${base} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    />
  );
}
