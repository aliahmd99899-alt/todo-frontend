import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, ListTodo, CheckCircle2, ChevronLeft } from 'lucide-react';
import type { Url, Project } from '../types/Types';
import { useTasks } from '../context/TasksContext';
import { useSidebar } from '../context/SidebarContext';
import { projectAPI } from '../server/todo.api';

// ألوان النقاط — تُطبّق بالتناوب على المشاريع القادمة من الـ API
const DOT_COLORS = [
  'bg-[#22D3EE] shadow-[0_0_8px_#22D3EE]',
  'bg-[#EC4899] shadow-[0_0_8px_#EC4899]',
  'bg-[#FACC15] shadow-[0_0_8px_#FACC15]',
  'bg-[#A78BFA] shadow-[0_0_8px_#A78BFA]',
  'bg-[#34D399] shadow-[0_0_8px_#34D399]',
];


export default function Sidebar() {
  const email = localStorage.getItem('user_email');
  const displayName = localStorage.getItem('name');

  const { tasks } = useTasks();
  const { pathname } = useLocation();
  const { collapsed, toggle } = useSidebar();
  const [projects, setProjects] = useState<Project[]>([]);

  const pendingCount = tasks.filter((t) => !t.done && !t.archived).length;

  useEffect(() => {
    let cancelled = false;

    projectAPI
      .getAllProjects()
      .then((data) => {
        if (!cancelled) {
          setProjects(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (!cancelled) console.error(err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const NAV: Url[] = [
    { label: 'Today', active: true, badge: String(pendingCount), href: '/', icon: CalendarDays },
    { label: 'Tasks', active: true, href: '/pending', icon: ListTodo },
    { label: 'Completed', active: true, href: '/completed', icon: CheckCircle2 },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-20 flex flex-col border-r border-white/10 bg-gradient-to-b from-[#0E7490]/20 via-[#0E0A22]/70 to-[#0E0A22] backdrop-blur-xl transition-[width] duration-300 ease-in-out ${
        collapsed ? 'w-[76px] px-2.5 py-6' : 'w-[220px] px-4 py-6'
      }`}
    >
      {/* Collapse / expand toggle */}
      <button
        type="button"
        onClick={toggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-8 z-30 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#0E0A22]/80 text-white/60 backdrop-blur-md transition hover:border-white/30 hover:text-white hover:shadow-[0_0_12px_rgba(139,92,246,0.5)]"
      >
        <ChevronLeft
          size={14}
          strokeWidth={2}
          className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Logo → dashboard */}
      <Link
        to="/"
        title={collapsed ? 'Dashboard' : undefined}
        className={`mb-7 flex items-center ${collapsed ? 'justify-center' : 'gap-2.5 px-1'}`}
      >
        <img src="/logo.png" alt="Logo" className="h-12 w-12 flex-none rounded-[10px]" />
        <span
          className={`overflow-hidden whitespace-nowrap text-[15px] font-bold tracking-[0.14em] text-white transition-all duration-300 ${
            collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          }`}
        >
          TODO
        </span>
      </Link>

      {/* Primary nav */}
      <nav className="flex flex-col gap-[3px]">
        {NAV.map((item) => {
          const isActive = Boolean(item.active) && pathname === item.href;
          const Icon = item.icon;

          const cls = `relative flex w-full items-center rounded-[10px] text-left text-[13.5px] font-medium transition ${
            collapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'
          } ${
            isActive
              ? 'bg-gradient-to-r from-[#7C3AED]/30 to-transparent text-white'
              : 'text-white/55 hover:bg-white/5 hover:text-white/85'
          }`;

          return (
            <Link
              key={item.label}
              to={item.href}
              title={collapsed ? item.label : undefined}
              className={cls}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-[18px] w-[2px] -translate-y-1/2 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.9)]" />
              )}

              <span className={`flex items-center ${collapsed ? 'gap-0' : 'gap-2.5'}`}>
                <span className="relative shrink-0">
                  {Icon && (
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      className={isActive ? 'drop-shadow-[0_0_6px_rgba(139,92,246,0.9)]' : ''}
                    />
                  )}

                  {/* Collapsed badge dot / mini-number */}
                  {collapsed && item.badge && (
                    <span className="absolute -right-2.5 -top-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[#7C3AED] px-1 text-[8px] font-bold leading-none text-white shadow-[0_0_6px_rgba(124,58,237,0.85)]">
                      {item.badge}
                    </span>
                  )}
                </span>

                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                    collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                  }`}
                >
                  {item.label}
                </span>
              </span>

              {!collapsed && item.badge && (
                <span className="rounded-md bg-[#7C3AED]/30 px-1.5 py-[3px] text-[11px] font-semibold leading-none text-violet-300">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mx-1 my-4 h-px bg-white/10" />

      {/* My Projects label */}
      {!collapsed && (
        <div className="mb-2.5 overflow-hidden whitespace-nowrap px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">
          My Projects
        </div>
      )}

      {/* My Projects list — تأتي من الـ API */}
      <div className={`flex flex-col gap-[2px] ${collapsed ? 'items-center' : ''}`}>
        {projects.map((project, i) => {
          const dot = DOT_COLORS[i % DOT_COLORS.length];
          const projectName = project.name ?? 'Untitled';

          return (
            <div
              key={project.id ?? projectName ?? i}
              title={collapsed ? projectName : undefined}
              className={`flex cursor-pointer items-center rounded-[10px] font-medium text-white/55 transition hover:bg-white/5 hover:text-white/85 ${
                collapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2 text-[13px]'
              }`}
            >
              <span className={`h-[7px] w-[7px] shrink-0 rounded-full ${dot}`} />
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                }`}
              >
                {projectName}
              </span>
            </div>
          );
        })}
      </div>

      {/* User card */}
      <div
        
        className={`mt-auto flex items-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 ${
          collapsed ? 'justify-center px-1.5 py-1.5' : 'gap-2.5 px-2.5 py-2.5'
        }`}
      >
        {displayName}
        <span
          className={`overflow-hidden whitespace-nowrap text-[13px] font-medium text-white transition-all duration-300 ${
            collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          }`}
        >
          {email}
        </span>
      </div>
    </aside>
  );
}
