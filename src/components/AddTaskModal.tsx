import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useTasks } from '../context/TasksContext';
import { taskAPI, projectAPI } from '../server/todo.api';
import type { Project, CreateTaskPayload } from '../types/Types';
import AddProjectModal from './AddProjectModal';

const DOT_COLORS = [
  'bg-[#22D3EE]',
  'bg-[#EC4899]',
  'bg-[#FACC15]',
  'bg-[#A78BFA]',
  'bg-[#34D399]',
];

const todayISO = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const normalizeDate = (value: unknown, fallback: string): string => {
  if (typeof value !== 'string' || !value) return fallback;
  return value.slice(0, 10);
};

type AddTaskModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function AddTaskModal({ open, onClose }: AddTaskModalProps) {
  const { addTask } = useTasks();

  const [title, setTitle]                       = useState('');
  const [category, setCategory]                 = useState<'Work' | 'Personal'>('Work');
  const [dueDate, setDueDate]                   = useState<string>(todayISO());

  const [projects, setProjects]                 = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectsLoading, setProjectsLoading]   = useState(false);
  const [projectsError, setProjectsError]       = useState('');

  const [entered, setEntered]                   = useState(false);
  const [submitting, setSubmitting]             = useState(false);
  const [error, setError]                       = useState('');
  const [addProjectOpen, setAddProjectOpen]     = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // جلب المشاريع من الباك اند عند الفتح
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setProjectsLoading(true);
    setProjectsError('');

    projectAPI
      .getAllProjects()
      .then((res) => {
        if (cancelled) return;
        const list = (res as { data?: Project[] }).data ?? (res as unknown as Project[]);
        setProjects(list);
        setSelectedProjectId((prev) => {
          const stillThere = prev && list.some((p) => (p as { _id?: string })._id === prev);
          if (stillThere) return prev;
          return (list[0] as { _id?: string } | undefined)?._id ?? '';
        });
      })
      .catch((err) => {
        if (!cancelled) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            (err instanceof Error ? err.message : 'Failed to load projects.');
          setProjectsError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setProjectsLoading(false);
      });

    return () => { cancelled = true; };
  }, [open]);

  // Reset الحقول + التركيز + الأنيميشن
  useEffect(() => {
    if (!open) { setEntered(false); return; }
    setTitle('');
    setCategory('Work');
    setDueDate(todayISO());
    setError('');
    const focusId = setTimeout(() => inputRef.current?.focus(), 60);
    const rafId = requestAnimationFrame(() => setEntered(true));
    return () => { clearTimeout(focusId); cancelAnimationFrame(rafId); };
  }, [open]);

  // Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting && !addProjectOpen) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, submitting, addProjectOpen]);

  if (!open) return null;

  const selectedIndex = projects.findIndex(
    (p) => (p as { _id?: string })._id === selectedProjectId,
  );
  const selectedProject = projects[selectedIndex];
  const selectedProjectName =
    (selectedProject as { name?: string } | undefined)?.name ?? '';
  const dotColor = DOT_COLORS[Math.max(0, selectedIndex) % DOT_COLORS.length];

  const handleProjectCreated = (newProject: Project) => {
    setProjects((prev) => [...prev, newProject]);
    const newId = (newProject as { _id?: string })._id;
    if (newId) setSelectedProjectId(newId);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    if (!selectedProjectId || !selectedProjectName) {
      setError('Please create or select a project first.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title: title.trim(),
        project: selectedProjectName,
        projectId: selectedProjectId,
        category,
        dueDate,
      };

      const res = await taskAPI.addTask(payload as unknown as CreateTaskPayload);
      const created =
        (res as { data?: Record<string, unknown> }).data ??
        (res as unknown as Record<string, unknown>);

      addTask({
        title: (created.title as string | undefined) ?? title.trim(),
        project: (created.project as string | undefined) ?? selectedProjectName,
        category: ((created.category as 'Work' | 'Personal' | undefined) ?? category),
        dueDate: normalizeDate(created.dueDate, dueDate),
      });

      onClose();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Failed to add task. Please try again.');
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        onClick={submitting ? undefined : onClose}
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
              disabled={submitting}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
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
                disabled={submitting}
                placeholder="Enter task title"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white placeholder:text-white/30 outline-none transition focus:ring-2 focus:ring-[#7C3AED]/60 disabled:opacity-60"
              />
            </div>

            {/* Project — يجلب من الـ API */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-[12px] font-medium text-white/50">Project</label>
                <button
                  type="button"
                  onClick={() => setAddProjectOpen(true)}
                  disabled={submitting}
                  className="text-[11.5px] font-medium text-violet-300 transition hover:text-white disabled:opacity-40"
                >
                  + New Project
                </button>
              </div>

              {projectsLoading ? (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white/40">
                  Loading projects…
                </div>
              ) : projectsError ? (
                <div className="rounded-xl border border-pink-500/25 bg-pink-500/10 px-4 py-3 text-[12.5px] text-pink-300">
                  {projectsError}
                </div>
              ) : projects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-4 text-center">
                  <p className="text-[12.5px] text-white/50">No projects yet.</p>
                  <button
                    type="button"
                    onClick={() => setAddProjectOpen(true)}
                    disabled={submitting}
                    className="mt-2 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-3 py-1.5 text-[12px] font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:scale-105 disabled:opacity-40"
                  >
                    + Add Project
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <span className={`pointer-events-none absolute left-4 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${dotColor}`} />
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    disabled={submitting}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3 pl-9 pr-10 text-[13px] text-white outline-none transition focus:ring-2 focus:ring-[#7C3AED]/60 disabled:opacity-60"
                  >
                    {projects.map((p) => {
                      const pid = (p as { _id?: string })._id ?? '';
                      const pname = (p as { name?: string }).name ?? 'Untitled';
                      return (
                        <option key={pid || pname} value={pid} className="bg-[#171034] text-white">
                          {pname}
                        </option>
                      );
                    })}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-white/50">Category</label>
              <div className="flex gap-2">
                {(['Work', 'Personal'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    disabled={submitting}
                    className={`flex-1 rounded-xl px-3 py-2.5 text-[12.5px] font-medium transition disabled:opacity-60 ${
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
                disabled={submitting}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white outline-none transition [color-scheme:dark] focus:ring-2 focus:ring-[#7C3AED]/60 disabled:opacity-60"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-pink-500/25 bg-pink-500/10 px-3 py-2 text-[12.5px] text-pink-300">
                {error}
              </p>
            )}

            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[13px] font-medium text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || submitting || !selectedProjectId}
                className="rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                {submitting ? 'Adding…' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <AddProjectModal
        open={addProjectOpen}
        onClose={() => setAddProjectOpen(false)}
        onCreated={handleProjectCreated}
      />
    </>
  );
}