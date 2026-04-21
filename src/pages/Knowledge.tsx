export default function Knowledge() {
  return (
    <div className="w-full max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Knowledge Base</h1>
      <div className="glass-card p-8">
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Dynamic feed from D1 fetching latest/hot snippets.
        </p>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}
