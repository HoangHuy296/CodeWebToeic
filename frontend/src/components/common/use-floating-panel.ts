import { useCallback, useEffect, useRef, useState } from 'react';

const CLOSE_DELAY_MS = 140;

export function useFloatingPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openPanel = useCallback(() => {
    clearCloseTimer();
    setIsOpen(true);
  }, [clearCloseTimer]);

  const closePanel = useCallback(() => {
    clearCloseTimer();
    setIsOpen(false);
  }, [clearCloseTimer]);

  const togglePanel = useCallback(() => {
    clearCloseTimer();
    setIsOpen((current) => !current);
  }, [clearCloseTimer]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
    }, CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  return {
    isOpen,
    openPanel,
    closePanel,
    togglePanel,
    wrapperProps: {
      onMouseEnter: clearCloseTimer,
      onMouseLeave: scheduleClose,
    },
  };
}
