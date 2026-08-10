export default function LoadingSpinner({ label = "Loading" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink/50">
      <div className="h-8 w-8 rounded-full border-2 border-ink/15 border-t-signal animate-spin" />
      <span className="text-sm font-medium">{label}…</span>
    </div>
  );
}
