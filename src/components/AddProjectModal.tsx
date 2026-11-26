import { useCallback, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { projectAPI } from '../server/todo.api';
import type { Project, CreateProjectPayload } from '../types/Types';
import Button from '../ui/Button';
import Field from '../ui/Field';
import Icon from '../ui/Icon';
import { useModalLifecycle } from '../hooks/useModalLifecycle';
import { FIELD, ERROR_BOX } from '../constants/styles';

const PRESET_COLORS = [
  '#A78BFA',
  '#EC4899',
  '#22D3EE',
  '#FACC15',
  '#34D399',
  '#F97316',
  '#60A5FA',
] as const;

const DEFAULT_COLOR = PRESET_COLORS[0];

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
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleReset = useCallback(() => {
    setName('');
    setColor(DEFAULT_COLOR);
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
      const payload: CreateProjectPayload = {
        name: name.trim(),
        color: color.toUpperCase(),
      };
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

          <Field label="Color">
            <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5">
              {PRESET_COLORS.map((preset) => {
                const selected = color.toLowerCase() === preset.toLowerCase();
                return (
                  <button
                    key={preset}
                    type="button"
                    disabled={submitting}
                    onClick={() => setColor(preset)}
                    aria-label={`Select color ${preset}`}
                    style={{ backgroundColor: preset }}
                    className={`h-7 w-7 rounded-full transition ${
                      selected
                        ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#130E2A]'
                        : 'opacity-80 hover:scale-105 hover:opacity-100'
                    }`}
                  />
                );
              })}

              <label
                className="ml-auto flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[12px] text-white/75 transition hover:bg-white/10"
                title="Choose custom color"
              >
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={submitting}
                  className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0"
                />
                <span className="font-mono text-[11.5px] uppercase text-white/70">
                  {color}
                </span>
              </label>
            </div>
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