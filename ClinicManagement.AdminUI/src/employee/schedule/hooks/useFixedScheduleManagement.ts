import { useCallback, useEffect, useState } from 'react';
import { App } from 'antd';
import { scheduleApi } from '../api/schedule.api';
import type { CreateFixedScheduleRequest, FixedSchedule } from '../types/schedule.types';

const apiError = (error: unknown): string => {
  const data = (error as {
    response?: { data?: { message?: string; detail?: string; errors?: string[] } };
  })?.response?.data;
  return data?.message
    || data?.detail
    || data?.errors?.join(', ')
    || 'Thao tác lịch làm việc thất bại.';
};

interface FixedScheduleManagementOptions {
  selectedKhoa?: number;
  onReload: () => Promise<void>;
}

export const useFixedScheduleManagement = ({
  selectedKhoa,
  onReload,
}: FixedScheduleManagementOptions) => {
  const { message, modal } = App.useApp();
  const [fixedSchedules, setFixedSchedules] = useState<FixedSchedule[]>([]);
  const [fixedLoading, setFixedLoading] = useState(false);

  const loadFixedSchedules = useCallback(async (): Promise<void> => {
    if (!selectedKhoa) {
      setFixedSchedules([]);
      return;
    }
    setFixedLoading(true);
    try {
      const response = await scheduleApi.getFixed({ maKhoa: selectedKhoa });
      setFixedSchedules(response.data.data || []);
    } catch (error) {
      message.error(apiError(error));
    } finally {
      setFixedLoading(false);
    }
  }, [message, selectedKhoa]);

  useEffect(() => {
    loadFixedSchedules();
  }, [loadFixedSchedules]);

  const createFixed = async (data: CreateFixedScheduleRequest): Promise<void> => {
    try {
      await scheduleApi.createFixed(data);
      message.success('Tạo lịch cố định thành công.');
      await loadFixedSchedules();
    } catch (error) {
      message.error(apiError(error));
      throw error;
    }
  };

  const bulkCreateFixed = async (items: CreateFixedScheduleRequest[]): Promise<void> => {
    try {
      const response = await scheduleApi.bulkCreateFixed({ items });
      const result = response.data.data;
      message.success(`Đã tạo ${result?.createdCount || 0} lịch cố định; bỏ qua ${result?.skippedCount || 0} bản ghi.`);
      await loadFixedSchedules();
    } catch (error) {
      message.error(apiError(error));
      throw error;
    }
  };

  const previewGenerate = (tuNgay: string, denNgay: string) =>
    scheduleApi.previewGenerate({ tuNgay, denNgay, maKhoa: selectedKhoa });

  const updateFixed = async (id: number, data: CreateFixedScheduleRequest): Promise<void> => {
    try {
      await scheduleApi.updateFixed(id, data);
      message.success('Cập nhật lịch cố định thành công.');
      await loadFixedSchedules();
    } catch (error) {
      message.error(apiError(error));
      throw error;
    }
  };

  const removeFixed = (id: number): void => {
    modal.confirm({
      title: 'Xóa lịch cố định?',
      content: 'Lịch ngày đã sinh trước đó vẫn được giữ nguyên.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await scheduleApi.removeFixed(id);
          message.success('Đã xóa lịch cố định.');
          await loadFixedSchedules();
        } catch (error) {
          message.error(apiError(error));
        }
      },
    });
  };

  const generateSchedules = async (tuNgay: string, denNgay: string): Promise<void> => {
    try {
      const response = await scheduleApi.generate({ tuNgay, denNgay, maKhoa: selectedKhoa });
      message.success(`Đã sinh ${response.data.data || 0} lịch ngày.`);
      await onReload();
    } catch (error) {
      message.error(apiError(error));
    }
  };

  const bulkCreate = async (data: Parameters<typeof scheduleApi.bulkCreate>[0]): Promise<void> => {
    try {
      const response = await scheduleApi.bulkCreate(data);
      message.success(`Đã tạo ${response.data.data?.createdCount || 0} lịch hàng loạt.`);
      await onReload();
    } catch (error) {
      message.error(apiError(error));
      throw error;
    }
  };

  return {
    fixedSchedules,
    fixedLoading,
    loadFixedSchedules,
    createFixed,
    bulkCreateFixed,
    previewGenerate,
    updateFixed,
    removeFixed,
    generateSchedules,
    bulkCreate,
  };
};
