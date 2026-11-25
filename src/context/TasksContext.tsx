import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Task, CreateTaskPayload } from '../types/Types';
import { taskAPI } from '../server/todo.api';
import { isoToday } from '../utils/dates';

type TasksContextValue = {
  tasks: Task[];
  addTask: (task: CreateTaskPayload) => Promise<void>;
  toggleTask: (id: string) => void;
  archiveTask: (id: string) => Promise<void>;
  unarchiveTask: (id: string) => Promise<void>;
};

const TasksContext = createContext<TasksContextValue | null>(null);

function unwrapTasks(res: Task[] | { data: Task[] }): Task[] {
  if (Array.isArray(res)) return res;
  if (res && typeof res === 'object' && 'data' in res) {
    return unwrapTasks(res.data as Task[] | { data: Task[] });
  }
  return [];
}

function unwrapTask(res: Task | { data: Task }): Task {
  if (res && typeof res === 'object' && 'data' in res) {
    return unwrapTask((res as { data: Task | { data: Task } }).data);
  }
  return res as Task;
}

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    let cancelled = false;

    taskAPI
      .getAllTasks()
      .then((res) => {
        if (!cancelled) setTasks(unwrapTasks(res));
      })
      .catch((err) => {
        if (!cancelled) console.error(err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const addTask = useCallback(async (task: CreateTaskPayload) => {
    try {
      const res = await taskAPI.addTask(task);
      const created = unwrapTask(res);
      setTasks((prev) => [created, ...prev]);
    } catch (err) {
      console.error('Failed to add task', err);
      throw err;
    }
  }, []);

  const toggleTask = useCallback(
    async (id: string) => {
      const target = tasks.find((t) => t.id === id);
      if (!target) return;

      const nextDone = !target.done;
      const optimisticCompletedAt = nextDone ? isoToday() : null;

      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, done: nextDone, completedAt: optimisticCompletedAt } : t
        )
      );

      try {
        const res = await taskAPI.updateTask(id, { done: nextDone });
        const updated = unwrapTask(res);
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...updated,
                  project: updated.project ?? t.project,
                  completedAt: updated.completedAt ?? optimisticCompletedAt,
                }
              : t
          )
        );
      } catch (err) {
        setTasks((prev) => prev.map((t) => (t.id === id ? target : t)));
        console.error('Failed to toggle task', err);
      }
    },
    [tasks]
  );

  const archiveTask = useCallback(async (id: string) => {
    try {
      const res = await taskAPI.updateTask(id, { archived: true });
      const updated = unwrapTask(res);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error('Failed to archive task', err);
      throw err;
    }
  }, []);

  const unarchiveTask = useCallback(async (id: string) => {
    try {
      const res = await taskAPI.updateTask(id, { archived: false });
      const updated = unwrapTask(res);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error('Failed to unarchive task', err);
      throw err;
    }
  }, []);

  return (
    <TasksContext.Provider value={{ tasks, addTask, toggleTask, archiveTask, unarchiveTask }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used within TasksProvider');
  return ctx;
}