import { useState } from 'react';
import { Form, message } from 'antd';
import { patientApi } from '../api/patient.api';
import { CreateBenhNhanRequest } from '../type/create.patient.type';
import dayjs from 'dayjs';

// ==============================
// MAP: Giới tính (frontend number -> backend enum string)
// ==============================
const gioiTinhMap: Record<number, 'M' | 'F' | 'O'> = {
  1: 'M',
  2: 'F',
  3: 'O',
};

// ==============================
// MAP: Loại bảo hiểm (frontend string -> backend enum number)
// ==============================
const loaiBaoHiemMap: Record<string, number> = {
  BHYT: 1,
  BAO_HIEM_SUC_KHOE_TU_NHAN: 2,
  BAO_HIEM_TAI_NAN: 3,
  KHAC: 4,
};

// ==============================
// MAP: Loại tiền sử (frontend string -> backend enum number)
// ==============================
const loaiTienSuMap: Record<string, number> = {
  BENH_NEN: 1,
  DI_UNG: 2,
  PHAU_THUAT: 3,
  TIEN_SU_GIA_DINH: 4,
  THOI_QUEN_SINH_HOAT: 5,
};

export const usePatientForm = (
  defaultCoSoId: number,
  onSuccess?: () => void
) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Build payload từ form values
      const payload: CreateBenhNhanRequest = {
        ho: values.ho,
        ten: values.ten,
        ngaySinh: values.ngaySinh.format('YYYY-MM-DD'),
        gioiTinh: gioiTinhMap[values.gioiTinh] || 'M',
        dienThoai: values.dienThoai,
        email: values.email || '',
        soCCCD: values.soCCCD || '',
        diaChi: values.diaChi || '',
        nguoiLienHeTen: values.nguoiLienHeTen || '',
        nguoiLienHeDienThoai: values.nguoiLienHeDienThoai || '',
        maCoSo: values.maCoSo || defaultCoSoId,
        maKhoa: values.maKhoa,
        maBacSi: values.maBacSi ?? undefined,
        maPhongKham: values.maPhongKham ?? undefined,
        baoHiem: values.baoHiem
          ? {
              loaiBaoHiem: loaiBaoHiemMap[values.baoHiem.loaiBaoHiem],
              tenNhaCungCap: values.baoHiem.tenNhaCungCap,
              soThe: values.baoHiem.soThe,
              ngayBatDau: values.baoHiem.ngayBatDau.toDate(),
              ngayKetThuc: values.baoHiem.ngayKetThuc.toDate(),
              mucHuong: values.baoHiem.mucHuong,
            }
          : undefined,
        tienSuBenhs: values.tienSuList
          ? values.tienSuList.map((ts: any) => ({
              loaiTienSu: loaiTienSuMap[ts.loaiTienSu],
              ten: ts.ten,
              ghiChu: ts.ghiChu,
            }))
          : [],
      };

      const response = await patientApi.createBenhNhan(payload);

      if (response.data.success) {
        message.success(response.data.message || 'Thêm bệnh nhân thành công!');
        form.resetFields();
        onSuccess?.();
        return { success: true };
      } else {
        message.error(response.data.message || 'Thêm bệnh nhân thất bại');
        return { success: false };
      }
    } catch (error: any) {
      message.error(
        error.response?.data?.message || error.message || 'Có lỗi xảy ra'
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    handleSubmit,
  };
};