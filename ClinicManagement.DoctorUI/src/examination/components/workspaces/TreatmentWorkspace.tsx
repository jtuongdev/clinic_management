import React, { useState } from 'react';
import { type ExamDetail } from '../../types';

interface TreatmentWorkspaceProps {
  data: ExamDetail;
  onSave: () => void;
  onFinish: () => void;
}

const TreatmentWorkspace: React.FC<TreatmentWorkspaceProps> = ({ data, onSave, onFinish }) => {
  const [activeSubtab, setActiveSubtab] = useState('diagnosis');

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

      {/* Diagnosis Subtab */}
      {activeSubtab === 'diagnosis' && (
        <div className="tab-panel active">
          <div className="summary-strip">
            <div className="summary-box"><div className="label">LƯỢT KHÁM</div><div className="value">{data.visit}</div></div>
            <div className="summary-box"><div className="label">KHOA</div><div className="value">{data.department}</div></div>
            <div className="summary-box"><div className="label">PHÒNG</div><div className="value">{data.room}</div></div>
            <div className="summary-box"><div className="label">TRẠNG THÁI</div><div className="value" style={{color: '#1f9d61'}}>{data.status}</div></div>
          </div>

          <div className="section">
            <div className="section-head">
              <h3><i className="fa-solid fa-notes-medical"></i> Chẩn đoán</h3>
              <div className="section-actions">
                <button className="btn" id="icdBtn"><i className="fa-solid fa-magnifying-glass"></i> Tra cứu ICD-10</button>
              </div>
            </div>
            <div className="section-body">
              <div className="grid-4">
                <div className="field">
                  <label>Mã ICD</label>
                  <div className="inline">
                    <input className="grow" defaultValue={data.treatment.diagnosis.icd} placeholder="VD: J06.9" />
                    <button className="icon-btn-sm" id="icdSearch"><i className="fa-solid fa-search"></i></button>
                  </div>
                </div>
                <div className="field"><label>Tên bệnh</label><input defaultValue={data.treatment.diagnosis.name} /></div>
                <div className="field"><label>Chẩn đoán</label><input defaultValue={data.treatment.diagnosis.diagnosis} /></div>
                <div className="field">
                  <label>Loại</label>
                  <select defaultValue={data.treatment.diagnosis.type}>
                    <option>Chính</option>
                    <option>Phụ</option>
                  </select>
                </div>
              </div>
              <div className="grid-2" style={{marginTop: '10px'}}>
                <div className="field"><label>Ghi chú lâm sàng</label><textarea defaultValue={data.treatment.diagnosis.note}></textarea></div>
                <div className="field"><label>Nhận định</label><textarea defaultValue={data.treatment.diagnosis.assessment}></textarea></div>
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '10px'}}>
                <button className="btn primary"><i className="fa-solid fa-plus"></i> Thêm chẩn đoán</button>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-head">
              <h3><i className="fa-solid fa-list"></i> Danh sách chẩn đoán</h3>
              <span className="tag primary">{data.treatment.diagnosisList.length} chẩn đoán</span>
            </div>
            <div className="section-body table-wrap">
              <table>
                <thead><tr><th>Mã ICD</th><th>Tên chẩn đoán</th><th>Loại</th><th>Ghi chú</th><th style={{width: '70px'}}>Thao tác</th></tr></thead>
                <tbody>
                  {data.treatment.diagnosisList.map((d, i) => (
                    <tr key={i}>
                      <td><strong>{d.icd}</strong></td>
                      <td>{d.name}</td>
                      <td><span className={`tag ${d.type === 'CHÍNH' ? 'warning' : 'gray'}`}>{d.type}</span></td>
                      <td>{d.note}</td>
                      <td><button className="icon-btn-sm delete"><i className="fa-solid fa-trash"></i></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Services Subtab */}
      {activeSubtab === 'services' && (
        <div className="tab-panel active">
          <div className="section">
            <div className="section-head"><h3><i className="fa-solid fa-flask"></i> Chỉ định dịch vụ</h3></div>
            <div className="section-body">
              <div className="grid-4" style={{gridTemplateColumns: '1fr 1fr 1fr'}}>
                <div className="field"><label>Dịch vụ</label>
                  <select>
                    <option>Xét nghiệm máu tổng quát</option>
                    <option selected>Chụp X-quang phổi</option>
                    <option>Siêu âm ổ bụng</option>
                    <option>Điện tâm đồ</option>
                  </select>
                </div>
                <div className="field"><label>Chẩn đoán liên quan</label>
                  <select>
                    <option>J06.9 - Nhiễm trùng hô hấp cấp</option>
                    <option>R06.0 - Khó thở</option>
                  </select>
                </div>
                <div className="field"><label>Số lượng</label>
                  <div className="inline">
                    <input type="number" defaultValue="1" min="1" />
                    <button className="btn primary"><i className="fa-solid fa-plus"></i> Thêm</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="section">
            <div className="section-head"><h3>Danh sách chỉ định</h3></div>
            <div className="section-body table-wrap">
              <table>
                <thead><tr><th>Dịch vụ</th><th>SL</th><th>Trạng thái</th><th>Thời gian</th><th style={{width: '70px'}}>Thao tác</th></tr></thead>
                <tbody>
                  {data.treatment.services.map((s, i) => (
                    <tr key={i}>
                      <td>{s.name}</td>
                      <td>{s.qty}</td>
                      <td><span className={`tag ${s.status === 'ĐÃ CHỈ ĐỊNH' ? 'primary' : 'success'}`}>{s.status}</span></td>
                      <td>{s.time}</td>
                      <td><button className="icon-btn-sm delete"><i className="fa-solid fa-trash"></i></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Subtab */}
      {activeSubtab === 'prescription' && (
        <div className="tab-panel active">
          <div className="section">
            <div className="section-head"><h3><i className="fa-solid fa-prescription-bottle-medical"></i> Kê đơn thuốc</h3><span className="tag warning"><i className="fa-solid fa-triangle-exclamation"></i> Kiểm tra dị ứng trước khi lưu</span></div>
            <div className="section-body">
              <div className="grid-4">
                <div className="field"><label>Thuốc</label><div className="inline"><input className="grow" placeholder="Tìm thuốc" /><button className="icon-btn-sm"><i className="fa-solid fa-search"></i></button></div></div>
                <div className="field"><label>Số lượng</label><input type="number" defaultValue="1" /></div>
                <div className="field"><label>Đơn vị</label><select><option>Viên</option><option selected>Ống</option><option>Chai</option></select></div>
                <div className="field"><label>Đường dùng</label><select><option selected>Tiêm tĩnh mạch</option><option>Uống</option><option>Tiêm bắp</option></select></div>
              </div>
              <div className="grid-4" style={{marginTop: '10px'}}>
                <div className="field"><label>Liều dùng</label><input defaultValue="1g" /></div>
                <div className="field"><label>Tần suất</label><input defaultValue="Mỗi 12 giờ" /></div>
                <div className="field"><label>Số ngày</label><input type="number" defaultValue="5" /></div>
                <div className="field"><label>&nbsp;</label><button className="btn primary"><i className="fa-solid fa-plus"></i> Thêm thuốc</button></div>
              </div>
            </div>
          </div>
          <div className="section">
            <div className="section-head"><h3>Đơn thuốc hiện tại</h3></div>
            <div className="section-body table-wrap">
              <table>
                <thead><tr><th>Thuốc</th><th>SL</th><th>Đơn vị</th><th>Liều</th><th>Tần suất</th><th>Số ngày</th><th>Đường dùng</th><th></th></tr></thead>
                <tbody>
                  {data.treatment.drugs.map((d, i) => (
                    <tr key={i}>
                      <td><strong>{d.name}</strong></td>
                      <td>{d.qty}</td>
                      <td>{d.unit}</td>
                      <td>{d.dose}</td>
                      <td>{d.freq}</td>
                      <td>{d.days}</td>
                      <td>{d.route}</td>
                      <td><button className="icon-btn-sm delete"><i className="fa-solid fa-trash"></i></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Results Subtab */}
      {activeSubtab === 'results' && (
        <div className="tab-panel active">
          <div className="section">
            <div className="section-head"><h3><i className="fa-solid fa-microscope"></i> Kết quả xét nghiệm</h3><span className="tag warning">2 chỉ số bất thường</span></div>
            <div className="section-body table-wrap">
              <table>
                <thead><tr><th>Chỉ số</th><th>Kết quả</th><th>Đơn vị</th><th>Khoảng tham chiếu</th><th>Đánh giá</th></tr></thead>
                <tbody>
                  {data.treatment.results.map((r, i) => (
                    <tr key={i}>
                      <td>{r.indicator}</td>
                      <td><strong>{r.result}</strong></td>
                      <td>{r.unit}</td>
                      <td>{r.ref}</td>
                      <td><span className={`tag ${r.evaluation === 'Cao' ? 'warning' : 'success'}`}>
                        {r.evaluation === 'Cao' && <><i className="fa-solid fa-arrow-up"></i> Cao</>}
                        {r.evaluation === 'Bình thường' && 'Bình thường'}
                      </span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="section">
            <div className="section-head"><h3><i className="fa-solid fa-image"></i> Chẩn đoán hình ảnh</h3></div>
            <div className="section-body">
              <div className="empty" style={{padding: '30px', textAlign: 'center', color: '#94a2ad', background: '#fafcfd', border: '1px dashed #d8e1e6', borderRadius: '6px'}}>
                <i className="fa-solid fa-file-circle-check" style={{fontSize: '23px', marginBottom: '8px', display: 'block', color: '#aab8c1'}}></i>Chưa có kết quả chẩn đoán hình ảnh mới.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentWorkspace;