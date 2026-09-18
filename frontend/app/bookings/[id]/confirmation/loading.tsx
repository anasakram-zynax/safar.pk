export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <div
        role="status"
        aria-label="Loading booking confirmation"
        className="animate-pulse rounded-2xl border border-border bg-surface p-10"
      >
        <div className="mx-auto size-12 rounded-full bg-surface-muted" />
        <div className="mx-auto mt-6 h-10 w-72 rounded bg-surface-muted" />
        <div className="mx-auto mt-4 h-5 w-96 max-w-full rounded bg-surface-muted" />
      </div>
    </main>
  );
}
