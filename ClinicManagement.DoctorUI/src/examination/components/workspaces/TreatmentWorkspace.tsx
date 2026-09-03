import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../Auth/context/AuthProvider';
import type { TreatmentWorkspaceProps } from '../../types/examination/treatment.types';
import type { ServiceCatalogOption, ServiceOrderDto, ServiceOrderRequest, TreatmentSummaryDto } from '../../types/examination/exam.types';
import { useDiagnosisManagement } from '../../hooks/useDiagnosisManagement';
import { examinationApi } from '../../api/examination.api';

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

  useEffect(() => {
    if (!luotKhamId) {
      return;
    }

    let isMounted = true;

    const fetchSummary = async () => {
      try {
        const response = await examinationApi.getTreatmentSummary(luotKhamId);
        if (isMounted && response.data?.success && response.data.data) {
          setTreatmentSummary(response.data.data);
        }
      } catch {
        // Keep fallback values from props when summary API is unavailable.
      }
    };

    const fetchCatalog = async () => {
      try {
        const response = await examinationApi.getServiceCatalog();
        if (!isMounted) {
          return;
        }

        const items = response.data?.data ?? [];
        setServiceCatalog(items);

        if (items.length > 0 && !selectedServiceId) {
          setSelectedServiceId(items[0].id);
        }
      } catch {
        // Ignore catalog failures and keep the UI state usable.
      }
    };

    void fetchSummary();
    void fetchServiceOrders();
    void fetchCatalog();

    return () => {
      isMounted = false;
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
    if (!luotKhamId) {
      return;
    }

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

  const servicesList = serviceOrders.length > 0
    ? serviceOrders.map((service) => ({
        name: service.tenDichVu,
        qty: 1,
        status: service.trangThai,
        time: service.ngayChiDinh ? new Date(service.ngayChiDinh).toLocaleString('vi-VN') : '---',
      }))
    : (data?.treatment?.services ?? []);
  const drugsList = data?.treatment?.drugs ?? [];
  const resultsList = data?.treatment?.results ?? [];

  // Thông tin tóm tắt lượt khám
  const visitSummary = useMemo(() => ({
    visit: treatmentSummary?.maLuotKham ?? data?.visit ?? '---',
    department: treatmentSummary?.khoa ?? data?.department ?? '---',
    room: treatmentSummary?.phong ?? data?.room ?? '---',
    status: treatmentSummary?.trangThai ?? data?.status ?? 'Chưa bắt đầu',
  }), [treatmentSummary, data]);

  const renderEmptyState = (message: string) => (
    <div className="empty" style={{ padding: '28px 20px', textAlign: 'center', color: '#7b8794', background: '#fafcfd', border: '1px dashed #d9e2ea', borderRadius: '8px' }}>
      <i className="fa-solid fa-file-medical" style={{ display: 'block', fontSize: '24px', marginBottom: '8px', color: '#b3bec9' }}></i>
      {message}
    </div>
  );

  return (
    <div className="tab-panel active">
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

      {/* Tab Chẩn đoán */}
      {activeSubtab === 'diagnosis' && (
        <div className="tab-panel active">
          {/* Strip thông tin */}
          <div className="summary-strip">
            <div className="summary-box"><div className="label">LƯỢT KHÁM</div><div className="value">{visitSummary.visit}</div></div>
            <div className="summary-box"><div className="label">KHOA</div><div className="value">{visitSummary.department}</div></div>
            <div className="summary-box"><div className="label">PHÒNG</div><div className="value">{visitSummary.room}</div></div>
            <div className="summary-box"><div className="label">TRẠNG THÁI</div><div className="value" style={{ color: '#1f9d61' }}>{visitSummary.status}</div></div>
          </div>

          {/* Form nhập liệu - hiển thị khi đang chỉnh sửa */}
          {isDiagnosisEditing && (
            <div className="diagnosis-form-card" style={{ background: '#fafcfd', border: '1px solid #d9e2ea', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
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
                      <button className="icon-btn-sm" type="button" onClick={searchICD} disabled={isDiagnosisLoading}>
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

          {/* Nút thêm mới */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button className="btn primary" type="button" disabled={!luotKhamId || isDiagnosisEditing} onClick={startCreateDiagnosis}>
              <i className="fa-solid fa-plus"></i> Thêm chẩn đoán
            </button>
          </div>

          {/* Danh sách chẩn đoán */}
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

      {/* Các tab khác giữ nguyên */}
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

      {activeSubtab === 'prescription' && (
        <div className="tab-panel active">
          <div className="section">
            <div className="section-head"><h3><i className="fa-solid fa-prescription-bottle-medical"></i> Kê đơn thuốc</h3><span className="tag warning"><i className="fa-solid fa-triangle-exclamation"></i> Kiểm tra dị ứng trước khi lưu</span></div>
            <div className="section-body">
              <div className="grid-4">
                <div className="field"><label>Thuốc</label><div className="inline"><input className="grow" placeholder="Chưa có dữ liệu thuốc" readOnly /><button className="icon-btn-sm" type="button"><i className="fa-solid fa-search"></i></button></div></div>
                <div className="field"><label>Số lượng</label><input type="number" value={1} readOnly /></div>
                <div className="field"><label>Đơn vị</label><select value="" disabled><option value="">Chưa có đơn vị</option></select></div>
                <div className="field"><label>Đường dùng</label><select value="" disabled><option value="">Chưa có đường dùng</option></select></div>
              </div>
              <div className="grid-4" style={{ marginTop: '10px' }}>
                <div className="field"><label>Liều dùng</label><input value="" readOnly /></div>
                <div className="field"><label>Tần suất</label><input value="" readOnly /></div>
                <div className="field"><label>Số ngày</label><input type="number" value={0} readOnly /></div>
                <div className="field"><label>&nbsp;</label><button className="btn primary" type="button"><i className="fa-solid fa-plus"></i> Thêm thuốc</button></div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-head"><h3>Đơn thuốc hiện tại</h3></div>
            <div className="section-body table-wrap">
              {drugsList.length === 0 ? (
                renderEmptyState('Chưa có thuốc nào được kê trong đơn hiện tại.')
              ) : (
                <table>
                  <thead><tr><th>Thuốc</th><th>SL</th><th>Đơn vị</th><th>Liều</th><th>Tần suất</th><th>Số ngày</th><th>Đường dùng</th><th></th></tr></thead>
                  <tbody>
                    {drugsList.map((d, i) => (
                      <tr key={`${d.name}-${i}`}>
                        <td><strong>{d.name || '---'}</strong></td>
                        <td>{d.qty ?? 0}</td>
                        <td>{d.unit || '---'}</td>
                        <td>{d.dose || '---'}</td>
                        <td>{d.freq || '---'}</td>
                        <td>{d.days ?? 0}</td>
                        <td>{d.route || '---'}</td>
                        <td><button className="icon-btn-sm delete" type="button"><i className="fa-solid fa-trash"></i></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="footer-actions" style={{ marginTop: '12px' }}>
            <div className="actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn" type="button"><i className="fa-solid fa-pen-to-square"></i> Sửa đơn thuốc</button>
              <button className="btn success" type="button"><i className="fa-solid fa-floppy-disk"></i> Lưu đơn thuốc</button>
            </div>
          </div>
        </div>
      )}

      {activeSubtab === 'results' && (
        <div className="tab-panel active">
          <div className="section">
            <div className="section-head"><h3><i className="fa-solid fa-microscope"></i> Kết quả xét nghiệm</h3></div>
            <div className="section-body table-wrap">
              {resultsList.length === 0 ? (
                renderEmptyState('Chưa có kết quả xét nghiệm nào được ghi nhận.')
              ) : (
                <table>
                  <thead><tr><th>Chỉ số</th><th>Kết quả</th><th>Đơn vị</th><th>Khoảng tham chiếu</th><th>Đánh giá</th></tr></thead>
                  <tbody>
                    {resultsList.map((r, i) => (
                      <tr key={`${r.indicator}-${i}`}>
                        <td>{r.indicator || '---'}</td>
                        <td><strong>{r.result || '---'}</strong></td>
                        <td>{r.unit || '---'}</td>
                        <td>{r.ref || '---'}</td>
                        <td><span className={`tag ${r.evaluation === 'Cao' ? 'warning' : 'success'}`}>{r.evaluation || '---'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="section">
            <div className="section-head"><h3><i className="fa-solid fa-image"></i> Chẩn đoán hình ảnh</h3></div>
            <div className="section-body">
              {renderEmptyState('Chưa có kết quả chẩn đoán hình ảnh mới.')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentWorkspace;