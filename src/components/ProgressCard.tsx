import { useTasks } from '../context/TasksContext';

const R = 62;
const CIRCUMFERENCE = 2 * Math.PI * R;

export default function ProgressCard() {
  const { tasks } = useTasks();

  const active = tasks.filter((t) => t.archived !== true);
  const total = active.length;
  const completed = active.filter((t) => t.done === true).length;
  const remaining = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const offset = total === 0 ? CIRCUMFERENCE : CIRCUMFERENCE * (1 - completed / total);
  const isComplete = percent === 100 && total > 0;

  let title;
  let body;
  if (total === 0) {
    title = 'No tasks yet';
    body = 'Add your first task to get started.';
  } else if (remaining === 0) {
    title = 'All done, great job!';
    body = (
      <>
        You completed{' '}
        <span className="font-medium text-pink-400">
          all {total} {total === 1 ? 'task' : 'tasks'}
        </span>
        .
      </>
    );
  } else if (percent >= 50) {
    title = "You're almost there!";
    body = (
      <>
        <span className="font-medium text-pink-400">
          {remaining} more {remaining === 1 ? 'task' : 'tasks'}
        </span>{' '}
        to reach 100%.
      </>
    );
  } else {
    title = "Let's get moving!";
    body = (
      <>
        <span className="font-medium text-pink-400">
          {remaining} {remaining === 1 ? 'task' : 'tasks'}
        </span>{' '}
        left to reach 100%.
      </>
    );
  }

  const gradientId = isComplete ? 'ringGradientGreen' : 'ringGradient';
  const ringGlow = isComplete
    ? 'drop-shadow-[0_0_14px_rgba(16,185,129,0.4)]'
    : 'drop-shadow-[0_0_14px_rgba(139,92,246,0.35)]';

  return (
    <section className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="relative h-[170px] w-[170px]">
        <svg viewBox="0 0 150 150" className={`block h-full w-full ${ringGlow}`}>
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
            <linearGradient id="ringGradientGreen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#84CC16" />
            </linearGradient>
          </defs>

          <circle
            cx="75"
            cy="75"
            r={R}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="12"
          />
          <circle
            cx="75"
            cy="75"
            r={R}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 75 75)"
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[32px] font-bold leading-none tracking-[-0.02em] text-white">
            {percent}%
          </div>
          <div className="mt-[7px] text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
            Done
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <p className="mt-1.5 text-[12.5px] text-white/40">{body}</p>
        <p className="mt-2 text-[11px] text-white/30">
          {completed} of {total} completed
        </p>
      </div>
    </section>
  );
}