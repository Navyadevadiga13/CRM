const Loader = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50">
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      <span className="text-sm font-medium text-slate-600">Loading CRM...</span>
    </div>
  </div>
);

export default Loader;
