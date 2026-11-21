import { useMemo, useState } from 'react';
import { useTasks } from '../context/TasksContext';
import { parseISO, startOfWeek, addDays, DAY_LABELS } from '../utils/dates';

type Bar = {
  label: string;
  count: number;
  isHighlight: boolean;
  isEmpty: boolean;
};

export default function ActivityCard() {
  const { tasks } = useTasks();
  const [period, setPeriod] = useState<'Weekly' | 'Monthly'>('Weekly');

  // Recomputed every render; added to the memo deps so the chart re-runs past midnight.
  const todayKey = new Date().toDateString();

  const { bars, maxCount, currentTotal, previousTotal } = useMemo(() => {
    const now = new Date(todayKey);
    now.setHours(0, 0, 0, 0);

    const completedDates = tasks
      .filter((t) => t.archived !== true && t.done === true && t.completedAt)
      .map((t) => parseISO(t.completedAt as string));

    let rawBars: { label: string; count: number }[] = [];
    let currentTotal = 0;
    let previousTotal = 0;

    if (period === 'Weekly') {
      const monday = startOfWeek(now);
      const nextMonday = addDays(monday, 7);
      const previousMonday = addDays(monday, -7);
      const counts = [0, 0, 0, 0, 0, 0, 0];

      const mondayMs = monday.getTime();
      const nextMs = nextMonday.getTime();
      const prevMs = previousMonday.getTime();

      for (const d of completedDates) {
        const t = d.getTime();
        if (t >= mondayMs && t < nextMs) {
          const idx = Math.floor((t - mondayMs) / 86400000);
          if (idx >= 0 && idx < 7) counts[idx]++;
        } else if (t >= prevMs && t < mondayMs) {
          previousTotal++;
        }
      }

      rawBars = DAY_LABELS.map((label, i) => ({ label, count: counts[i] }));
      currentTotal = counts.reduce((a, b) => a + b, 0);
    } else {
      const y = now.getFullYear();
      const m = now.getMonth();
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const weekCount = daysInMonth > 28 ? 5 : 4;
      const counts: number[] = Array(weekCount).fill(0);

      const lastM = m === 0 ? 11 : m - 1;
      const lastY = m === 0 ? y - 1 : y;

      for (const d of completedDates) {
        const dy = d.getFullYear();
        const dm = d.getMonth();
        if (dy === y && dm === m) {
          const idx = Math.min(Math.floor((d.getDate() - 1) / 7), weekCount - 1);
          counts[idx]++;
        } else if (dy === lastY && dm === lastM) {
          previousTotal++;
        }
      }

      rawBars = counts.map((count, i) => ({ label: `W${i + 1}`, count }));
      currentTotal = counts.reduce((a, b) => a + b, 0);
    }

    const maxCount = Math.max(...rawBars.map((b) => b.count), 0);
    let highlightIdx = -1;
    if (maxCount > 0) {
      for (let i = rawBars.length - 1; i >= 0; i--) {
        if (rawBars[i].count === maxCount) {
          highlightIdx = i;
          break;
        }
      }
    }

    const bars: Bar[] = rawBars.map((b, i) => ({
      label: b.label,
      count: b.count,
      isHighlight: i === highlightIdx,
      isEmpty: b.count === 0,
    }));

    return { bars, maxCount, currentTotal, previousTotal };
  }, [tasks, period, todayKey]);

  const efficiency = useMemo(() => {
    const periodLabel = period === 'Weekly' ? 'week' : 'month';
    if (previousTotal > 0) {
      const diff = Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
      if (diff === 0) return `Efficiency is unchanged from last ${periodLabel}`;
      const direction = diff > 0 ? 'up' : 'down';
      return `Efficiency is ${direction} ${Math.abs(diff)}% from last ${periodLabel}`;
    }
    if (currentTotal > 0) {
      return `Great start! Your first completed tasks this ${periodLabel}.`;
    }
    return 'Complete tasks to see your activity here.';
  }, [currentTotal, previousTotal, period]);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[15.5px] font-semibold tracking-[-0.01em] text-white">
            {period === 'Weekly' ? 'Weekly Activity' : 'Monthly Activity'}
          </h3>
          <p className="mt-1.5 text-[12.5px] text-white/40">{efficiency}</p>
        </div>

        <div className="flex flex-none gap-0.5 rounded-[10px] border border-white/10 bg-white/5 p-[3px]">
          {(['Weekly', 'Monthly'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPeriod(option)}
              className={`rounded-lg px-3 py-1.5 text-[11.5px] font-medium transition ${
                period === option
                  ? 'bg-[#171034] text-white shadow-[0_2px_10px_rgba(0,0,0,0.4)]'
                  : 'text-white/40 hover:text-white/80'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex h-[200px] items-stretch gap-3">
        {bars.map((bar) => {
          const heightPct = maxCount > 0 ? Math.max((bar.count / maxCount) * 100, 6) : 6;
          const fill = bar.isHighlight
            ? 'bg-gradient-to-b from-pink-500 to-pink-800/30 shadow-[0_0_26px_rgba(236,72,153,0.45)]'
            : bar.isEmpty
              ? 'bg-white/[0.06]'
              : 'bg-gradient-to-b from-indigo-600 to-violet-800/30';

          return (
            <div
              key={bar.label}
              tabIndex={0}
              aria-label={`${bar.label}: ${bar.count} ${bar.count === 1 ? 'task' : 'tasks'}`}
              className="group flex min-w-0 flex-1 flex-col outline-none"
            >
              <div className="relative flex-1">
                <div
                  className={`absolute bottom-0 left-1/2 w-full max-w-[42px] -translate-x-1/2 rounded-lg transition-[height] duration-500 ease-out ${fill}`}
                  style={{ height: `${heightPct}%` }}
                >
                  <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#0E0A22]/90 px-2 py-1 text-[11px] text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 group-focus:opacity-100 group-focus-within:opacity-100">
                    {bar.count} {bar.count === 1 ? 'task' : 'tasks'}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-center text-[10px] font-medium uppercase tracking-[0.10em] text-white/30">
                {bar.label}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}