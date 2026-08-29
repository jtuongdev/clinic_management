import React from 'react';
import type {
  ExaminationWorkspaceProps,
} from '../../types/examination.types';
import { useExaminationForm } from '../../hooks/useExaminationForm';

const ExaminationWorkspace: React.FC<ExaminationWorkspaceProps> = ({ 
  data, 
  luotKhamId,
  onChange: _onChange,
  onSaveSuccess
}) => {
  const {
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
  } = useExaminationForm({ data, luotKhamId, onSaveSuccess });

  return (
    <div className="tab-panel active">
      {saveSuccess && (
        <div style={{ background: '#ecfdf5', color: '#10b981', padding: '12px 16px', fontSize: '14px', borderBottom: '1px solid #d1fae5', marginBottom: '16px', borderRadius: '4px' }}>
          <i className="fa-solid fa-circle-check" style={{ marginRight: '8px' }}></i> Lưu thông tin khám bệnh thành công
        </div>
      )}

      {saveError && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px 16px', fontSize: '14px', borderBottom: '1px solid #fee2e2', marginBottom: '16px', borderRadius: '4px' }}>
          <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '8px' }}></i> {saveError}
        </div>
      )}

      <div className="section">
        <div className="section-head">
          <h3><i className="fa-solid fa-notes-medical"></i> Lý do khám</h3>
        </div>
        <div className="section-body">
          <div className="grid-4">
            <div className="field">
              <label>Loại tiền sử</label>
              <select
                value={formState.loaiTienSu}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('loaiTienSu', e.target.value)}
              >
                {loaiTienSuOptions.length > 0 ? loaiTienSuOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                )) : (
                  <option value="BENH_NEN">Bệnh nền</option>
                )}
              </select>
            </div>
            <div className="field">
              <label>Tên tiền sử</label>
              <input
                type="text"
                value={formState.tenTienSu}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('tenTienSu', e.target.value)}
                placeholder="Ví dụ: Viêm phổi"
              />
            </div>
          </div>
          <div className="field">
            <label>Lý do khám</label>
            <textarea 
              rows={3} 
              value={formState.lyDoKham}
              disabled={!isEditing}
              onChange={(e) => handleFieldChange('lyDoKham', e.target.value)}
              placeholder="Nhập lý do khám bệnh"
            />
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h3><i className="fa-solid fa-heart-pulse"></i> Sinh hiệu</h3>
        </div>
        <div className="section-body">
          <div className="grid-4">
            <div className="field">
              <label>Nhiệt độ (°C)</label>
              <input
                type="number"
                step="0.1"
                value={formState.nhietDo}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('nhietDo', e.target.value)}
                placeholder="36.5"
              />
            </div>
            <div className="field">
              <label>Mạch (nhịp/phút)</label>
              <input
                type="number"
                step="1"
                value={formState.mach}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('mach', e.target.value)}
                placeholder="72"
              />
            </div>
            <div className="field">
              <label>Huyết áp (tâm thu)</label>
              <input
                type="number"
                step="1"
                value={formState.huyetApTamThu}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('huyetApTamThu', e.target.value)}
                placeholder="120"
              />
            </div>
            <div className="field">
              <label>Huyết áp (tâm trương)</label>
              <input
                type="number"
                step="1"
                value={formState.huyetApTamTruong}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('huyetApTamTruong', e.target.value)}
                placeholder="80"
              />
            </div>
            <div className="field">
              <label>SpO2 (%)</label>
              <input
                type="number"
                step="1"
                value={formState.spo2}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('spo2', e.target.value)}
                placeholder="98"
              />
            </div>
            <div className="field">
              <label>Cân nặng (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formState.canNang}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('canNang', e.target.value)}
                placeholder="58"
              />
            </div>
            <div className="field">
              <label>Chiều cao (cm)</label>
              <input
                type="number"
                step="0.1"
                value={formState.chieuCao}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('chieuCao', e.target.value)}
                placeholder="165"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="footer-actions" style={{ marginTop: '12px' }}>
        <div className="actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {!isEditing ? (
            <button className="btn" type="button" onClick={handleEdit}>
              <i className="fa-solid fa-pen-to-square"></i> Sửa
            </button>
          ) : (
            <>
              <button className="btn" type="button" disabled={isSaving} onClick={handleCancelEdit}>
                <i className="fa-solid fa-xmark"></i> Hủy
              </button>
              <button
                className="btn success"
                type="button"
                disabled={isSaving}
                onClick={handleSave}
              >
                <i className={`fa-solid ${isSaving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
                {isSaving ? ' Đang lưu...' : ' Lưu'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExaminationWorkspace;