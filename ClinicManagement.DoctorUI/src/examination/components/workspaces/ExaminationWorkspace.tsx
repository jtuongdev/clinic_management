import React, { useMemo } from 'react';
import type { ExaminationWorkspaceProps } from '../../types/examination/examination-form.types';
import { useExaminationForm } from '../../hooks/useExaminationForm';
import './Workspace.css';

const ExaminationWorkspace: React.FC<ExaminationWorkspaceProps> = ({
  data,
  luotKhamId,
  onChange: _onChange,
  onSaveSuccess,
}) => {
  const {
    formState,
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
  } = useExaminationForm({ data, luotKhamId, onSaveSuccess });

  // Tự động tính chỉ số BMI
  const bmiInfo = useMemo(() => {
    const w = parseFloat(formState.canNang);
    const h = parseFloat(formState.chieuCao) / 100; // mét
    if (w > 0 && h > 0) {
      const val = +(w / (h * h)).toFixed(1);
      let cat = 'Bình thường';
      let color = '#16a34a';
      if (val < 18.5) { cat = 'Thiếu cân'; color = '#d97706'; }
      else if (val >= 25 && val < 30) { cat = 'Thừa cân'; color = '#ea580c'; }
      else if (val >= 30) { cat = 'Béo phì'; color = '#dc2626'; }
      return { value: val, category: cat, color };
    }
    return null;
  }, [formState.canNang, formState.chieuCao]);

  // Danh sách các dị ứng nguy hiểm đã ghi nhận
  const allergies = useMemo(() => {
    return formState.tienSuBenhs.filter(
      item => item.loaiTienSu === '3' || 
              item.loaiTienSu?.toLowerCase().includes('dị ứng') ||
              item.ten.toLowerCase().includes('dị ứng')
    );
  }, [formState.tienSuBenhs]);

  if (isLoading) {
    return (
      <div className="exam-loading">
        <i className="fa-solid fa-spinner fa-spin" />
        <span>Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="exam-workspace">
      {/* CẢNH BÁO NGUY HIỂM: Sticky Allergy Banner */}
      {allergies.length > 0 && (
        <div style={{
          background: '#fef2f2',
          border: '2px solid #ef4444',
          color: '#991b1b',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(239, 68, 68, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '20px', color: '#dc2626' }}></i>
            <div>
              <strong style={{ fontSize: '14px', textTransform: 'uppercase' }}>Cảnh báo dị ứng nghiêm trọng:</strong>
              <div style={{ marginTop: '2px', fontSize: '13px' }}>
                Bệnh nhân có tiền sử dị ứng với: {allergies.map(a => a.ten).join(', ')}
              </div>
            </div>
          </div>
          <span style={{
            background: '#dc2626', color: '#fff', padding: '4px 10px',
            borderRadius: '4px', fontSize: '12px', fontWeight: 'bold'
          }}>
            LƯU Ý KÊ ĐƠN
          </span>
        </div>
      )}

      {(saveSuccess || saveError) && (
        <div className={`exam-alert ${saveSuccess ? 'alert-success' : 'alert-danger'}`}>
          <i className={`fa-regular ${saveSuccess ? 'fa-circle-check' : 'fa-circle-exclamation'}`} />
          <span>{saveSuccess ? 'Lưu thông tin khám bệnh thành công' : saveError}</span>
        </div>
      )}

      <div className="exam-top-row">
        {/* Lý do khám */}
        <section className="section reason-section">
          <div className="section-head">
            <span><i className="fa-regular fa-pen-to-square" /> Lý do khám</span>
          </div>
          <div className="section-body">
            <div className="field">
              <label>Lý do khám</label>
              <textarea
                rows={2}
                value={formState.lyDoKham}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('lyDoKham', e.target.value)}
                placeholder="Nhập lý do khám bệnh..."
              />
            </div>
          </div>
        </section>

        {/* Sinh hiệu */}
        <section className="section vitals-section">
          <div className="section-head">
            <span><i className="fa-regular fa-heart-pulse" /> Sinh hiệu (Vitals & Triage)</span>
            {bmiInfo && (
              <span style={{ fontSize: '12px', color: bmiInfo.color, fontWeight: 600 }}>
                BMI: {bmiInfo.value} kg/m² ({bmiInfo.category})
              </span>
            )}
          </div>
          <div className="section-body">
            <div className="vitals-grid">
              {[
                { key: 'nhietDo', label: 'Nhiệt độ', unit: '°C', placeholder: '36.5', step: '0.1' },
                { key: 'mach', label: 'Mạch', unit: 'lần/phút', placeholder: '72', step: '1' },
                { key: 'huyetApTamThu', label: 'HA tâm thu', unit: 'mmHg', placeholder: '120', step: '1' },
                { key: 'huyetApTamTruong', label: 'HA tâm trương', unit: 'mmHg', placeholder: '80', step: '1' },
                { key: 'spo2', label: 'SpO2', unit: '%', placeholder: '98', step: '1' },
                { key: 'canNang', label: 'Cân nặng', unit: 'kg', placeholder: '58', step: '0.1' },
                { key: 'chieuCao', label: 'Chiều cao', unit: 'cm', placeholder: '165', step: '0.1' },
              ].map((field) => (
                <div className="vital-field" key={field.key}>
                  <label>{field.label}</label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      step={field.step}
                      value={formState[field.key as keyof typeof formState] as string}
                      disabled={!isEditing}
                      onChange={(e) => handleFieldChange(field.key as any, e.target.value)}
                      placeholder={field.placeholder}
                    />
                    <span className="input-unit">{field.unit}</span>
                  </div>
                </div>
              ))}

              {/* Ô hiển thị BMI tự động */}
              <div className="vital-field">
                <label>Chỉ số BMI</label>
                <div className="input-with-unit">
                  <input
                    type="text"
                    value={bmiInfo ? `${bmiInfo.value} (${bmiInfo.category})` : '---'}
                    readOnly
                    style={{ fontWeight: 600, color: bmiInfo?.color || 'inherit' }}
                  />
                  <span className="input-unit">kg/m²</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Tiền sử bệnh */}
      <section className="section history-section">
        <div className="section-head">
          <span><i className="fa-regular fa-file-lines" /> Tiền sử bệnh & Dị ứng</span>
          {formState.tienSuBenhs.length > 0 && (
            <span className="badge">{formState.tienSuBenhs.length}</span>
          )}
        </div>
        <div className="section-body history-body">
          <div className="history-form">
            <div className="field">
              <label>Loại tiền sử</label>
              <select
                value={formState.loaiTienSu}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('loaiTienSu', e.target.value)}
              >
                {loaiTienSuOptions.length > 0 ? (
                  loaiTienSuOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))
                ) : (
                  <>
                    <option value="1">Bệnh mãn tính / Bệnh nền</option>
                    <option value="2">Phẫu thuật / Can thiệp</option>
                    <option value="3">Dị ứng thuốc / Thức ăn</option>
                    <option value="4">Tiền sử gia đình</option>
                  </>
                )}
              </select>
            </div>
            <div className="field">
              <label>Tên tiền sử / Dị ứng</label>
              <input
                type="text"
                value={formState.tenTienSu}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('tenTienSu', e.target.value)}
                placeholder="Ví dụ: Dị ứng Penicillin, Tăng huyết áp..."
              />
            </div>
            <div className="field">
              <label>Ghi chú</label>
              <input
                type="text"
                value={formState.ghiChuTienSu}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('ghiChuTienSu', e.target.value)}
                placeholder="Ghi chú thêm"
              />
            </div>
            {isEditing && (
              <div className="history-add">
                <button className="btn btn-primary" type="button" onClick={handleAddTienSu}>
                  <i className="fa-regular fa-plus" /> Thêm
                </button>
              </div>
            )}
          </div>

          <div className="history-list">
            {formState.tienSuBenhs.length === 0 ? (
              <div className="empty-state">
                <i className="fa-regular fa-file-circle-question" />
                <span>Chưa có tiền sử bệnh</span>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th className="text-center" style={{ width: '40px' }}>STT</th>
                      <th>Loại</th>
                      <th>Tên</th>
                      <th>Ghi chú</th>
                      {isEditing && <th className="text-center" style={{ width: '80px' }}>Thao tác</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {formState.tienSuBenhs.map((item, index) => {
                      const option = loaiTienSuOptions.find((x) => x.value === item.loaiTienSu);
                      const isAllergy = item.loaiTienSu === '3' || item.ten.toLowerCase().includes('dị ứng');
                      return (
                        <tr key={item.id ?? `new-${index}`} style={isAllergy ? { background: '#fef2f2' } : {}}>
                          <td className="text-center">{index + 1}</td>
                          <td style={{ fontWeight: 500 }}>
                            {isAllergy && <span style={{ color: '#dc2626', marginRight: '4px' }}>⚠️</span>}
                            {option?.label ?? (item.loaiTienSu === '3' ? 'Dị ứng' : item.loaiTienSu)}
                          </td>
                          <td style={{ fontWeight: 500, color: isAllergy ? '#991b1b' : 'inherit' }}>{item.ten}</td>
                          <td className="text-muted">{item.ghiChu || '—'}</td>
                          {isEditing && (
                            <td className="text-center">
                              <div className="action-btns">
                                <button className="btn-icon" title="Sửa" onClick={() => handleEditTienSu(item)}>
                                  <i className="fa-regular fa-pen" />
                                </button>
                                <button className="btn-icon danger" title="Xóa" onClick={() => handleDeleteTienSu(index)}>
                                  <i className="fa-regular fa-trash" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="exam-footer">
        <div className="exam-footer-info">
          {isEditing ? (
            <><i className="fa-regular fa-pen" /> Đang chỉnh sửa</>
          ) : (
            <><i className="fa-regular fa-lock" /> Chế độ xem</>
          )}
        </div>
        <div className="exam-footer-actions">
          {!isEditing ? (
            <button className="btn btn-primary" type="button" onClick={handleEdit}>
              <i className="fa-regular fa-pen-to-square" /> Chỉnh sửa
            </button>
          ) : (
            <>
              <button className="btn" type="button" disabled={isSaving} onClick={handleCancelEdit}>
                <i className="fa-regular fa-xmark" /> Hủy
              </button>
              <button className="btn btn-success" type="button" disabled={isSaving} onClick={handleSave}>
                <i className={`fa-solid ${isSaving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`} />
                {isSaving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExaminationWorkspace;
