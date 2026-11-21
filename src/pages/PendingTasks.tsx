import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Tabs from '../components/Tabs';
import TaskCard from '../components/TaskCard';
import EmptyState from '../components/EmptyState';
import AddTaskModal from '../components/AddTaskModal';
import { useTasks } from '../context/TasksContext';
import { useSidebar } from '../context/SidebarContext';
import { dueSortValue } from '../utils/dates';

const TABS = ['All Tasks', 'Work', 'Personal', 'Archived'];

export default function PendingTasks() {
  const { tasks, toggleTask, archiveTask, unarchiveTask } = useTasks();
  const { collapsed } = useSidebar();
  const [tab, setTab]       = useState('All Tasks');
  const [search, setSearch] = useState('');
  const [open, setOpen]     = useState(false);

  // "N" opens the modal (skipped while typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'n' && e.key !== 'N') return;
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable) return;
      e.preventDefault();
      setOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const pendingCount = tasks.filter((t) => !t.done && !t.archived).length;
  const q = search.trim().toLowerCase();

  // Derived data — recomputed from (tasks, tab, search) on every render
  const visible = tasks
    .filter((t) => {
      if (tab === 'Archived') return t.archived === true;
      if (t.archived === true) return false;
      if (t.done === true)     return false;
      if (tab === 'Work')      return t.category === 'Work';
      if (tab === 'Personal')  return t.category === 'Personal';
      return true; // 'All Tasks'
    })
    .filter((t) => t.title.toLowerCase().includes(q))
    .sort((a, b) => dueSortValue(a.dueDate) - dueSortValue(b.dueDate));

  const emptyTitle =
    tab === 'Archived' ? 'No archived tasks'
    : tab === 'Work' || tab === 'Personal' ? `No ${tab} tasks`
    : 'All caught up!';

  const emptyBody =
    tab === 'Archived' ? 'Archived tasks will appear here.'
    : tab === 'Work' || tab === 'Personal' ? 'Add a new task to get started.'
    : 'You have no pending tasks.';

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0E0A22] font-sans text-white">
      <div className="pointer-events-none fixed -right-60 -top-72 h-[820px] w-[820px] rounded-full bg-[#7C3AED] opacity-40 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-80 -left-48 h-[860px] w-[860px] rounded-full bg-gradient-to-tr from-[#0E7490] to-[#14B8A6] opacity-25 blur-3xl" />

      <Sidebar />

      <main
        className={`relative z-10 px-10 pb-20 pt-9 transition-[margin] duration-300 ease-in-out max-xl:px-7 ${
          collapsed ? 'ml-[76px]' : 'ml-[220px]'
        }`}
      >
        <Header
          title={
            <>
              <span className="bg-gradient-to-r from-[#A78BFA] to-[#EC4899] bg-clip-text text-transparent">
                Pending
              </span>{' '}
              Tasks
            </>
          }
          subtitle={
            <>
              You have <span className="font-semibold text-white">{pendingCount}</span> tasks remaining.
            </>
          }
          search={search}
          onSearch={setSearch}
          onAddClick={() => setOpen(true)}
        />

        <Tabs active={tab} onChange={setTab} tabs={TABS} />

        {visible.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyBody} />
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {visible.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => toggleTask(task.id)}
                onArchive={() => archiveTask(task.id)}
                onUnarchive={() => unarchiveTask(task.id)}
              />
            ))}
          </div>
        )}
      </main>

      <AddTaskModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}