import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useAuth } from '../../../Auth/context/AuthProvider';
import type { TreatmentWorkspaceProps } from '../../types/examination/treatment.types';
import type { 
  ServiceCatalogOption, 
  ServiceOrderDto, 
  ServiceOrderRequest, 
  TreatmentSummaryDto,
  DrugSearchResult,
  PrescriptionItemRequest,
  CreatePrescriptionRequest,
  DrugInteractionAlert
} from '../../types/examination/index';
import { useDiagnosisManagement } from '../../hooks/useDiagnosisManagement';
import { examinationApi } from '../../api/examination.api';
import { clinicalRealtime } from '../../services/clinicalRealtime.service';
import { DrugSearchAutocomplete } from '../DrugSearchAutocomplete';
import { PrescriptionTable } from '../PrescriptionTable';

const TreatmentWorkspace: React.FC<TreatmentWorkspaceProps> = ({
  data,
  luotKhamId,
  onSave: _onSave,
  onFinish: _onFinish,
}) => {
  const [activeSubtab, setActiveSubtab] = useState<'diagnosis' | 'services' | 'prescription' | 'results'>('diagnosis');
  const [treatmentSummary, setTreatmentSummary] = useState<TreatmentSummaryDto | null>(null);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrderDto[]>([]);
  const [serviceCatalog, setServiceCatalog] = useState<ServiceCatalogOption[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(0);
  const [isServiceLoading, setIsServiceLoading] = useState(false);
  const [serviceMessage, setServiceMessage] = useState<string | null>(null);
  const { user } = useAuth();
  const currentDoctorId = user?.id ?? 0;

  // Prescription states
  const [prescriptionId, setPrescriptionId] = useState<number | null>(null);
  const [prescriptionStatus, setPrescriptionStatus] = useState<string | null>(null);
  const [selectedDrug, setSelectedDrug] = useState<DrugSearchResult | null>(null);
  const [prescribedDrugs, setPrescribedDrugs] = useState<PrescriptionItemRequest[]>([]);
  const [prescriptionType, setPrescriptionType] = useState<'BHYT' | 'TU_TUC' | 'HON_HOP'>('TU_TUC');
  const [isPrescriptionLoading, setIsPrescriptionLoading] = useState(false);
  const [prescriptionMessage, setPrescriptionMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);
  const [interactionAlerts, setInteractionAlerts] = useState<DrugInteractionAlert[]>([]);
  const isPrescriptionReadOnly = Boolean(prescriptionStatus && prescriptionStatus !== 'TAM');

  // Prescription item form state
  const [itemQuantity, setItemQuantity] = useState<number>(1);
  const [itemUnit, setItemUnit] = useState<string>('Viên');
  const [itemRoute, setItemRoute] = useState<string>('Uống');
  const [itemDose] = useState<string>('1 viên/lần');
  const [itemFrequency, setItemFrequency] = useState<string>('2 lần/ngày');
  const [itemDays, setItemDays] = useState<number>(5);
  const [itemInstruction, setItemInstruction] = useState<string>('Sáng 1 viên sau ăn, Tối 1 viên sau ăn');

  const fetchServiceOrders = async () => {
    if (!luotKhamId) {
      setServiceOrders([]);
      return;
    }

    setIsServiceLoading(true);

    try {
      const response = await examinationApi.getServiceOrders(luotKhamId);
      if (response.data?.success) {
        setServiceOrders(response.data.data ?? []);
      } else {
        setServiceOrders([]);
      }
    } catch {
      setServiceOrders([]);
    } finally {
      setIsServiceLoading(false);
    }
  };

  const fetchPrescription = async () => {
    if (!luotKhamId) return;
    try {
      const res = await examinationApi.getPrescription(luotKhamId);
      if (res.data?.success && res.data.data) {
        const pData = res.data.data;
        if (pData.id) {
          setPrescriptionId(pData.id);
        }
        if (pData.trangThai) {
          setPrescriptionStatus(pData.trangThai);
        }
        if (Array.isArray(pData.items)) {
          const mappedItems: PrescriptionItemRequest[] = pData.items.map((item: any) => ({
            thuocId: Number(item.thuocId ?? item.itemId ?? 0),
            tenThuoc: item.tenThuoc ?? item.itemName ?? '',
            hoatChat: item.hoatChat ?? '',
            soLuong: Number(item.soLuong ?? item.quantity ?? 1),
            donViTinh: item.donViTinh ?? item.baseUnit ?? 'Viên',
            duongDung: item.duongDung ?? 'Uống',
            lieuDung: item.lieuDung ?? '',
            soNgay: Number(item.soNgay ?? 5),
            huongDanSuDung: item.huongDanSuDung ?? item.huongDan ?? '',
            donGia: Number(item.donGia ?? item.donGiaKe ?? 0),
          }));
          setPrescribedDrugs(mappedItems);
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    if (!luotKhamId) {
      setPrescriptionId(null);
      setPrescriptionStatus(null);
      setPrescribedDrugs([]);
      return;
    }

    setPrescriptionId(null);
    setPrescriptionStatus(null);
    setPrescribedDrugs([]);
    setSelectedDrug(null);
    setPrescriptionMessage(null);

    let isMounted = true;

    const fetchSummary = async () => {
      try {
        const response = await examinationApi.getTreatmentSummary(luotKhamId);
        if (isMounted && response.data?.success && response.data.data) {
          setTreatmentSummary(response.data.data);
        }
      } catch {
        // Keep fallback values from props
      }
    };

    const fetchCatalog = async () => {
      try {
        const response = await examinationApi.getServiceCatalog();
        if (!isMounted) return;

        const items = response.data?.data ?? [];
        setServiceCatalog(items);

        if (items.length > 0 && !selectedServiceId) {
          setSelectedServiceId(items[0].id);
        }
      } catch {
        // Ignore catalog failures
      }
    };

    void fetchSummary();
    void fetchServiceOrders();
    void fetchCatalog();
    void fetchPrescription();

    const unsubscribe = luotKhamId
      ? clinicalRealtime.subscribeLabResults(luotKhamId, (orders) => {
          if (isMounted) setServiceOrders(orders);
        })
      : () => {};

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [luotKhamId]);

  // Hook quản lý chẩn đoán
  const {
    diagnoses: diagnosisList,
    formState: diagnosisForm,
    icdOptions,
    isEditing: isDiagnosisEditing,
    isLoading: isDiagnosisLoading,
    setIcdKeyword,
    updateField: updateDiagnosisField,
    startCreate: startCreateDiagnosis,
    startEdit: startEditDiagnosis,
    cancelEdit: cancelEditDiagnosis,
    searchICD,
    selectICD,
    saveDiagnosis,
    deleteDiagnosis,
  } = useDiagnosisManagement({ data, luotKhamId });

  const handleAddService = async () => {
    if (!luotKhamId || !selectedServiceId || currentDoctorId <= 0) {
      setServiceMessage('Thiếu thông tin lượt khám hoặc bác sĩ chỉ định.');
      return;
    }

    setServiceMessage(null);
    setIsServiceLoading(true);

    try {
      const payload: ServiceOrderRequest = {
        maDanhMuc: selectedServiceId,
        maBacSiChiDinh: currentDoctorId,
        maNguoiThucHien: currentDoctorId,
        trangThai: 'DaChiDinh',
        ngayChiDinh: new Date().toISOString(),
        ketLuan: '',
        urlKetQua: '',
      };

      const response = await examinationApi.createServiceOrder(luotKhamId, payload);

      if (response.data?.success) {
        setSelectedServiceId(serviceCatalog[0]?.id ?? 0);
        await fetchServiceOrders();
      } else {
        setServiceMessage(response.data?.message ?? 'Không thể tạo chỉ định dịch vụ.');
      }
    } catch {
      setServiceMessage('Không thể tạo chỉ định dịch vụ. Vui lòng thử lại.');
    } finally {
      setIsServiceLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!luotKhamId) return;

    setIsServiceLoading(true);

    try {
      const response = await examinationApi.deleteServiceOrder(luotKhamId, serviceId);
      if (response.data?.success) {
        await fetchServiceOrders();
      } else {
        setServiceMessage(response.data?.message ?? 'Không thể xóa chỉ định dịch vụ.');
      }
    } catch {
      setServiceMessage('Không thể xóa chỉ định dịch vụ.');
    } finally {
      setIsServiceLoading(false);
    }
  };

  // Input refs for keyboard-first navigation (Search -> Qty -> Instructions -> Enter)
  const searchDrugInputRef = useRef<HTMLInputElement | null>(null);
  const quantityInputRef = useRef<HTMLInputElement | null>(null);
  const instructionInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectDrug = (drug: DrugSearchResult) => {
    setSelectedDrug(drug);
    setItemUnit(drug.donViTinh || 'Viên');
    setItemRoute(drug.duongDung || 'Uống');
    setItemQuantity(1);

    // Tự động nhảy focus sang ô số lượng ngay sau khi chọn thuốc (Keyboard-first chaining)
    setTimeout(() => {
      quantityInputRef.current?.focus();
      quantityInputRef.current?.select();
    }, 60);

    // Check allergy immediately
    const allergy = data?.examination?.tienSuBenh;
    const patientAllergies =
      allergy?.loaiTienSu === '3' || allergy?.loaiTienSu === 'Dị ứng'
        ? [allergy.ten.toLowerCase()]
        : [];

    if (
      drug.hoatChat &&
      patientAllergies.some((a) => a.includes(drug.hoatChat!.toLowerCase()))
    ) {
      setInteractionAlerts((prev) => [
        ...prev,
        {
          type: 'ALLERGY',
          severity: 'CRITICAL',
          title: 'CẢNH BÁO NGUY HIỂM: DỊ ỨNG THUỐC',
          message: `Bệnh nhân có tiền sử dị ứng với hoạt chất ${drug.hoatChat}! Nguy cơ sốc phản vệ.`,
          drugName: drug.tenThuoc || drug.ten,
        },
      ]);
    }
  };

  const handleAddDrugToPrescription = () => {
    if (!selectedDrug) {
      setPrescriptionMessage({ text: 'Vui lòng chọn thuốc từ danh mục.', type: 'danger' });
      return;
    }

    const availableStock = selectedDrug.soLuongKhaDung ?? selectedDrug.tonKho ?? 0;
    if (availableStock <= 0) {
      setPrescriptionMessage({
        text: `Thuốc "${selectedDrug.tenThuoc || selectedDrug.ten}" đã HẾT HÀNG trong kho (tồn = 0). Không thể kê!`,
        type: 'danger',
      });
      return;
    }

    if (itemQuantity > availableStock) {
      setPrescriptionMessage({
        text: `Số lượng kê (${itemQuantity}) vượt quá tồn kho khả dụng (${availableStock} ${selectedDrug.donViTinh}). Tối đa: ${availableStock}.`,
        type: 'danger',
      });
      return;
    }

    if (itemQuantity <= 0) {
      setPrescriptionMessage({ text: 'Số lượng kê phải lớn hơn 0.', type: 'danger' });
      return;
    }

    const newItem: PrescriptionItemRequest = {
      thuocId: selectedDrug.id,
      tenThuoc: selectedDrug.tenThuoc || selectedDrug.ten || '',
      hoatChat: selectedDrug.hoatChat,
      soLuong: itemQuantity,
      donViTinh: itemUnit,
      duongDung: itemRoute,
      lieuDung: itemDose,
      soNgay: itemDays,
      huongDanSuDung: itemInstruction,
      donGia: selectedDrug.gia,
      soLuongKhaDung: availableStock,
    };

    // Gọi API Backend: POST /api/ai/drug-interaction-check
    if (selectedDrug.id) {
      examinationApi
        .checkDrugInteractions({
          patientId: luotKhamId ?? 0,
          medicineIds: [...prescribedDrugs, newItem].map((d) => d.thuocId),
        })
        .then((res) => {
          const result = res.data?.data;
          if (res.data?.success && result?.alerts?.length) {
            setInteractionAlerts(result.alerts);
          }
        })
        .catch(() => {
          // Fallback local check
        });
    }

    setPrescribedDrugs((prev) => [...prev, newItem]);
    setSelectedDrug(null);
    setItemQuantity(1);
    setPrescriptionMessage({
      text: `Đã thêm thuốc "${newItem.tenThuoc}" vào đơn.`,
      type: 'success',
    });
    setTimeout(() => setPrescriptionMessage(null), 3000);

    // Tự động focus quay lại ô tìm kiếm thuốc để bác sĩ tiếp tục gõ mà không cần dùng chuột
    setTimeout(() => {
      searchDrugInputRef.current?.focus();
    }, 80);
  };

  const handleRemoveDrug = (index: number) => {
    setPrescribedDrugs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSavePrescription = async () => {
    if (isPrescriptionLoading) return;
    if (!luotKhamId || prescribedDrugs.length === 0) {
      alert('Vui lòng thêm ít nhất một thuốc vào đơn trước khi lưu.');
      return;
    }

    if (prescriptionStatus && prescriptionStatus !== 'TAM') {
      alert(`Đơn thuốc này đã ở trạng thái "${prescriptionStatus}", không thể chỉnh sửa.`);
      return;
    }

    setIsPrescriptionLoading(true);
    setPrescriptionMessage(null);
    try {
      const payload: CreatePrescriptionRequest = {
        luotKhamId,
        loaiDonThuoc: prescriptionType,
        ghiChu: prescriptionType,
        items: prescribedDrugs.map(item => ({
          itemId: item.thuocId,
          soLuongKe: item.soLuong,
          donViTinh: item.donViTinh,
          donGiaKe: item.donGia,
          lieuDung: item.lieuDung,
          tanSuat: item.lieuDung,
          soNgay: item.soNgay,
          huongDan: item.huongDanSuDung,
        })),
      };
      const res = await examinationApi.createPrescription(luotKhamId, payload);
      if (res.data?.success) {
        if (res.data.data?.id) {
          setPrescriptionId(res.data.data.id);
        }
        if (res.data.data?.trangThai) {
          setPrescriptionStatus(res.data.data.trangThai);
        }
        const isUpdate = res.data.data?.isUpdated || Boolean(prescriptionId);
        setPrescriptionMessage({
          text: isUpdate ? 'Cập nhật đơn thuốc thành công!' : 'Lưu đơn thuốc thành công!',
          type: 'success',
        });
      } else {
        setPrescriptionMessage({ text: res.data?.message || 'Không thể lưu đơn thuốc.', type: 'danger' });
      }
    } catch (error: any) {
      console.error('Lỗi khi lưu đơn thuốc:', error);
      const errorMsg = error?.response?.data?.message 
        || error?.response?.data?.detail 
        || (typeof error?.response?.data === 'string' ? error.response.data : null)
        || error.message 
        || 'Lưu đơn thuốc thất bại. Vui lòng kiểm tra lại tồn kho và thông tin thuốc.';
      setPrescriptionMessage({ text: `Lỗi: ${errorMsg}`, type: 'danger' });
    } finally {
      setIsPrescriptionLoading(false);
      setTimeout(() => setPrescriptionMessage(null), 6000);
    }
  };

  const servicesList = serviceOrders.length > 0
    ? serviceOrders.map((service) => ({
        name: service.tenDichVu,
        qty: 1,
        status: service.trangThai,
        time: service.ngayChiDinh ? new Date(service.ngayChiDinh).toLocaleString('vi-VN') : '---',
      }))
    : (data?.treatment?.services ?? []);

  const visitSummary = useMemo(() => ({
    visit: treatmentSummary?.maLuotKham ?? data?.visit ?? '---',
    department: treatmentSummary?.khoa ?? data?.department ?? '---',
    room: treatmentSummary?.phong ?? data?.room ?? '---',
    status: treatmentSummary?.trangThai ?? data?.status ?? 'Chưa bắt đầu',
  }), [treatmentSummary, data]);

  const renderEmptyState = (message: string) => (
    <div className="empty" style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '4px' }}>
      <i className="fa-solid fa-file-medical" style={{ display: 'block', fontSize: '24px', marginBottom: '8px', color: '#b3bec9' }}></i>
      {message}
    </div>
  );

  return (
    <div
      className="tab-panel active"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {/* Tabs phụ */}
      <div className="subtabs">
        <button className={`subtab ${activeSubtab === 'diagnosis' ? 'active' : ''}`} onClick={() => setActiveSubtab('diagnosis')}>
          <i className="fa-solid fa-stethoscope"></i> Chẩn đoán
        </button>
        <button className={`subtab ${activeSubtab === 'services' ? 'active' : ''}`} onClick={() => setActiveSubtab('services')}>
          <i className="fa-solid fa-flask"></i> Chỉ định dịch vụ
        </button>
        <button className={`subtab ${activeSubtab === 'prescription' ? 'active' : ''}`} onClick={() => setActiveSubtab('prescription')}>
          <i className="fa-solid fa-prescription-bottle-medical"></i> Đơn thuốc
        </button>
        <button className={`subtab ${activeSubtab === 'results' ? 'active' : ''}`} onClick={() => setActiveSubtab('results')}>
          <i className="fa-solid fa-microscope"></i> Kết quả
        </button>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '10px 14px',
          position: 'relative',
        }}
      >
        {/* Tab Chẩn đoán */}
        {activeSubtab === 'diagnosis' && (
          <div className="tab-panel active">
          <div className="summary-strip">
            <div className="summary-box"><div className="label">LƯỢT KHÁM</div><div className="value">{visitSummary.visit}</div></div>
            <div className="summary-box"><div className="label">KHOA</div><div className="value">{visitSummary.department}</div></div>
            <div className="summary-box"><div className="label">PHÒNG</div><div className="value">{visitSummary.room}</div></div>
            <div className="summary-box"><div className="label">TRẠNG THÁI</div><div className="value" style={{ color: '#1f9d61' }}>{visitSummary.status}</div></div>
          </div>

          {isDiagnosisEditing && (
            <div className="diagnosis-form-card" style={{ background: '#f8fafc', border: '1px solid var(--line)', borderRadius: '4px', padding: '12px', marginBottom: '10px' }}>
              <div className="section-head" style={{ marginBottom: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
                  {diagnosisForm.id ? 'Sửa chẩn đoán' : 'Thêm chẩn đoán mới'}
                </h3>
              </div>
              <div className="section-body">
                <div className="grid-4">
                  <div className="field">
                    <label>Mã ICD</label>
                    <div className="inline">
                      <input
                        className="grow"
                        value={diagnosisForm.maICD}
                        placeholder="VD: J06.9"
                        onChange={(e) => {
                          updateDiagnosisField('maICD', e.target.value);
                          setIcdKeyword(e.target.value);
                        }}
                      />
                      <button className="icon-btn-sm" type="button" onClick={() => void searchICD()} disabled={isDiagnosisLoading}>
                        <i className="fa-solid fa-search"></i>
                      </button>
                    </div>
                  </div>
                  <div className="field">
                    <label>Tên bệnh</label>
                    <input
                      value={diagnosisForm.tenChanDoan}
                      onChange={(e) => updateDiagnosisField('tenChanDoan', e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Loại</label>
                    <select
                      value={diagnosisForm.laChanDoanChinh ? 'true' : 'false'}
                      onChange={(e) => updateDiagnosisField('laChanDoanChinh', e.target.value === 'true')}
                    >
                      <option value="true">Chính</option>
                      <option value="false">Phụ</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Ghi chú</label>
                    <input
                      value={diagnosisForm.ghiChu}
                      onChange={(e) => updateDiagnosisField('ghiChu', e.target.value)}
                    />
                  </div>
                </div>
                {icdOptions.length > 0 && (
                  <div className="table-wrap" style={{ marginTop: '10px' }}>
                    <table>
                      <thead><tr><th>Mã ICD</th><th>Tên ICD</th><th>Chương</th><th></th></tr></thead>
                      <tbody>
                        {icdOptions.map((option) => (
                          <tr key={option.maICD}>
                            <td>{option.maICD}</td>
                            <td>{option.tenICD}</td>
                            <td>{option.chuong}</td>
                            <td><button className="btn" type="button" onClick={() => selectICD(option)}>Chọn</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                  <button className="btn" type="button" onClick={cancelEditDiagnosis} disabled={isDiagnosisLoading}>
                    <i className="fa-solid fa-xmark"></i> Hủy
                  </button>
                  <button className="btn success" type="button" onClick={saveDiagnosis} disabled={isDiagnosisLoading}>
                    <i className={`fa-solid ${isDiagnosisLoading ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
                    {isDiagnosisLoading ? ' Đang lưu...' : ' Lưu chẩn đoán'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button className="btn primary" type="button" disabled={!luotKhamId || isDiagnosisEditing} onClick={startCreateDiagnosis}>
              <i className="fa-solid fa-plus"></i> Thêm chẩn đoán
            </button>
          </div>

          <div className="section">
            <div className="section-head">
              <h3><i className="fa-solid fa-list"></i> Danh sách chẩn đoán</h3>
              <span className="tag primary">{diagnosisList.length} chẩn đoán</span>
            </div>
            <div className="section-body table-wrap">
              {diagnosisList.length === 0 ? (
                renderEmptyState('Chưa có chẩn đoán nào được ghi nhận cho lượt khám này.')
              ) : (
                <table>
                  <thead><tr><th>Mã ICD</th><th>Tên chẩn đoán</th><th>Loại</th><th>Ghi chú</th><th style={{ width: '70px' }}>Thao tác</th></tr></thead>
                  <tbody>
                    {diagnosisList.map((d, i) => {
                      const isEditingRow = isDiagnosisEditing && diagnosisForm.id === d.id;
                      return (
                        <tr key={d.id ?? `${d.maICD}-${i}`} style={isEditingRow ? { backgroundColor: '#f0f7ff', borderLeft: '4px solid #1a73e8' } : {}}>
                          <td><strong>{d.maICD || '---'}</strong></td>
                          <td>{d.tenChanDoan || '---'}</td>
                          <td><span className={`tag ${d.laChanDoanChinh ? 'warning' : 'gray'}`}>{d.laChanDoanChinh ? 'Chính' : 'Phụ'}</span></td>
                          <td>{d.ghiChu || '---'}</td>
                          <td>
                            <button 
                              className="icon-btn-sm" 
                              type="button" 
                              onClick={() => startEditDiagnosis(d)} 
                              title="Sửa chẩn đoán"
                              disabled={isDiagnosisLoading}
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button 
                              className="icon-btn-sm delete" 
                              type="button" 
                              onClick={() => deleteDiagnosis(d.id)} 
                              title="Xóa chẩn đoán"
                              disabled={isDiagnosisLoading}
                            >
                              <i className="fa-solid fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Chỉ định dịch vụ */}
      {activeSubtab === 'services' && (
        <div className="tab-panel active">
          <div className="section">
            <div className="section-head"><h3><i className="fa-solid fa-flask"></i> Chỉ định dịch vụ</h3></div>
            <div className="section-body">
             <div className="grid-4" style={{ gridTemplateColumns: '1.4fr 1fr 0.8fr' }}>
               <div className="field">
                 <label>Dịch vụ</label>
                 <select
                   value={selectedServiceId}
                   onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                   disabled={!luotKhamId || isServiceLoading}
                 >
                   {serviceCatalog.length === 0 ? (
                     <option value={0}>Không có dịch vụ khả dụng</option>
                   ) : (
                     serviceCatalog.map((service) => (
                       <option key={service.id} value={service.id}>{service.ten}</option>
                     ))
                   )}
                 </select>
               </div>
               <div className="field">
                 <label>Loại</label>
                 <input value={serviceCatalog.find((s) => s.id === selectedServiceId)?.loaiDichVu ?? '---'} readOnly />
                </div>
               <div className="field">
                 <label>&nbsp;</label>
                 <div className="inline">
                   <button className="btn primary" type="button" onClick={handleAddService} disabled={!luotKhamId || isServiceLoading}>
                     <i className={`fa-solid ${isServiceLoading ? 'fa-spinner fa-spin' : 'fa-plus'}`}></i> {isServiceLoading ? 'Đang lưu...' : 'Thêm'}
                   </button>
                 </div>
               </div>
             </div>
             {serviceMessage && (
               <div style={{ marginTop: '10px', color: '#b42318', fontSize: '13px' }}>{serviceMessage}</div>
             )}
           </div>
         </div>

         <div className="section">
           <div className="section-head"><h3>Danh sách chỉ định</h3><span className="tag primary">{serviceOrders.length} dịch vụ</span></div>
           <div className="section-body table-wrap">
             {servicesList.length === 0 ? (
               renderEmptyState('Chưa có dịch vụ nào được chỉ định cho lượt khám này.')
             ) : (
               <table>
                 <thead><tr><th>Dịch vụ</th><th>Loại</th><th>Trạng thái</th><th>Thời gian</th><th style={{ width: '80px' }}>Thao tác</th></tr></thead>
                 <tbody>
                   {servicesList.map((s, i) => {
                     const serviceId = serviceOrders[i]?.id ?? 0;
                     return (
                       <tr key={`${s.name}-${i}`}>
                         <td>{s.name || '---'}</td>
                         <td>{serviceOrders[i]?.loaiDichVu ? serviceOrders[i].loaiDichVu : '---'}</td>
                         <td><span className={`tag ${s.status === 'DaChiDinh' || s.status === 'DA_CHI_DINH' ? 'primary' : 'success'}`}>{s.status || '---'}</span></td>
                         <td>{s.time || '---'}</td>
                         <td>
                           <button className="icon-btn-sm delete" type="button" disabled={isServiceLoading || !serviceId} onClick={() => handleDeleteService(serviceId)}>
                             <i className="fa-solid fa-trash"></i>
                           </button>
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             )}
           </div>
         </div>
       </div>
      )}

      {/* Tab Đơn thuốc LIVE */}
      {activeSubtab === 'prescription' && (
        <div className="tab-panel active">
          {/* Cảnh báo an toàn dị ứng & tương tác */}
          {interactionAlerts.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              {interactionAlerts.map((alert, idx) => (
                <div key={idx} style={{ 
                  background: alert.severity === 'CRITICAL' ? '#fef2f2' : '#fffbeb', 
                  border: `1px solid ${alert.severity === 'CRITICAL' ? '#f87171' : '#fde68a'}`,
                  color: alert.severity === 'CRITICAL' ? '#991b1b' : '#92400e',
                  padding: '10px 14px', borderRadius: '4px', marginBottom: '6px', fontSize: '13px' 
                }}>
                  <i className={`fa-solid ${alert.severity === 'CRITICAL' ? 'fa-triangle-exclamation' : 'fa-circle-exclamation'}`} style={{ marginRight: '6px' }}></i>
                  <strong>{alert.title}: </strong> {alert.message}
                </div>
              ))}
            </div>
          )}

          {prescriptionMessage && (
            <div style={{ 
              background: prescriptionMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${prescriptionMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              color: prescriptionMessage.type === 'success' ? '#166534' : '#991b1b',
              padding: '8px 12px', borderRadius: '4px', marginBottom: '10px', fontSize: '13px'
            }}>
              {prescriptionMessage.text}
            </div>
          )}

          {isPrescriptionReadOnly && (
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1e40af',
              padding: '10px 14px',
              borderRadius: '6px',
              marginBottom: '10px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fa-solid fa-lock" style={{ fontSize: '16px' }}></i>
              <span>
                <strong>Đơn thuốc đã khóa chỉnh sửa:</strong> Trạng thái hiện tại là <strong>{prescriptionStatus}</strong>. Không thể sửa hoặc kê thêm thuốc mới cho lượt khám này.
              </span>
            </div>
          )}

          <div
            className="section"
            style={{
              overflow: 'visible',
              position: 'relative',
              zIndex: 30,
            }}
          >
            <div className="section-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3><i className="fa-solid fa-prescription-bottle-medical"></i> Kê đơn thuốc điện tử</h3>
                {prescriptionId && (
                  <span
                    className={`tag ${
                      prescriptionStatus === 'CHO_CAP_PHAT' || prescriptionStatus === 'DA_DUYET'
                        ? 'success'
                        : prescriptionStatus === 'DA_XUAT_HET'
                        ? 'primary'
                        : prescriptionStatus === 'HUY'
                        ? 'danger'
                        : 'warning'
                    }`}
                    style={{ fontSize: '11px', padding: '2px 8px' }}
                  >
                    {prescriptionStatus === 'CHO_CAP_PHAT' || prescriptionStatus === 'DA_DUYET'
                      ? `Đã duyệt (#${prescriptionId})`
                      : prescriptionStatus === 'DA_XUAT_HET'
                      ? `Đã cấp phát (#${prescriptionId})`
                      : prescriptionStatus === 'HUY'
                      ? `Đã hủy (#${prescriptionId})`
                      : `Đơn lưu tạm (#${prescriptionId})`}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ fontSize: '13px' }}>Loại đơn:</label>
                <select 
                  value={prescriptionType} 
                  onChange={(e) => setPrescriptionType(e.target.value as any)}
                  disabled={isPrescriptionReadOnly}
                  style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--line)' }}
                >
                  <option value="TU_TUC">Tự túc / Thu phí</option>
                  <option value="BHYT">Bảo hiểm Y tế (BHYT)</option>
                  <option value="HON_HOP">Hỗn hợp</option>
                </select>
              </div>
            </div>

            {!isPrescriptionReadOnly && (
              <div
                className="section-body"
                style={{
                  overflow: 'visible',
                  position: 'relative',
                  zIndex: 30,
                }}
              >
              {/* Form tìm kiếm thuốc tự động (Keyboard-first + Debounce) */}
              <div style={{ marginBottom: 12, position: 'relative', zIndex: 40 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: 4,
                    color: '#334155',
                  }}
                >
                  Tìm kiếm thuốc từ kho Dược (theo tên, hoạt chất, mã thuốc hoặc viết tắt không dấu):
                </label>
                <DrugSearchAutocomplete
                  inputRef={searchDrugInputRef}
                  selectedDrug={selectedDrug}
                  onSelectDrug={handleSelectDrug}
                />
              </div>

              {/* Form chi tiết liều dùng & số lượng với Zero-Stock validation */}
              {selectedDrug &&
                (() => {
                  const availableStock =
                    selectedDrug.soLuongKhaDung ?? selectedDrug.tonKho ?? 0;
                  const isOutOfStock = availableStock <= 0;
                  const isOverStock = itemQuantity > availableStock;

                  return (
                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '14px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        marginBottom: '14px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '10px',
                          flexWrap: 'wrap',
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#0f172a',
                          }}
                        >
                          Thuốc đã chọn:{' '}
                          <span style={{ color: '#0284c7' }}>
                            {selectedDrug.tenThuoc || selectedDrug.ten}
                          </span>
                          {selectedDrug.hamLuong && (
                            <span
                              style={{ color: '#475569', fontWeight: 500 }}
                            >
                              {' '}
                              - {selectedDrug.hamLuong}
                            </span>
                          )}
                          {selectedDrug.hoatChat && (
                            <span
                              style={{
                                color: '#64748b',
                                fontSize: '12px',
                                fontWeight: 400,
                              }}
                            >
                              {' '}
                              ({selectedDrug.hoatChat})
                            </span>
                          )}
                        </div>

                        {/* Badge tồn kho khả dụng */}
                        <div>
                          {isOutOfStock ? (
                            <span
                              style={{
                                background: '#fee2e2',
                                color: '#b91c1c',
                                border: '1px solid #fecaca',
                                fontSize: '12px',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: '4px',
                              }}
                            >
                              <i className="fa-solid fa-ban"></i> HẾT HÀNG / TỒN: 0
                            </span>
                          ) : availableStock < 10 ? (
                            <span
                              style={{
                                background: '#fef3c7',
                                color: '#b45309',
                                border: '1px solid #fde68a',
                                fontSize: '12px',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: '4px',
                              }}
                            >
                              <i className="fa-solid fa-triangle-exclamation"></i> SẮP
                              HẾT: còn {availableStock} {selectedDrug.donViTinh}
                            </span>
                          ) : (
                            <span
                              style={{
                                background: '#ecfdf5',
                                color: '#047857',
                                border: '1px solid #a7f3d0',
                                fontSize: '12px',
                                fontWeight: 600,
                                padding: '3px 8px',
                                borderRadius: '4px',
                              }}
                            >
                              Tồn khả dụng: {availableStock}{' '}
                              {selectedDrug.donViTinh}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid-4">
                        <div className="field">
                          <label>
                            Số lượng ({selectedDrug.donViTinh || 'Viên'})
                          </label>
                          <input
                            ref={quantityInputRef}
                            type="number"
                            min={1}
                            max={availableStock > 0 ? availableStock : 1}
                            value={itemQuantity}
                            onChange={(e) =>
                              setItemQuantity(Number(e.target.value))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                instructionInputRef.current?.focus();
                                instructionInputRef.current?.select();
                              }
                            }}
                            style={{
                              borderColor:
                                isOverStock || isOutOfStock
                                  ? '#ef4444'
                                  : undefined,
                              background:
                                isOverStock || isOutOfStock
                                  ? '#fff1f2'
                                  : undefined,
                            }}
                          />
                          {isOutOfStock && (
                            <div
                              style={{
                                color: '#dc2626',
                                fontSize: '11px',
                                fontWeight: 600,
                                marginTop: '3px',
                              }}
                            >
                              ⚠️ Thuốc đã hết hàng trong kho.
                            </div>
                          )}
                          {isOverStock && !isOutOfStock && (
                            <div
                              style={{
                                color: '#dc2626',
                                fontSize: '11px',
                                fontWeight: 600,
                                marginTop: '3px',
                              }}
                            >
                              ⚠️ Vượt quá tồn kho khả dụng (tối đa{' '}
                              {availableStock}).
                            </div>
                          )}
                        </div>
                        <div className="field">
                          <label>Đơn vị tính</label>
                          <select
                            value={itemUnit}
                            onChange={(e) => setItemUnit(e.target.value)}
                          >
                            <option value="Viên">Viên</option>
                            <option value="Vỉ">Vỉ</option>
                            <option value="Hộp">Hộp</option>
                            <option value="Chai">Chai</option>
                            <option value="Ống">Ống</option>
                            <option value="Gói">Gói</option>
                            <option value="Lọ">Lọ</option>
                          </select>
                        </div>
                        <div className="field">
                          <label>Đường dùng</label>
                          <select
                            value={itemRoute}
                            onChange={(e) => setItemRoute(e.target.value)}
                          >
                            <option value="Uống">Uống</option>
                            <option value="Tiêm bắp">Tiêm bắp</option>
                            <option value="Tiêm tĩnh mạch">Tiêm tĩnh mạch</option>
                            <option value="Bôi ngoài da">Bôi ngoài da</option>
                            <option value="Nhỏ mắt">Nhỏ mắt</option>
                            <option value="Ngậm dưới lưỡi">Ngậm dưới lưỡi</option>
                            <option value="Khí dung">Khí dung</option>
                          </select>
                        </div>
                        <div className="field">
                          <label>Số ngày dùng</label>
                          <input
                            type="number"
                            min={1}
                            value={itemDays}
                            onChange={(e) => setItemDays(Number(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="grid-4" style={{ marginTop: '8px' }}>
                        <div className="field" style={{ gridColumn: 'span 2' }}>
                          <label>
                            Liều dùng & Hướng dẫn sử dụng (Bấm Enter để thêm)
                          </label>
                          <input
                            ref={instructionInputRef}
                            value={itemInstruction}
                            onChange={(e) => setItemInstruction(e.target.value)}
                            placeholder="VD: Sáng 1v sau ăn, Tối 1v sau ăn"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddDrugToPrescription();
                              }
                            }}
                          />
                        </div>
                        <div className="field">
                          <label>Tần suất</label>
                          <input
                            value={itemFrequency}
                            onChange={(e) => setItemFrequency(e.target.value)}
                            placeholder="VD: 2 lần/ngày"
                          />
                        </div>
                        <div
                          className="field"
                          style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: 6,
                          }}
                        >
                          <button
                            className="btn success"
                            type="button"
                            onClick={handleAddDrugToPrescription}
                            disabled={
                              isOutOfStock || isOverStock || itemQuantity <= 0
                            }
                            style={{
                              width: '100%',
                              height: 34,
                              opacity:
                                isOutOfStock || isOverStock || itemQuantity <= 0
                                  ? 0.5
                                  : 1,
                              cursor:
                                isOutOfStock || isOverStock || itemQuantity <= 0
                                  ? 'not-allowed'
                                  : 'pointer',
                            }}
                          >
                            <i className="fa-solid fa-plus"></i> Thêm vào đơn
                          </button>
                          <button
                            className="btn"
                            type="button"
                            onClick={() => {
                              setSelectedDrug(null);
                              searchDrugInputRef.current?.focus();
                            }}
                            style={{ height: 34 }}
                            title="Hủy chọn thuốc này"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Danh sách đơn thuốc hiện tại */}
          <div
            className="section"
            style={{
              marginTop: 12,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div className="section-head">
              <h3>
                <i className="fa-solid fa-list-check"></i> Đơn thuốc đã kê (
                {prescribedDrugs.length} khoản)
              </h3>
            </div>
            <div className="section-body" style={{ padding: 0 }}>
              <PrescriptionTable
                items={prescribedDrugs}
                onRemoveItem={handleRemoveDrug}
                readOnly={isPrescriptionReadOnly}
              />
            </div>
          </div>

          <div className="footer-actions" style={{ marginTop: '12px' }}>
            <div className="actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn" type="button" onClick={() => window.print()}>
                <i className="fa-solid fa-print"></i> In đơn thuốc
              </button>
              {!isPrescriptionReadOnly && (
                <button
                  className="btn success"
                  type="button"
                  onClick={handleSavePrescription}
                  disabled={isPrescriptionLoading || prescribedDrugs.length === 0}
                  title={isPrescriptionLoading ? 'Đang lưu...' : prescriptionId ? 'Cập nhật đơn thuốc' : 'Lưu đơn thuốc'}
                >
                  <i className={`fa-solid ${isPrescriptionLoading ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>{' '}
                  {prescriptionId ? 'Cập nhật đơn thuốc' : 'Lưu đơn thuốc'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Kết quả Cận Lâm Sàng Thực Tế */}
      {activeSubtab === 'results' && (
        <div className="tab-panel active">
          <div className="section">
            <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3><i className="fa-solid fa-microscope"></i> Kết quả Cận lâm sàng & Xét nghiệm (Real-time)</h3>
              <button 
                className="btn secondary" 
                type="button" 
                style={{ fontSize: '12px', padding: '4px 10px' }}
                onClick={() => void fetchServiceOrders()}
                disabled={isServiceLoading}
              >
                <i className={`fa-solid ${isServiceLoading ? 'fa-spinner fa-spin' : 'fa-rotate'}`}></i> Làm mới
              </button>
            </div>
            <div className="section-body table-wrap">
              {serviceOrders.length === 0 ? (
                renderEmptyState('Chưa có chỉ định cận lâm sàng nào được ghi nhận cho lượt khám này.')
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Mã/Dịch vụ</th>
                      <th>Loại DV</th>
                      <th>Ngày chỉ định</th>
                      <th>Trạng thái</th>
                      <th>Kết luận lâm sàng</th>
                      <th>File / PACS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceOrders.map((order) => {
                      const isCompleted = order.trangThai === 'DaCoKetQua';
                      return (
                        <tr key={order.id}>
                          <td><strong>{order.tenDichVu || `Dịch vụ #${order.id}`}</strong></td>
                          <td><span className="tag">{order.loaiDichVu || 'CLS'}</span></td>
                          <td style={{ fontSize: '12px', color: '#64748b' }}>
                            {order.ngayChiDinh ? new Date(order.ngayChiDinh).toLocaleDateString('vi-VN') : '---'}
                          </td>
                          <td>
                            <span className={`tag ${isCompleted ? 'success' : 'warning'}`}>
                              {isCompleted ? 'Đã có kết quả' : 'Đang chờ KQ'}
                            </span>
                          </td>
                          <td>
                            {order.ketLuan ? (
                              <span style={{ color: '#166534', fontWeight: 500 }}>{order.ketLuan}</span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Đang chờ kỹ thuật viên trả kết quả...</span>
                            )}
                          </td>
                          <td>
                            {order.urlKetQua ? (
                              <a 
                                href={order.urlKetQua} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="btn outline"
                                style={{ padding: '2px 8px', fontSize: '11px', textDecoration: 'none' }}
                              >
                                <i className="fa-solid fa-eye"></i> Xem file/ảnh
                              </a>
                            ) : (
                              <span style={{ color: '#cbd5e1' }}>---</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default TreatmentWorkspace;
