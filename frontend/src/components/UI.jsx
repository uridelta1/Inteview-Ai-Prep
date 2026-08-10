export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-xl2 border border-ink/10 bg-white p-5 shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function ScoreBadge({ score, max = 100, size = "md" }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 75 ? "text-sage" : pct >= 50 ? "text-ember" : "text-coral";
  const bg = pct >= 75 ? "bg-sage/10" : pct >= 50 ? "bg-ember/10" : "bg-coral/10";
  const sizeClass = size === "lg" ? "text-3xl px-4 py-2" : "text-sm px-2.5 py-1";
  return (
    <span className={`inline-flex items-baseline gap-1 rounded-full font-mono font-semibold ${color} ${bg} ${sizeClass}`}>
      {score}
      <span className="text-xs font-normal opacity-60">/{max}</span>
    </span>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl2 border border-dashed border-ink/15 py-16 text-center">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink/5 text-ink/40">
          <Icon size={22} />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink/60">{description}</p>}
      {action}
    </div>
  );
}
