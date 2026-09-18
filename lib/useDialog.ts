'use client';
import { useEffect, useRef, type RefObject } from 'react';
export function useDialog(
  ref: RefObject<HTMLDialogElement | null>,
  open: boolean,
  onClose: () => void,
) {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!open) {
      if (el.open) el.close();
      return;
    }
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    el.showModal();
    document.body.style.overflow = 'hidden';
    const cancel = (e: Event) => {
      e.preventDefault();
      closeRef.current();
    };
    const click = (e: MouseEvent) => {
      if (e.target === el) {
        const r = el.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)
          closeRef.current();
      }
    };
    el.addEventListener('cancel', cancel);
    el.addEventListener('click', click);
    return () => {
      el.removeEventListener('cancel', cancel);
      el.removeEventListener('click', click);
      el.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open, ref]);
}
