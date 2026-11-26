import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ActivityCard from '../components/ActivateCard'; // fixed filename
import ProgressCard from '../components/ProgressCard';
import Tabs from '../components/Tabs';
import TaskList from '../components/TaskList';
import AddTaskModal from '../components/AddTaskModal';
import { useTasks } from '../context/TasksContext';
import { useSidebar } from '../context/SidebarContext';
import { dueSortValue } from '../utils/dates';

const TABS = ['All Tasks', 'Work', 'Personal'];
const LIMIT = 10;

function getStoredUserName(): string {
  const direct = localStorage.getItem('name') || localStorage.getItem('user_name');
  if (direct) return direct;

  try {
    const raw = localStorage.getItem('user_data');
    if (raw) {
      const parsed = JSON.parse(raw) as { name?: string };
      if (parsed.name) return parsed.name;
    }
  } catch {
    // ignore invalid JSON
  }

  return localStorage.getItem('user_email') || 'there';
}

export default function Dashboard() {
  const { tasks, toggleTask, archiveTask } = useTasks();
  const { collapsed } = useSidebar();
  const [tab, setTab] = useState('All Tasks');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const user = getStoredUserName();

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

  // Subtitle counts every pending (not done, not archived) task — unchanged
  const pending = tasks.filter((t) => !t.done && !t.archived).length;
  const q = search.trim().toLowerCase();

  // Derived every render: pending → active tab → search → sorted by due date
  const filtered = tasks
    .filter((t) => !t.done && !t.archived)
    .filter((t) => tab === 'All Tasks' || t.category === tab)
    .filter((t) => t.title.toLowerCase().includes(q))
    .sort((a, b) => dueSortValue(a.dueDate) - dueSortValue(b.dueDate));

  const visible = filtered.slice(0, LIMIT);
  const hasMore = filtered.length > LIMIT;

  const emptyTitle = q
    ? 'No matching tasks'
    : tab === 'Work' || tab === 'Personal'
      ? `No pending ${tab} tasks`
      : 'All caught up!';

  const emptyBody = q
    ? 'Try a different search keyword.'
    : tab === 'Work' || tab === 'Personal'
      ? 'Add a new task to get started.'
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
              Good morning,{' '}
              <span className="bg-gradient-to-r from-[#A78BFA] to-[#EC4899] bg-clip-text text-transparent">
                {user}
              </span>
              .
            </>
          }
          subtitle={
            <>
              You have <span className="font-semibold text-white">{pending}</span> tasks remaining for today.
            </>
          }
          search={search}
          onSearch={setSearch}
          onAddClick={() => setOpen(true)}
        />

        <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <ActivityCard />
          <ProgressCard />
        </div>

        <Tabs active={tab} onChange={setTab} tabs={TABS} />

        <TaskList
          tasks={visible}
          onToggle={toggleTask}
          onArchive={archiveTask}
          emptyTitle={emptyTitle}
          emptyBody={emptyBody}
        />

        {hasMore && (
          <div className="mt-4 text-center">
            <Link
              to="/pending"
              className="text-[13px] font-medium text-white/55 transition hover:text-white hover:underline hover:decoration-violet-400 hover:underline-offset-4"
            >
              View all {filtered.length} tasks →
            </Link>
          </div>
        )}
      </main>

      <AddTaskModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}