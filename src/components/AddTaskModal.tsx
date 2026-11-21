import { useEffect, useRef, useState } from 'react';
import { useTasks } from '../context/TasksContext';

const PROJECTS = ['Design System', 'Mobile App', 'Personal Site'];

const PROJECT_DOTS = {
  'Design System': 'bg-[#22D3EE]',
  'Mobile App':    'bg-[#EC4899]',
  'Personal Site': 'bg-[#FACC15]',
};

const todayISO = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function AddTaskModal({ open, onClose }) {
  const { addTask } = useTasks();
  const [title, setTitle]       = useState('');
  const [project, setProject]   = useState('Design System');
  const [category, setCategory] = useState('Work');
  const [dueDate, setDueDate]   = useState(todayISO());
  const [entered, setEntered]   = useState(false);
  const inputRef = useRef(null);

  // Reset + focus + entrance animation when opening
  useEffect(() => {
    if (!open) { setEntered(false); return; }
    setTitle('');
    setProject('Design System');
    setCategory('Work');
    setDueDate(todayISO());
    const focusId = setTimeout(() => inputRef.current?.focus(), 60);
    const rafId = requestAnimationFrame(() => setEntered(true));
    return () => { clearTimeout(focusId); cancelAnimationFrame(rafId); };
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({ title, project, category, dueDate });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-200 ease-out ${
          entered ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-[-0.01em] text-white">
            <span className="bg-gradient-to-r from-[#A78BFA] to-[#EC4899] bg-clip-text text-transparent">
              New
            </span>{' '}
            Task
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-white/50">Title</label>
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter task title"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white placeholder:text-white/30 outline-none transition focus:ring-2 focus:ring-[#7C3AED]/60"
            />
          </div>

          {/* Project */}
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-white/50">Project</label>
            <div className="relative">
              <span className={`pointer-events-none absolute left-4 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${PROJECT_DOTS[project]}`} />
              <select
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-9 pr-10 text-[13px] text-white outline-none transition focus:ring-2 focus:ring-[#7C3AED]/60"
              >
                {PROJECTS.map((p) => (
                  <option key={p} value={p} className="bg-[#171034] text-white">
                    {p}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-white/50">Category</label>
            <div className="flex gap-2">
              {['Work', 'Personal'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`flex-1 rounded-xl px-3 py-2.5 text-[12.5px] font-medium transition ${
                    category === c
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white shadow-lg shadow-purple-500/30'
                      : 'border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/90'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-white/50">Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white outline-none transition [color-scheme:dark] focus:ring-2 focus:ring-[#7C3AED]/60"
            />
          </div>

          {/* Actions */}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[13px] font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}