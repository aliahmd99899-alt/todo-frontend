export default function EmptyState({
  title = 'All caught up!',
  description = 'You have no pending tasks.',
}) {
  return (
    <div className="mt-8 flex justify-center">
      <div className="flex flex-col items-center rounded-3xl border border-white/10 bg-white/5 px-16 py-14 text-center backdrop-blur-xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-500 shadow-[0_0_30px_rgba(16,185,129,0.35)]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
        <p className="mt-1.5 text-[13px] text-white/40">{description}</p>
      </div>
    </div>
  );
}