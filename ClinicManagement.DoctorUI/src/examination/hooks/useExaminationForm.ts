import { useEffect, useState } from 'react';
import type {
  ExaminationFormState,
  ExamDetail,
  UseExaminationFormOptions,
} from '../types/examination.types';
import {
  examinationApi,
} from '../api/examination.api';
import type { SaveExaminationRequest } from '../types/examination.types';

const normalizeNumericString = (value?: string) => {
  if (!value) return '';
  const match = String(value).match(/-?\d*\.?\d+/);
  return match ? match[0] : '';
};

const createInitialFormState = (data: ExamDetail): ExaminationFormState => {
  const { reason, history, vitals, tienSuBenh } = data.examination;
  const [huyetApTamThu, huyetApTamTruong] = vitals.bloodPressure?.split('/') ?? [];

  return {
    sinhHieuId: vitals.id,
    tienSuBenhId: tienSuBenh?.id,
    lyDoKham: reason || '',
    loaiTienSu: tienSuBenh?.loaiTienSu || 'BENH_NEN',
    tenTienSu: tienSuBenh?.ten || history || '',
    nhietDo: normalizeNumericString(vitals.temperature),
    mach: normalizeNumericString(vitals.pulse),
    huyetApTamThu: normalizeNumericString(huyetApTamThu),
    huyetApTamTruong: normalizeNumericString(huyetApTamTruong),
    spo2: normalizeNumericString(vitals.spo2),
    canNang: normalizeNumericString(vitals.canNang),
    chieuCao: normalizeNumericString(vitals.chieuCao),
  };
};

const toNullableFloat = (value: string) => value ? Number.parseFloat(value) : null;
const toNullableInt = (value: string) => value ? Number.parseInt(value, 10) : null;

export const useExaminationForm = ({
  data,
  luotKhamId,
  onSaveSuccess,
}: UseExaminationFormOptions) => {
  const [formState, setFormState] = useState<ExaminationFormState>(() => createInitialFormState(data));
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setFormState(createInitialFormState(data));
    setIsEditing(false);
    setSaveError(null);
    setSaveSuccess(false);
  }, [data]);

  const handleFieldChange = (field: keyof ExaminationFormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaveError(null);
    setSaveSuccess(false);
  };

  const [loaiTienSuOptions, setLoaiTienSuOptions] = useState<Array<{ value: string; label: string; description: string }>>([]);

  useEffect(() => {
    examinationApi.getLoaiTienSuOptions()
      .then((response) => {
        if (response.data?.success) {
          setLoaiTienSuOptions(response.data.data ?? []);
        }
      })
      .catch(() => setLoaiTienSuOptions([]));
  }, []);

  const handleSave = async () => {
    if (!luotKhamId || luotKhamId <= 0) {
      setSaveError('Không tìm thấy lượt khám. Vui lòng chọn bệnh nhân.');
      return;
    }

    const tenTienSu = formState.tenTienSu.trim();
    const payload: SaveExaminationRequest = {
      lyDoKham: formState.lyDoKham.trim(),
      ghiChuTienSu: '',
      tienSuBenhs: tenTienSu
        ? [{
            id: formState.tienSuBenhId,
            loaiTienSu: formState.loaiTienSu,
            ten: tenTienSu,
            ghiChu: '',
          }]
        : [],
      sinhHieu: {
        id: formState.sinhHieuId,
        nhietDo: toNullableFloat(formState.nhietDo),
        mach: toNullableInt(formState.mach),
        huyetApTamThu: toNullableInt(formState.huyetApTamThu),
        huyetApTamTruong: toNullableInt(formState.huyetApTamTruong),
        spO2: toNullableFloat(formState.spo2),
        canNang: toNullableFloat(formState.canNang),
        chieuCao: toNullableFloat(formState.chieuCao),
      },
    };

    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const response = await examinationApi.saveExamination(luotKhamId, payload);

      if (response.data?.success) {
        const savedResult = response.data.data;
        const savedHistory = savedResult.tienSuBenhs?.find((item) => item.ten === tenTienSu);

        setFormState((prev) => ({
          ...prev,
          sinhHieuId: savedResult.sinhHieu?.id ?? prev.sinhHieuId,
          tienSuBenhId: savedHistory?.id ?? prev.tienSuBenhId,
        }));
        setIsEditing(false);
        setSaveSuccess(true);
        onSaveSuccess?.(savedResult);
      } else {
        setSaveError(response.data?.message || 'Lưu thông tin khám bệnh thất bại');
      }
    } catch (error) {
      console.error('Save examination error:', error);
      const message = error instanceof Error ? error.message : 'Lỗi khi lưu thông tin khám bệnh';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleCancelEdit = () => {
    setFormState(createInitialFormState(data));
    setIsEditing(false);
    setSaveError(null);
    setSaveSuccess(false);
  };

  return {
    formState,
    isSaving,
    isEditing,
    saveError,
    saveSuccess,
    loaiTienSuOptions,
    handleFieldChange,
    handleSave,
    handleEdit,
    handleCancelEdit,
  };
};
