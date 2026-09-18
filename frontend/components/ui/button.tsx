import type { ComponentPropsWithRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";
export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: Variant;
  size?: Size;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-[0_6px_18px_-8px_rgba(53,123,213,.7)] hover:bg-primary-hover hover:shadow-[0_10px_24px_-8px_rgba(53,123,213,.55)]",
  secondary: "bg-primary-light text-primary-hover hover:bg-[#dbeeff]",
  outline:
    "border border-border bg-surface text-foreground hover:border-primary/50 hover:bg-primary-light/40",
  ghost: "text-primary-hover hover:bg-primary-light",
};
const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3.5 text-sm",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-base",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transform-none",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  );
}
