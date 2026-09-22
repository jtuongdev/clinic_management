// src/examination/hooks/useClinicalSession.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { examinationApi } from '../api/examination.api';
import type { SaveExaminationRequest } from '../types/examination/exam.types';

interface UseClinicalSessionProps {
  luotKhamId?: number;
  doctorId: number;
}

export const useClinicalSession = ({ luotKhamId, doctorId }: UseClinicalSessionProps) => {
  const [draftState, setDraftState] = useState<Partial<SaveExaminationRequest>>({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const draftStorageKey = `draft_exam_${doctorId}_${luotKhamId ?? 0}`;

  // 1. Phục hồi dữ liệu nháp từ LocalStorage khi mở ca khám
  useEffect(() => {
    if (!luotKhamId || luotKhamId <= 0) return;
    const cached = localStorage.getItem(draftStorageKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setDraftState(parsed);
      } catch (e) {
        console.error('Lỗi phân tích bản nháp:', e);
      }
    }
  }, [luotKhamId, draftStorageKey]);

  // 2. Cập nhật nháp cục bộ & tự động đồng bộ ngầm sau 1.5s
  const updateDraft = useCallback((updater: (prev: Partial<SaveExaminationRequest>) => Partial<SaveExaminationRequest>) => {
    setDraftState((prev: Partial<SaveExaminationRequest>) => {
      const next = updater(prev);
      if (luotKhamId && luotKhamId > 0) {
        localStorage.setItem(draftStorageKey, JSON.stringify(next));

        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(async () => {
          if (!luotKhamId) return;
          try {
            setIsAutoSaving(true);
            if (next.lyDoKham?.trim()) {
              await examinationApi.saveExamination(luotKhamId, next as SaveExaminationRequest);
              setLastSavedTime(new Date());
            }
          } catch (err) {
            console.warn('Auto-save background sync warning:', err);
          } finally {
            setIsAutoSaving(false);
          }
        }, 1500);
      }

      return next;
    });
  }, [luotKhamId, draftStorageKey]);

  // 3. Hoàn tất ca khám an toàn (Chống Double Submit)
  const completeAndLockSession = async (chuKySo: string, lyDo: string) => {
    if (isSubmitting || !luotKhamId) return null;

    setIsSubmitting(true);
    try {
      const response = await examinationApi.completeAndLockExam(luotKhamId, {
        chuKySo,
        lyDo,
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Hoàn tất và khóa hồ sơ thất bại.');
      }

      // Xóa bản nháp sau khi ca khám hoàn tất thành công
      localStorage.removeItem(draftStorageKey);
      return response.data.data;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error.message || 'Lỗi xử lý hoàn tất ca khám.';
      throw new Error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearDraft = useCallback(() => {
    localStorage.removeItem(draftStorageKey);
    setDraftState({});
  }, [draftStorageKey]);

  return {
    draftState,
    updateDraft,
    isAutoSaving,
    isSubmitting,
    lastSavedTime,
    completeAndLockSession,
    clearDraft,
  };
};
