import { Container } from "@/components/ui/container";

export default function Loading() {
  return (
    <main role="status" aria-label="Loading tour details">
      <Container className="animate-pulse py-12">
        <div className="h-5 w-60 rounded bg-surface-muted" />
        <div className="mt-9 h-12 w-3/4 rounded bg-surface-muted" />
        <div className="mt-6 h-5 w-64 rounded bg-surface-muted" />
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          <div className="aspect-4/3 rounded-2xl bg-surface-muted md:row-span-2" />
          <div className="aspect-4/3 rounded-2xl bg-surface-muted md:aspect-2/1" />
          <div className="aspect-4/3 rounded-2xl bg-surface-muted md:aspect-2/1" />
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <div className="h-8 w-48 rounded bg-surface-muted" />
            <div className="h-4 w-full rounded bg-surface-muted" />
            <div className="h-4 w-4/5 rounded bg-surface-muted" />
          </div>
          <div className="h-52 rounded-2xl bg-surface-muted" />
        </div>
        <span className="sr-only">Loading tour details...</span>
      </Container>
    </main>
  );
}
