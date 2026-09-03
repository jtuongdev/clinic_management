import { useEffect, useState } from 'react';
import { patientWorkspaceApi } from '../api/patientWorkspace.api';
import type {
  ThongTinBenhNhanTrongLuotKhamDto,
  UsePatientWorkspaceOptions,
} from '../types/examination/index.ts';

export const usePatientWorkspace = ({ luotKhamId, fallbackData }: UsePatientWorkspaceOptions) => {
  const [data, setData] = useState<ThongTinBenhNhanTrongLuotKhamDto | null>(
    fallbackData
      ? {
          luotKhamId: fallbackData.luotKhamId ?? 0,
          maLuotKham: fallbackData.maLuotKham ?? '',
          khoa: fallbackData.khoa ?? '',
          phong: fallbackData.phong ?? '',
          trangThai: fallbackData.trangThai ?? '',
          hoTen: fallbackData.hoTen ?? '',
          maBenhNhanNoiBo: fallbackData.maBenhNhanNoiBo ?? '',
          ngaySinh: fallbackData.ngaySinh ?? '',
          gioiTinh: fallbackData.gioiTinh ?? '',
          soCCCD: fallbackData.soCCCD ?? '',
          bhyt: fallbackData.bhyt ?? '',
          diaChi: fallbackData.diaChi ?? '',
          dienThoai: fallbackData.dienThoai ?? '',
        }
      : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!luotKhamId) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await patientWorkspaceApi.getThongTinBenhNhan(luotKhamId);
        const result = response.data;

        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError(result.message || 'Không thể tải thông tin bệnh nhân');
        }
      } catch (err: any) {
        setError(err?.message || 'Lỗi khi tải thông tin bệnh nhân');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [luotKhamId]);

  return { data, loading, error };
};
