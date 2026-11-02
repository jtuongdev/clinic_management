// src/examination/services/clinicalRealtime.service.ts
import { examinationApi } from '../api/examination.api';
import type { ServiceOrderDto } from '../types/examination/exam.types';

type LabResultListener = (orders: ServiceOrderDto[]) => void;

class ClinicalRealtimeService {
  private pollingTimers = new Map<number, ReturnType<typeof setInterval>>();
  private listeners = new Map<number, Set<LabResultListener>>();

  /**
   * Đăng ký nhận thông báo kết quả cận lâm sàng theo lượt khám
   */
  subscribeLabResults(luotKhamId: number, callback: LabResultListener): () => void {
    if (!this.listeners.has(luotKhamId)) {
      this.listeners.set(luotKhamId, new Set());
    }
    this.listeners.get(luotKhamId)!.add(callback);

    // Khởi động smart polling (mỗi 8s) để kiểm tra cập nhật kết quả CLS mới
    if (!this.pollingTimers.has(luotKhamId)) {
      const timer = setInterval(async () => {
        try {
          const res = await examinationApi.getServiceOrders(luotKhamId);
          if (res.data?.success && res.data.data) {
            const currentListeners = this.listeners.get(luotKhamId);
            currentListeners?.forEach(cb => cb(res.data.data!));
          }
        } catch {
          // Bỏ qua lỗi kết nối ngầm
        }
      }, 8000);

      this.pollingTimers.set(luotKhamId, timer);
    }

    // Cleanup function
    return () => {
      const set = this.listeners.get(luotKhamId);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.listeners.delete(luotKhamId);
          const timer = this.pollingTimers.get(luotKhamId);
          if (timer) {
            clearInterval(timer);
            this.pollingTimers.delete(luotKhamId);
          }
        }
      }
    };
  }
}

export const clinicalRealtime = new ClinicalRealtimeService();
