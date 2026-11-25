import { useCallback, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useTasks } from '../context/TasksContext';
import { taskAPI } from '../server/todo.api';
import type { Project, CreateTaskPayload, Task, AddTaskModalProps } from '../types/Types';
import AddProjectModal from './AddProjectModal';
import Button from '../ui/Button';
import Field from '../ui/Field';
import Icon from '../ui/Icon';
import ProjectSelect from './ProjectSelect';
import CategoryPicker from './CategoryPicker';
import { useProjects } from '../hooks/useProjects';
import { useModalLifecycle } from '../hooks/useModalLifecycle';
import { isoToday, normalizeDate } from '../utils/dates';
import { FIELD, ERROR_BOX, type Category } from '../constants/styles';

const getErrorMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
  (err instanceof Error ? err.message : fallback);

function unwrapTask(res: Task | { data: Task }): Task {
  if (res && typeof res === 'object' && 'data' in res) {
    return (res as { data: Task }).data;
  }
  return res as Task;
}

export default function AddTaskModal({ open, onClose }: AddTaskModalProps) {
  const { addTask } = useTasks();
  const inputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Work');
  const [dueDate, setDueDate] = useState(isoToday);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [addProjectOpen, setAddProjectOpen] = useState(false);

  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    loading,
    error: projectsError,
    retry,
    addProject,
  } = useProjects(open);

  const handleReset = useCallback(() => {
    setTitle('');
    setCategory('Work');
    setDueDate(isoToday());
    setError('');
    setAddProjectOpen(false);
  }, []);

  const { entered } = useModalLifecycle({
    open,
    onClose,
    onReset: handleReset,
    inputRef,
    blocked: submitting || addProjectOpen,
  });

  if (!open) return null;

  const selectedProject = projects.find((p) => p._id === selectedProjectId);
  const selectedProjectName = selectedProject?.name ?? '';
  const canSubmit = !!title.trim() && !!selectedProjectId && !submitting;

  const handleProjectCreated = (newProject: Project) => {
    addProject(newProject);
    if (newProject._id) setSelectedProjectId(newProject._id);
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

    let created: Task;
    try {
      const payload: CreateTaskPayload = {
        title: title.trim(),
        project: selectedProjectName,
        projectId: selectedProjectId,
        category,
        dueDate,
      };

      const res = await taskAPI.addTask(payload);
      created = unwrapTask(res);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to add task. Please try again.'));
      return;
    } finally {
      setSubmitting(false);
    }

    addTask({
      title: created.title ?? title.trim(),
      project: created.project ?? selectedProjectName,
      category: created.category ?? category,
      dueDate: normalizeDate(created.dueDate, dueDate),
    });

    onClose();
  };

  return (
    <>
      <div
        onClick={submitting || addProjectOpen ? undefined : onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-200 ease-out ${
            entered ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
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
              <Icon d="M18 6 6 18M6 6l12 12" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Title">
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={submitting}
                placeholder="Enter task title"
                className={`${FIELD} px-4 py-3 placeholder:text-white/30`}
              />
            </Field>

            <Field
              label="Project"
              action={
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setAddProjectOpen(true)}
                  disabled={submitting}
                  className="text-[11.5px]"
                >
                  + New Project
                </Button>
              }
            >
              <ProjectSelect
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelect={setSelectedProjectId}
                loading={loading}
                error={projectsError}
                onRetry={retry}
                onAddProject={() => setAddProjectOpen(true)}
                disabled={submitting}
              />
            </Field>

            <Field label="Category">
              <CategoryPicker value={category} onChange={setCategory} disabled={submitting} />
            </Field>

            <Field label="Due date">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={submitting}
                className={`${FIELD} px-4 py-3 [color-scheme:dark]`}
              />
            </Field>

            {error && <p className={`rounded-lg px-3 py-2 ${ERROR_BOX}`}>{error}</p>}

            <div className="mt-2 flex justify-end gap-2">
              <Button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-xl px-4 py-2.5 text-[13px]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!canSubmit}
                className="rounded-xl px-4 py-2.5 text-[13px]"
              >
                {submitting ? 'Adding…' : 'Add Task'}
              </Button>
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