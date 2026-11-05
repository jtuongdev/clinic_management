import { useEffect } from 'react';

interface ClinicalHotkeysCallbacks {
  onF2NextPatient?: () => void;
  onF3OrderCls?: () => void;
  onF4OrderRx?: () => void;
  onF7BillingSlip?: () => void;
  onF9PrintRx?: () => void;
  onF12FinishExam?: () => void;
  onEscape?: () => void;
}

export const useClinicalHotkeys = (callbacks: ClinicalHotkeysCallbacks) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing inside an input/textarea and presses alphanumeric keys,
      // but Function keys (F1-F12) should always trigger hospital workflows!
      const isFunctionKey = /^F(1|2|3|4|5|6|7|8|9|10|11|12)$/.test(e.key);

      if (isFunctionKey) {
        // Prevent default browser actions (e.g. F3 search, F12 devtools, F5 refresh)
        if (['F2', 'F3', 'F4', 'F7', 'F9', 'F12'].includes(e.key)) {
          e.preventDefault();
        }
      }

      switch (e.key) {
        case 'F2':
          callbacks.onF2NextPatient?.();
          break;
        case 'F3':
          callbacks.onF3OrderCls?.();
          break;
        case 'F4':
          callbacks.onF4OrderRx?.();
          break;
        case 'F7':
          callbacks.onF7BillingSlip?.();
          break;
        case 'F9':
          callbacks.onF9PrintRx?.();
          break;
        case 'F12':
          callbacks.onF12FinishExam?.();
          break;
        case 'Escape':
          callbacks.onEscape?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [callbacks]);
};

export default useClinicalHotkeys;
