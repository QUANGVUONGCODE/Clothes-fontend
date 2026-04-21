export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="h-48 rounded-2xl bg-slate-200 mb-3" />
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
      <div className="h-12 bg-slate-200 rounded-full" />
    </div>
  );
}
