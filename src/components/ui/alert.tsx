import type { HTMLAttributes } from "react";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
}

export function Alert({
  variant = "default",
  className = "",
  ...props
}: AlertProps) {
  const variantClasses =
    variant === "destructive"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-gray-200 bg-white text-gray-700";

  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${variantClasses} ${className}`}
      {...props}
    />
  );
}

export function AlertDescription({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`text-sm ${className}`} {...props} />;
}
