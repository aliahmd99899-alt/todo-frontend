import { createContext, useContext, useState, useEffect } from 'react';
import type { Task, CreateTaskPayload, UpdateTask} from '../types/Types'
import {taskAPI } from '../server/todo.api'
import {isoToday} from '../utils/dates'

const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => {
    let cancelled = false;

    taskAPI.getAllTasks()
    .then(data => {
      if (!cancelled) setTasks(data);
    })
    .catch(err => {
      if (!cancelled) console.error(err);
    });

    return () => { cancelled = true; };
  }, []);  // ← مصفوفة فارغة: نُشغّل مرة واحدة فقط عند التحميل
  
  const addTask = async (task: CreateTaskPayload) => {
  try {
    const created = await taskAPI.addTask(task);  // ← الخادم يُرجع المهمة الكاملة
    setTasks(prev => [created, ...prev]);         // ← حدّث الحالة المحلية
  } catch (err) {
    console.error('Failed to add task', err);
    throw err;  // ← أعِد الرمي ليتمكن المستدعي من التعامل معه
  }
};

  const toggleTask = (id:string) =>
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.done) {
          return { ...t, done: false, completedAt: null };
        }
        return { ...t, done: true, completedAt: isoToday() };
      })
    );

  const archiveTask = async (id: string) => {
    try {
    const updated = await taskAPI.updateTask(id, { archived: true });
    setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
    } catch (err) {
      console.error('Failed to archive task', err);
    throw err;
    }
  };

  const unarchiveTask = async (id: string) => {
    try {
      const updated = await taskAPI.updateTask(id, { archived: false });
      setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
    } catch (err) {
      console.error('Failed to unarchive task', err);
      throw err;
    }
  };
  
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