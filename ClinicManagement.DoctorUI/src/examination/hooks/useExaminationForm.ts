import { useEffect, useState } from 'react';
import type {
  ExaminationFormState,
  ExamDetail,
  UseExaminationFormOptions,
  SaveExaminationRequest,
  ExaminationDetailResponse,
  TienSuBenhForm,
} from '../types/examination';
import { examinationApi } from '../api/examination.api';

const toNullableFloat = (v: string) => (v ? parseFloat(v) || null : null);
const toNullableInt = (v: string) => (v ? parseInt(v, 10) || null : null);
const formatNumber = (v?: number | null) => (v == null ? '' : String(v));

const createFormStateFromResponse = (res: ExaminationDetailResponse): ExaminationFormState => {
  const tienSuBenhs: TienSuBenhForm[] = (res.tienSuBenhs ?? []).map(item => ({
    id: item.id,
    loaiTienSu: String(item.loaiTienSu),
    ten: item.ten ?? '',
    ghiChu: item.ghiChu ?? '',
  }));
  const first = tienSuBenhs[0];
  const sh = res.sinhHieu;
  return {
    sinhHieuId: sh?.id,
    tienSuBenhId: first?.id,
    lyDoKham: res.lyDoKham ?? '',
    loaiTienSu: first?.loaiTienSu ?? '1',
    tenTienSu: first?.ten ?? '',
    ghiChuTienSu: res.ghiChuTienSu ?? first?.ghiChu ?? '',
    tienSuBenhs,
    nhietDo: formatNumber(sh?.nhietDo),
    mach: formatNumber(sh?.mach),
    huyetApTamThu: formatNumber(sh?.huyetApTamThu),
    huyetApTamTruong: formatNumber(sh?.huyetApTamTruong),
    spo2: formatNumber(sh?.spO2),
    canNang: formatNumber(sh?.canNang),
    chieuCao: formatNumber(sh?.chieuCao),
  };
};

const createFormStateFromProps = (data: ExamDetail): ExaminationFormState => {
  const { reason, history, vitals, tienSuBenh } = data.examination;
  const [sys, dia] = vitals.bloodPressure?.split('/') ?? [];
  const fallback: TienSuBenhForm[] = tienSuBenh ? [{
    id: tienSuBenh.id,
    loaiTienSu: tienSuBenh.loaiTienSu,
    ten: tienSuBenh.ten,
    ghiChu: tienSuBenh.ghiChu ?? '',
  }] : [];
  const first = fallback[0];
  return {
    sinhHieuId: vitals.id,
    tienSuBenhId: first?.id,
    lyDoKham: reason || '',
    loaiTienSu: first?.loaiTienSu || '1',
    tenTienSu: first?.ten || history || '',
    ghiChuTienSu: first?.ghiChu || '',
    tienSuBenhs: fallback,
    nhietDo: vitals.temperature || '',
    mach: vitals.pulse || '',
    huyetApTamThu: sys || '',
    huyetApTamTruong: dia || '',
    spo2: vitals.spo2 || '',
    canNang: vitals.canNang || '',
    chieuCao: vitals.chieuCao || '',
  };
};

export const useExaminationForm = ({ data, luotKhamId, onSaveSuccess }: UseExaminationFormOptions) => {
  const [form, setForm] = useState<ExaminationFormState>(() => createFormStateFromProps(data));
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loaiTienSuOptions, setLoaiTienSuOptions] = useState<{ value: string; label: string; description: string }[]>([]);

  // Load options
  useEffect(() => {
    examinationApi.getLoaiTienSuOptions()
      .then(res => res.data?.success && setLoaiTienSuOptions(res.data.data ?? []))
      .catch(() => setLoaiTienSuOptions([]));
  }, []);

  const fetchData = async (id: number) => {
    setIsLoading(true);
    setSaveError(null);
    try {
      const res = await examinationApi.getExaminationDetail(id);
      if (res.data?.success && res.data.data) {
        setForm(createFormStateFromResponse(res.data.data));
      }
    } catch (e) {
      console.error('Lỗi tải dữ liệu khám:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (luotKhamId && luotKhamId > 0) {
      fetchData(luotKhamId);
    } else {
      setForm(createFormStateFromProps(data));
    }
  }, [luotKhamId, data]);

  const handleFieldChange = (field: keyof ExaminationFormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleAddTienSu = () => {
    const ten = form.tenTienSu.trim();
    if (!ten) {
      setSaveError('Vui lòng nhập tên tiền sử bệnh.');
      return;
    }
    setForm(prev => ({
      ...prev,
      tienSuBenhs: [...prev.tienSuBenhs, {
        id: undefined,
        loaiTienSu: prev.loaiTienSu || '1',
        ten,
        ghiChu: prev.ghiChuTienSu.trim(),
      }],
      tenTienSu: '',
      ghiChuTienSu: '',
    }));
    setSaveError(null);
  };

  const handleEditTienSu = (tienSu: TienSuBenhForm) => {
    setForm(prev => ({
      ...prev,
      tienSuBenhId: tienSu.id,
      loaiTienSu: tienSu.loaiTienSu,
      tenTienSu: tienSu.ten,
      ghiChuTienSu: tienSu.ghiChu ?? '',
    }));
    setSaveError(null);
  };

  const handleDeleteTienSu = (index: number) => {
    setForm(prev => ({
      ...prev,
      tienSuBenhs: prev.tienSuBenhs.filter((_, i) => i !== index),
    }));
    setSaveError(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleCancelEdit = () => {
    if (luotKhamId && luotKhamId > 0) {
      fetchData(luotKhamId);
    } else {
      setForm(createFormStateFromProps(data));
    }
    setIsEditing(false);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!luotKhamId || luotKhamId <= 0) {
      setSaveError('Không tìm thấy lượt khám. Vui lòng chọn bệnh nhân.');
      return;
    }

    const payload: SaveExaminationRequest = {
      lyDoKham: form.lyDoKham.trim(),
      ghiChuTienSu: form.ghiChuTienSu.trim(),
      tienSuBenhs: form.tienSuBenhs.map(item => ({
        id: item.id,
        loaiTienSu: item.loaiTienSu,
        ten: item.ten.trim(),
        ghiChu: item.ghiChu?.trim() ?? '',
      })),
      sinhHieu: {
        id: form.sinhHieuId,
        nhietDo: toNullableFloat(form.nhietDo),
        mach: toNullableInt(form.mach),
        huyetApTamThu: toNullableInt(form.huyetApTamThu),
        huyetApTamTruong: toNullableInt(form.huyetApTamTruong),
        spO2: toNullableFloat(form.spo2),
        canNang: toNullableFloat(form.canNang),
        chieuCao: toNullableFloat(form.chieuCao),
      },
    };

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await examinationApi.saveExamination(luotKhamId, payload);
      if (res.data?.success && res.data.data) {
        await fetchData(luotKhamId);
        setIsEditing(false);
        setSaveSuccess(true);
        onSaveSuccess?.(res.data.data);
      } else {
        setSaveError(res.data?.message || 'Lưu thông tin khám bệnh thất bại');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      setSaveError(error?.response?.data?.message || error.message || 'Lỗi khi lưu');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formState: form,
    isLoading,
    isSaving,
    isEditing,
    saveError,
    saveSuccess,
    loaiTienSuOptions,
    handleFieldChange,
    handleSave,
    handleEdit,
    handleCancelEdit,
    handleAddTienSu,
    handleEditTienSu,
    handleDeleteTienSu,
  };
};