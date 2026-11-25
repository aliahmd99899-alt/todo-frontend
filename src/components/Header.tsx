import type { ReactNode } from 'react';

type HeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  search?: string;
  onSearch?: (value: string) => void;
  onAddClick?: () => void;
};

export default function Header({
  title,
  subtitle,
  search = '',
  onSearch,
  onAddClick,
}: HeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-6">
      <div>
        <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.025em] text-white">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-[13.5px] text-white/40">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.6-3.6" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch?.(e.target.value)}
            placeholder="Search tasks... (/)"
            className="h-10 w-[250px] rounded-xl border border-white/10 bg-white/5 pl-9 pr-3.5 text-[13px] text-white placeholder:text-white/30 transition focus:border-violet-500/60 focus:bg-white/[0.07] focus:outline-none"
          />
        </div>

        {onAddClick && (
          <button
            type="button"
            onClick={onAddClick}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:scale-105"
          >
            <span className="text-[15px] leading-none">+</span>
            New Task
          </button>
        )}
      </div>
    </header>
  );
}