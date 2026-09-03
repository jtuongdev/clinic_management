import React from 'react';
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
            <span><i className="fa-regular fa-heart-pulse" /> Sinh hiệu</span>
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
            </div>
          </div>
        </section>
      </div>

      {/* Tiền sử bệnh */}
      <section className="section history-section">
        <div className="section-head">
          <span><i className="fa-regular fa-file-lines" /> Tiền sử bệnh</span>
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
                  <option value="1">Bệnh nền</option>
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
                placeholder="Ví dụ: Tăng huyết áp..."
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
                      return (
                        <tr key={item.id ?? `new-${index}`}>
                          <td className="text-center">{index + 1}</td>
                          <td style={{ fontWeight: 500 }}>{option?.label ?? item.loaiTienSu}</td>
                          <td style={{ fontWeight: 500 }}>{item.ten}</td>
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