import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import PendingTasks from './pages/PendingTasks';
import Completed from './pages/Completed';
import AddTaskModal from './components/AddTaskModal';
import AuthRequired from './components/AuthRequired';   // ✅ المسار الصحيح

export default function App() {
  // ✅ modal state محلي بدلاً من openModal غير الموجود
  const [modalOpen, setModalOpen] = useState(false);

  // ✅ isAuthenticated كـ state تفاعلي
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!localStorage.getItem('access_token')
  );

  // تحديث عند تغيّر التوكن من تبويب آخر أو عند العودة للتبويب
  useEffect(() => {
    const sync = () => setIsAuthenticated(!!localStorage.getItem('access_token'));
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  // اختصار N
  useEffect(() => {
    if (!isAuthenticated) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'n' && e.key !== 'N') return;
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (modalOpen) return;
      e.preventDefault();
      setModalOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen, isAuthenticated]);

  // ✅ Routes دائماً موجودة، وحماية كل صفحة على حدة
  return (
    <>
      <Routes>
        <Route path="/"          element={isAuthenticated ? <Dashboard />   : <AuthRequired />} />
        <Route path="/pending"   element={isAuthenticated ? <PendingTasks /> : <AuthRequired />} />
        <Route path="/completed" element={isAuthenticated ? <Completed />   : <AuthRequired />} />
        <Route path="/login"     element={<AuthRequired />} />
        <Route path="/register"  element={<AuthRequired />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>

      {isAuthenticated && (
        <AddTaskModal open={modalOpen} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}