import { useState, useEffect, useRef } from 'react';

interface AutoSaveOptions<T> {
  keyPrefix?: string;
  patientId?: number | string | null;
  data: T;
  intervalMs?: number;
  enabled?: boolean;
}

export function useClinicalAutoSave<T>({
  keyPrefix = 'CLINICAL_DRAFT_',
  patientId,
  data,
  intervalMs = 25000, // 25 seconds
  enabled = true,
}: AutoSaveOptions<T>) {
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const dataRef = useRef(data);
  dataRef.current = data;

  const storageKey = patientId ? `${keyPrefix}${patientId}` : null;

  // Auto-save interval
  useEffect(() => {
    if (!enabled || !storageKey) return;

    const interval = setInterval(() => {
      try {
        setIsSaving(true);
        const payload = JSON.stringify({
          timestamp: new Date().toISOString(),
          data: dataRef.current,
        });
        localStorage.setItem(storageKey, payload);
        const now = new Date();
        const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSavedTime(timeStr);
      } catch (err) {
        console.warn('Auto-save to localStorage failed:', err);
      } finally {
        setIsSaving(false);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [enabled, storageKey, intervalMs]);

  // Method to manually clear draft when exam completes
  const clearDraft = () => {
    if (storageKey) {
      localStorage.removeItem(storageKey);
      setLastSavedTime(null);
    }
  };

  // Method to check if an existing draft exists
  const loadDraft = (): T | null => {
    if (!storageKey) return null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.data as T;
    } catch {
      return null;
    }
  };

  return {
    lastSavedTime,
    isSaving,
    clearDraft,
    loadDraft,
  };
}

export default useClinicalAutoSave;
