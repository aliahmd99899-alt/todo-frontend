import { useState } from 'react';
import type { Task } from '../types/Types';
import { formatDueDate, formatCompletedLabel } from '../utils/dates';

const PROJECT_DOTS: Record<string, string> = {
  'Design System': 'bg-[#22D3EE]',
  'Mobile App': 'bg-[#EC4899]',
  'Personal Site': 'bg-[#FACC15]',
};

type TaskCardProps = {
  task: Task;
  onToggle: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  variant?: 'default' | 'archived' | 'completed';
};

export default function TaskCard({
  task,
  onToggle,
  onArchive,
  onUnarchive,
  variant,
}: TaskCardProps) {
  const isCompleted = variant === 'completed';
  const isArchived = variant === 'archived' || (variant === undefined && Boolean(task.archived));
  const [checked, setChecked] = useState(isCompleted || Boolean(task.done));
  const [removing, setRemoving] = useState(false);

  const display = formatDueDate(task.dueDate ?? '');
  const isToday = display === 'Today';

  const projectName =
    typeof task.project === 'string' ? task.project : (task.project?.name ?? '');

  const handleClick = () => {
    if (isCompleted) {
      if (removing) return;
      setRemoving(true);
      window.setTimeout(() => onToggle(), 280);
      return;
    }
    if (checked) return;
    setChecked(true);
    if (isArchived) {
      onToggle();
    } else {
      setRemoving(true);
      window.setTimeout(() => onToggle(), 280);
    }
  };

  return (
    <div
      className={`group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-[0_0_26px_rgba(139,92,246,0.18)] ${
        removing ? 'translate-x-2 opacity-0' : 'opacity-100'
      }`}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label={isCompleted ? `Un-complete ${task.title}` : `Complete ${task.title}`}
        className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border transition ${
          checked
            ? 'border-transparent bg-gradient-to-br from-emerald-500 to-lime-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
            : 'border-white/30 hover:border-white/60'
        }`}
      >
        {checked && (
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </button>

      <span
        className={`truncate text-[13.5px] font-medium ${
          isCompleted ? 'text-white/50 line-through' : 'text-white'
        }`}
      >
        {task.title}
      </span>

      {projectName && (
        <span
          className={`flex flex-none items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/45 ${
            isCompleted ? 'opacity-70' : ''
          }`}
        >
          <span
            className={`h-[6px] w-[6px] rounded-full ${
              PROJECT_DOTS[projectName] ?? 'bg-violet-400'
            }`}
          />
          {projectName}
        </span>
      )}

      <span
        className={`flex-none rounded-full border border-[#7C3AED]/25 bg-[#7C3AED]/20 px-2.5 py-1 text-[11px] font-medium text-violet-300 ${
          isCompleted ? 'opacity-70' : ''
        }`}
      >
        {task.category}
      </span>

      <div className="ml-auto flex flex-none items-center gap-2">
        {isCompleted ? (
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
            {formatCompletedLabel(task.completedAt ?? '')}
          </span>
        ) : (
          <span
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
              isToday
                ? 'border-pink-500/25 bg-pink-500/15 text-pink-300'
                : 'border-white/10 bg-white/5 text-white/40'
            }`}
          >
            {display}
          </span>
        )}

        {!isCompleted &&
          (isArchived ? (
            <button
              type="button"
              onClick={onUnarchive}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Restore
            </button>
          ) : (
            <button
              type="button"
              onClick={onArchive}
              aria-label="Archive task"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white"
              >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="4" rx="1" />
                <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
                <path d="M10 12h4" />
              </svg>
            </button>
          ))}
      </div>
    </div>
  );
}