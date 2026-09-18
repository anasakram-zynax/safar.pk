import Link from "next/link";
import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Safar.pk home"
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-2.5 rounded-md text-foreground transition-colors hover:text-primary-hover",
        className,
      )}
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary-light text-primary-hover">
        <Compass size={20} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span className="text-lg font-semibold tracking-[-0.035em]">
        Safar<span className="text-primary">.</span>pk
      </span>
    </Link>
  );
}
