import { useCallback, useEffect, useState } from 'react';
import { projectAPI } from '../server/todo.api';
import type { Project } from '../types/Types';

const getErrorMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
  (err instanceof Error ? err.message : fallback);

function extractList(res: unknown): Project[] {
  if (Array.isArray(res)) return res as Project[];
  if (res && typeof res === 'object' && 'data' in res) {
    const data = (res as { data: unknown }).data;
    if (Array.isArray(data)) return data as Project[];
  }
  return [];
}

export function useProjects(open: boolean) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    setLoading(true);
    setError('');

    projectAPI
      .getAllProjects()
      .then((res) => {
        if (cancelled) return;
        const list = extractList(res);
        setProjects(list);
        setSelectedProjectId((prev) =>
          list.some((p) => p._id === prev) ? prev : list[0]?._id ?? '',
        );
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Failed to load projects.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, retryKey]);

  const retry = useCallback(() => setRetryKey((k) => k + 1), []);

  const addProject = useCallback((project: Project) => {
    setProjects((prev) => [...prev, project]);
    setError('');
    if (project._id) setSelectedProjectId(project._id);
  }, []);

  return {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    loading,
    error,
    retry,
    addProject,
  };
}