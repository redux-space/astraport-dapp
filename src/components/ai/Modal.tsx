'use client';

import React, { useCallback, useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  /** id used to associate the dialog with its heading for screen readers. */
  titleId: string;
  children: React.ReactNode;
  /** Optional footer rendered beneath the scrollable body. */
  footer?: React.ReactNode;
  /** Max width class for the panel. Defaults to a comfortable reading width. */
  maxWidthClass?: string;
}

/** Selectors for the focusable elements a focus-trap needs to consider. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal dialog: focus is trapped while open, Esc closes, the backdrop
 * is click-dismissable, and focus returns to the previously-focused element on
 * close. Mirrors the app's ConnectWalletModal dialog behaviour. The panel adapts
 * to small screens (near-full width with vertical scrolling for tall content).
 */
export const Modal: React.FC<Props> = ({
  open,
  onClose,
  title,
  titleId,
  children,
  footer,
  maxWidthClass = 'max-w-2xl',
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      restoreFocusRef.current?.focus?.();
    };
  }, [open, handleClose]);

  // Move focus into the panel when it opens.
  useEffect(() => {
    if (open && panelRef.current) {
      const target = panelRef.current.querySelector<HTMLElement>(FOCUSABLE);
      target?.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        className={`relative flex max-h-[90vh] w-full ${maxWidthClass} flex-col rounded-2xl bg-white shadow-2xl dark:bg-gray-800`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
          <h2
            id={titleId}
            className="text-lg font-bold text-gray-900 dark:text-white"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="border-t border-gray-100 px-6 py-4 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
