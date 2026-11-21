import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Tabs from '../components/Tabs';
import TaskCard from '../components/TaskCard';
import EmptyState from '../components/EmptyState';
import AddTaskModal from '../components/AddTaskModal';
import { useTasks } from '../context/TasksContext';
import { useSidebar } from '../context/SidebarContext';

const TABS = ['All Tasks', 'Work', 'Personal'];

export default function Completed() {
  const { tasks, toggleTask } = useTasks();
  const { collapsed } = useSidebar();
  const [tab, setTab]       = useState('All Tasks');
  const [search, setSearch] = useState('');
  const [open, setOpen]     = useState(false);

  // "N" opens the Add Task modal (skipped while typing)
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

  const completed = tasks.filter((t) => t.done === true && t.archived !== true);
  const q = search.trim().toLowerCase();

  // Derived on every render
  const visible = completed
    .filter((t) => tab === 'All Tasks' || t.category === tab)
    .filter((t) => t.title.toLowerCase().includes(q))
    .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || '')); // newest first

  const emptyTitle =
    tab === 'Work' || tab === 'Personal' ? `No completed ${tab} tasks` : 'Nothing completed yet';

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
                Completed
              </span>
            </>
          }
          subtitle={
            <>
              You&apos;ve completed{' '}
              <span className="font-semibold text-white">{completed.length}</span> tasks.
            </>
          }
          search={search}
          onSearch={setSearch}
          onAddClick={() => setOpen(true)}
        />

        <Tabs active={tab} onChange={setTab} tabs={TABS} />

        {visible.length === 0 ? (
          <EmptyState title={emptyTitle} description="Finished tasks will appear here." />
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {visible.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                variant="completed"
                onToggle={() => toggleTask(task.id)}
              />
            ))}
          </div>
        )}
      </main>

      <AddTaskModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}