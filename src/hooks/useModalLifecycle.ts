import { useEffect, useRef, useState } from 'react';

type Options = {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  blocked?: boolean;
};

export function useModalLifecycle({ open, onClose, onReset, inputRef, blocked = false }: Options) {
  const [entered, setEntered] = useState(false);

  const onResetRef = useRef(onReset);
  onResetRef.current = onReset;

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    onResetRef.current();
    const focusId = setTimeout(() => inputRef.current?.focus(), 60);
    const rafId = requestAnimationFrame(() => setEntered(true));
    return () => {
      clearTimeout(focusId);
      cancelAnimationFrame(rafId);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !blocked) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, blocked]);

  return { entered };
}