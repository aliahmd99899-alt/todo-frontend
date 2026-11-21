import TaskCard from './TaskCard';
import EmptyState from './EmptyState';
import type { Task } from '../types/Types';

type TaskListProps = {
  tasks: Task[];
  onToggle: (id: number) => void;
  onArchive?: (id: number) => void;
  onUnarchive?: (id: number) => void;
  emptyTitle?: string;
  emptyBody?: string;
};

export default function TaskList({
  tasks,
  onToggle,
  onArchive,
  onUnarchive,
  emptyTitle = 'All caught up!',
  emptyBody = 'You have no pending tasks.',
}: TaskListProps) {
  if (tasks.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyBody} />;
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={() => onToggle(task.id)}
          onArchive={onArchive ? () => onArchive(task.id) : undefined}
          onUnarchive={onUnarchive ? () => onUnarchive(task.id) : undefined}
        />
      ))}
    </div>
  );
}