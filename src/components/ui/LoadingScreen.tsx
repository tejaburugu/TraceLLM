export function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
        <span className="text-sm font-medium">Loading conversations</span>
      </div>
    </div>
  );
}
