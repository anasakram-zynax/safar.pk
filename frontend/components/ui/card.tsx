import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-border bg-surface p-6 shadow-[0_16px_48px_-36px_rgba(23,43,66,.38)] sm:p-7",
        className,
      )}
      {...props}
    />
  );
}
