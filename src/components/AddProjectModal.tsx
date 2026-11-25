import { useCallback, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { projectAPI } from '../server/todo.api';
import type { Project, CreateProjectPayload } from '../types/Types';
import Button from '../ui/Button';
import Field from '../ui/Field';
import Icon from '../ui/Icon';
import { useModalLifecycle } from '../hooks/useModalLifecycle';
import { FIELD, ERROR_BOX } from '../constants/styles';

const getErrorMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
  (err instanceof Error ? err.message : fallback);

function unwrapProject(res: Project | { data: Project }): Project {
  if (res && typeof res === 'object' && 'data' in res) {
    return (res as { data: Project }).data;
  }
  return res as Project;
}

type AddProjectModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (project: Project) => void;
};

export default function AddProjectModal({ open, onClose, onCreated }: AddProjectModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleReset = useCallback(() => {
    setName('');
    setError('');
  }, []);

  const { entered } = useModalLifecycle({
    open,
    onClose,
    onReset: handleReset,
    inputRef,
    blocked: submitting,
  });

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;

    setSubmitting(true);
    setError('');

    let createdProject: Project;
    try {
      const payload: CreateProjectPayload = { name: name.trim() };
      const res = await projectAPI.addProject(payload);
      createdProject = unwrapProject(res);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create project. Please try again.'));
      return;
    } finally {
      setSubmitting(false);
    }

    onCreated(createdProject);
    onClose();
  };

  return (
    <div
      onClick={submitting ? undefined : onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
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
            Project
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
          <Field label="Name">
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={submitting}
              placeholder="Enter project name"
              className={`${FIELD} px-4 py-3 placeholder:text-white/30`}
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
              disabled={!name.trim() || submitting}
              className="rounded-xl px-4 py-2.5 text-[13px]"
            >
              {submitting ? 'Creating…' : 'Add Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}