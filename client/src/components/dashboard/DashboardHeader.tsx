
function DashboardHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-blue-800 text-lg font-bold text-white">
              T
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              MiniTicketTracker
            </span>
          </a>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
              <span className="size-2 rounded-full bg-emerald-500" />
              Support workspace
            </span>
            <span className="grid size-9 place-items-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800">
              T
            </span>
          </div>
        </div>
      </header>
  );
}

export default DashboardHeader;