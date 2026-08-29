import React, { useMemo, useState } from 'react';
import type { TreatmentWorkspaceProps } from '../../types/examination.types';

const TreatmentWorkspace: React.FC<TreatmentWorkspaceProps> = ({
  data,
  onSave: _onSave,
  onFinish: _onFinish,
}) => {
  const [activeSubtab, setActiveSubtab] = useState('diagnosis');

  const diagnosis = data?.treatment?.diagnosis ?? {
    icd: '',
    name: '',
    diagnosis: '',
    type: 'Chính',
    note: '',
    assessment: '',
  };

  const diagnosisList = data?.treatment?.diagnosisList ?? [];
  const servicesList = data?.treatment?.services ?? [];
  const drugsList = data?.treatment?.drugs ?? [];
  const resultsList = data?.treatment?.results ?? [];

  const visitSummary = useMemo(() => ({
    visit: data?.visit ?? '---',
    department: data?.department ?? '---',
    room: data?.room ?? '---',
    status: data?.status ?? 'Chưa bắt đầu',
  }), [data]);

  const renderEmptyState = (message: string) => (
    <div className="empty" style={{ padding: '28px 20px', textAlign: 'center', color: '#7b8794', background: '#fafcfd', border: '1px dashed #d9e2ea', borderRadius: '8px' }}>
      <i className="fa-solid fa-file-medical" style={{ display: 'block', fontSize: '24px', marginBottom: '8px', color: '#b3bec9' }}></i>
      {message}
    </div>
  );

  return (
    <div className="tab-panel active">
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

      {activeSubtab === 'diagnosis' && (
        <div className="tab-panel active">
          <div className="summary-strip">
            <div className="summary-box"><div className="label">LƯỢT KHÁM</div><div className="value">{visitSummary.visit}</div></div>
            <div className="summary-box"><div className="label">KHOA</div><div className="value">{visitSummary.department}</div></div>
            <div className="summary-box"><div className="label">PHÒNG</div><div className="value">{visitSummary.room}</div></div>
            <div className="summary-box"><div className="label">TRẠNG THÁI</div><div className="value" style={{ color: '#1f9d61' }}>{visitSummary.status}</div></div>
          </div>

          <div className="section">
            <div className="section-head">
              <h3><i className="fa-solid fa-notes-medical"></i> Chẩn đoán</h3>
              <div className="section-actions">
                <button className="btn" type="button"><i className="fa-solid fa-magnifying-glass"></i> Tra cứu ICD-10</button>
              </div>
            </div>
            <div className="section-body">
              <div className="grid-4">
                <div className="field">
                  <label>Mã ICD</label>
                  <div className="inline">
                    <input className="grow" value={diagnosis.icd} placeholder="VD: J06.9" readOnly />
                    <button className="icon-btn-sm" type="button"><i className="fa-solid fa-search"></i></button>
                  </div>
                </div>
                <div className="field"><label>Tên bệnh</label><input value={diagnosis.name} readOnly /></div>
                <div className="field"><label>Chẩn đoán</label><input value={diagnosis.diagnosis} readOnly /></div>
                <div className="field">
                  <label>Loại</label>
                  <select value={diagnosis.type} disabled>
                    <option value="Chính">Chính</option>
                    <option value="Phụ">Phụ</option>
                  </select>
                </div>
              </div>
              <div className="grid-2" style={{ marginTop: '10px' }}>
                <div className="field"><label>Ghi chú lâm sàng</label><textarea value={diagnosis.note} readOnly /></div>
                <div className="field"><label>Nhận định</label><textarea value={diagnosis.assessment} readOnly /></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button className="btn primary" type="button"><i className="fa-solid fa-plus"></i> Thêm chẩn đoán</button>
              </div>
            </div>
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
                    {diagnosisList.map((d, i) => (
                      <tr key={`${d.icd}-${i}`}>
                        <td><strong>{d.icd || '---'}</strong></td>
                        <td>{d.name || '---'}</td>
                        <td><span className={`tag ${d.type === 'CHÍNH' || d.type === 'Chính' ? 'warning' : 'gray'}`}>{d.type || '---'}</span></td>
                        <td>{d.note || '---'}</td>
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
              <button className="btn" type="button"><i className="fa-solid fa-pen-to-square"></i> Sửa chẩn đoán</button>
              <button className="btn success" type="button"><i className="fa-solid fa-floppy-disk"></i> Lưu chẩn đoán</button>
            </div>
          </div>
        </div>
      )}

      {activeSubtab === 'services' && (
        <div className="tab-panel active">
          <div className="section">
            <div className="section-head"><h3><i className="fa-solid fa-flask"></i> Chỉ định dịch vụ</h3></div>
            <div className="section-body">
              <div className="grid-4" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className="field"><label>Dịch vụ</label>
                  <select value="" disabled>
                    <option value="">Chưa có dịch vụ</option>
                  </select>
                </div>
                <div className="field"><label>Chẩn đoán liên quan</label>
                  <select value="" disabled>
                    <option value="">Chưa có chẩn đoán</option>
                  </select>
                </div>
                <div className="field"><label>Số lượng</label>
                  <div className="inline">
                    <input type="number" value={1} readOnly />
                    <button className="btn primary" type="button"><i className="fa-solid fa-plus"></i> Thêm</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-head"><h3>Danh sách chỉ định</h3></div>
            <div className="section-body table-wrap">
              {servicesList.length === 0 ? (
                renderEmptyState('Chưa có dịch vụ nào được chỉ định cho lượt khám này.')
              ) : (
                <table>
                  <thead><tr><th>Dịch vụ</th><th>SL</th><th>Trạng thái</th><th>Thời gian</th><th style={{ width: '70px' }}>Thao tác</th></tr></thead>
                  <tbody>
                    {servicesList.map((s, i) => (
                      <tr key={`${s.name}-${i}`}>
                        <td>{s.name || '---'}</td>
                        <td>{s.qty ?? 0}</td>
                        <td><span className={`tag ${s.status === 'ĐÃ CHỈ ĐỊNH' ? 'primary' : 'success'}`}>{s.status || '---'}</span></td>
                        <td>{s.time || '---'}</td>
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
              <button className="btn" type="button"><i className="fa-solid fa-pen-to-square"></i> Sửa chỉ định</button>
              <button className="btn success" type="button"><i className="fa-solid fa-floppy-disk"></i> Lưu chỉ định</button>
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