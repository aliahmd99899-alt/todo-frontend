import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { DOT_COLORS } from '../utils/dates';
import { FIELD, ERROR_BOX } from '../constants/styles';
import type { Project } from '../types/Types';

type ProjectSelectProps = {
  projects: Project[];
  selectedProjectId: string;
  onSelect: (id: string) => void;
  loading: boolean;
  error: string;
  onRetry: () => void;
  onAddProject: () => void;
  disabled?: boolean;
};

export default function ProjectSelect({
  projects,
  selectedProjectId,
  onSelect,
  loading,
  error,
  onRetry,
  onAddProject,
  disabled = false,
}: ProjectSelectProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white/40">
        Loading projects…
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-xl px-4 py-3 ${ERROR_BOX}`}>
        <p>{error}</p>
        <Button variant="link" onClick={onRetry} className="mt-1 text-[12px]">
          Retry
        </Button>
      </div>
    );
  }

  if (!projects.length) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-4 text-center">
        <p className="text-[12.5px] text-white/50">No projects yet.</p>
        <Button
          variant="primary"
          onClick={onAddProject}
          disabled={disabled}
          className="mt-2 rounded-lg px-3 py-1.5 text-[12px]"
        >
          + Add Project
        </Button>
      </div>
    );
  }

  const selectedIndex = projects.findIndex((p) => p.id === selectedProjectId);
  const dotColor = DOT_COLORS[Math.max(0, selectedIndex) % DOT_COLORS.length];

  return (
    <div className="relative">
      <span
        className={`pointer-events-none absolute left-4 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${dotColor}`}
      />
      <select
        value={selectedProjectId}
        onChange={(e) => onSelect(e.target.value)}
        disabled={disabled}
        className={`${FIELD} appearance-none py-3 pl-9 pr-10`}
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id} className="bg-[#171034] text-white">
            {p.name}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
        <Icon d="m6 9 6 6 6-6" size={14} />
      </span>
    </div>
  );
}