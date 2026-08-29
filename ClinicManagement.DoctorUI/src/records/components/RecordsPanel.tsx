import React, { useState } from 'react';
import'../../styles/components/RecordsPanel.css'

// Dữ liệu mock
const mockRecords = [
  { id: 1, name: 'Nguyễn Thị An', code: 'BN-10234', avatar: 'NA', gender: 'Nữ', age: 39, active: true, updated: 'hôm nay' },
  { id: 2, name: 'Trần Văn Bình', code: 'BN-10789', avatar: 'TB', gender: 'Nam', age: 46, active: false, updated: '2 ngày trước' },
  { id: 3, name: 'Lê Thị Hoa', code: 'BN-11234', avatar: 'LH', gender: 'Nữ', age: 32, active: false, updated: '1 tuần trước' },
  { id: 4, name: 'Phạm Văn Hùng', code: 'BN-09876', avatar: 'PH', gender: 'Nam', age: 59, active: false, updated: '2 tuần trước' },
  { id: 5, name: 'Đỗ Minh Tâm', code: 'BN-12121', avatar: 'DT', gender: 'Nữ', age: 22, active: false, updated: '3 tuần trước' },
];

const RecordsPanel: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(mockRecords[0]);
  const [activeTab, setActiveTab] = useState('overview');

  // TODO: Gọi API lấy danh sách bệnh nhân

  const filteredRecords = mockRecords.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="panel-records active">
      <aside className="records-sidebar">
        <div className="records-sidebar-head">
          <h3><i className="fa-solid fa-users"></i> Hồ sơ bệnh án</h3>
          <span className="count">12 hồ sơ</span>
        </div>
        <div className="records-sidebar-search">
          <div className="search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              placeholder="Tìm bệnh nhân..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="records-patient-list">
          {filteredRecords.map(p => (
            <div
              key={p.id}
              className={`records-patient-item ${selectedPatient?.id === p.id ? 'active' : ''}`}
              onClick={() => setSelectedPatient(p)}
            >
              <div className="avatar-sm">{p.avatar}</div>
              <div className="pbody">
                <div className="pname">{p.name}</div>
                <div className="pcode">{p.code} · {p.gender} · {p.age} tuổi</div>
              </div>
              {p.active && <span className="ptype">Đang mở</span>}
            </div>
          ))}
        </div>
      </aside>

      <div className="records-content">
        <div className="records-content-head">
          <div className="title">
            <i className="fa-solid fa-file-medical"></i>
            <h2>Bệnh án bệnh nhân</h2>
          </div>
          <div className="actions">
            <button className="btn"><i className="fa-solid fa-clock-rotate-left"></i> Lịch sử</button>
            <button className="btn"><i className="fa-solid fa-print"></i> In bệnh án</button>
            <button className="btn primary"><i className="fa-solid fa-download"></i> Xuất hồ sơ</button>
          </div>
        </div>

        <div className="records-tabs">
          {['overview', 'personal', 'history', 'visits', 'diagnosis', 'documents'].map(tab => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <i className={`fa-solid ${tab === 'overview' ? 'fa-file-lines' :
                tab === 'personal' ? 'fa-user' :
                tab === 'history' ? 'fa-notes-medical' :
                tab === 'visits' ? 'fa-stethoscope' :
                tab === 'diagnosis' ? 'fa-disease' :
                'fa-paperclip'}`}></i>
              {tab === 'overview' ? 'Tổng quan' :
               tab === 'personal' ? 'Hành chính' :
               tab === 'history' ? 'Tiền sử' :
               tab === 'visits' ? 'Lịch sử khám' :
               tab === 'diagnosis' ? 'Chẩn đoán' :
               'Tài liệu'}
            </button>
          ))}
        </div>

        <div className="records-workspace">
          {activeTab === 'overview' && (
            <div className="tab-content active">
              <div className="grid-2col">
                <div>
                  <div className="record-card">
                    <div className="record-card-head"><h3><i className="fa-solid fa-circle-info"></i> Thông tin hồ sơ</h3><span className="badge green">Đang hoạt động</span></div>
                    <div className="record-card-body">
                      <div className="form-grid">
                        <div className="field"><label>Mã bệnh nhân</label><input className="readonly" value={selectedPatient?.code || ''} readOnly /></div>
                        <div className="field"><label>Họ và tên</label><input className="readonly" value={selectedPatient?.name || ''} readOnly /></div>
                        <div className="field"><label>Ngày sinh</label><input className="readonly" value="15/08/1985" readOnly /></div>
                        <div className="field"><label>Giới tính</label><input className="readonly" value={selectedPatient?.gender || ''} readOnly /></div>
                        <div className="field"><label>Số điện thoại</label><input className="readonly" value="0909 123 456" readOnly /></div>
                        <div className="field"><label>BHYT</label><input className="readonly" value="HS-1234567890" readOnly /></div>
                        <div className="field"><label>Ngày cập nhật</label><input className="readonly" value="26/08/2026 20:15" readOnly /></div>
                        <div className="field"><label>Bác sĩ phụ trách</label><input className="readonly" value="BS. Nguyễn Văn Tuấn" readOnly /></div>
                      </div>
                    </div>
                  </div>

                  <div className="record-card">
                    <div className="record-card-head"><h3><i className="fa-solid fa-stethoscope"></i> Tóm tắt bệnh án</h3><span className="badge blue">Nội tổng quát</span></div>
                    <div className="record-card-body">
                      <div className="form-grid">
                        <div className="field wide"><label>Chẩn đoán hiện tại</label><input value="Viêm phổi cộng đồng" /></div>
                        <div className="field"><label>Mã ICD</label><input value="J18.9" /></div>
                        <div className="field"><label>Mức độ</label><select><option selected>Trung bình</option><option>Nhẹ</option><option>Nặng</option></select></div>
                        <div className="field full"><label>Tóm tắt diễn biến</label><textarea>Bệnh nhân ho khan, khó thở, sốt nhẹ. X-quang phổi có hình ảnh tổn thương phù hợp viêm phổi. Đã được chỉ định xét nghiệm và điều trị theo phác đồ.</textarea></div>
                      </div>
                    </div>
                  </div>

                  <div className="record-card">
                    <div className="record-card-head"><h3><i className="fa-solid fa-table-list"></i> Chẩn đoán đã ghi nhận</h3><span className="badge gray">3 chẩn đoán</span></div>
                    <div className="record-card-body">
                      <table className="data-table">
                        <thead><tr><th>Mã ICD</th><th>Chẩn đoán</th><th>Loại</th><th>Ngày ghi nhận</th><th>Bác sĩ</th></tr></thead>
                        <tbody>
                          <tr><td>J18.9</td><td>Viêm phổi cộng đồng</td><td><span className="badge green">Chính</span></td><td>26/08/2026</td><td>BS. Nguyễn Văn Tuấn</td></tr>
                          <tr><td>R06.0</td><td>Khó thở</td><td><span className="badge blue">Phụ</span></td><td>26/08/2026</td><td>BS. Nguyễn Văn Tuấn</td></tr>
                          <tr><td>R05.9</td><td>Ho, không đặc hiệu</td><td><span className="badge blue">Phụ</span></td><td>26/08/2026</td><td>BS. Nguyễn Văn Tuấn</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="record-card">
                    <div className="record-card-head"><h3><i className="fa-solid fa-triangle-exclamation"></i> Cảnh báo an toàn</h3></div>
                    <div className="record-card-body">
                      <div className="alert-box"><strong>Dị ứng:</strong> Penicillin. Không sử dụng thuốc thuộc nhóm dị ứng nếu chưa đánh giá lại.</div>
                      <div className="alert-box" style={{borderColor: '#f2dfbf', background: '#fffaf1', color: '#96621c'}}><strong>BHYT:</strong> Cần kiểm tra thời hạn và quyền lợi trước khi hoàn tất hồ sơ.</div>
                    </div>
                  </div>

                  <div className="record-card">
                    <div className="record-card-head"><h3><i className="fa-solid fa-chart-simple"></i> Chỉ số hồ sơ</h3></div>
                    <div className="record-card-body">
                      <div className="info-list">
                        <div className="info-item"><span>Lần khám gần nhất</span><strong>26/08/2026</strong></div>
                        <div className="info-item"><span>Tổng lượt khám</span><strong>08 lượt</strong></div>
                        <div className="info-item"><span>Chẩn đoán hiện tại</span><strong>03</strong></div>
                        <div className="info-item"><span>Đơn thuốc gần nhất</span><strong>26/08/2026</strong></div>
                      </div>
                    </div>
                  </div>

                  <div className="record-card">
                    <div className="record-card-head"><h3><i className="fa-solid fa-clock-rotate-left"></i> Hoạt động gần đây</h3></div>
                    <div className="record-card-body">
                      <div className="timeline">
                        <div className="event"><div className="event-date">26/08/2026 · 20:15</div><div className="event-title">Cập nhật chẩn đoán</div><div className="event-desc">BS. Nguyễn Văn Tuấn ghi nhận viêm phổi cộng đồng.</div></div>
                        <div className="event"><div className="event-date">26/08/2026 · 19:48</div><div className="event-title">Hoàn thành lượt khám</div><div className="event-desc">Lượt khám nội tổng quát được cập nhật.</div></div>
                        <div className="event"><div className="event-date">12/07/2026</div><div className="event-title">Khám ngoại trú</div><div className="event-desc">Theo dõi bệnh hô hấp.</div></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'personal' && (
            <div className="tab-content active">
              <div className="record-card">
                <div className="record-card-head"><h3><i className="fa-solid fa-user"></i> Thông tin hành chính bệnh nhân</h3><span className="badge blue">Chỉ xem</span></div>
                <div className="record-card-body">
                  <div className="form-grid">
                    <div className="field wide"><label>Họ và tên</label><input value={selectedPatient?.name || ''} /></div>
                    <div className="field"><label>Giới tính</label><select><option selected>Nữ</option><option>Nam</option></select></div>
                    <div className="field"><label>Ngày sinh</label><input value="15/08/1985" /></div>
                    <div className="field"><label>Số CCCD</label><input value="079185001234" /></div>
                    <div className="field"><label>Số điện thoại</label><input value="0909 123 456" /></div>
                    <div className="field wide"><label>Địa chỉ</label><input value="Ninh Kiều, Cần Thơ" /></div>
                    <div className="field"><label>Người liên hệ</label><input value="Trần Văn B" /></div>
                    <div className="field"><label>Quan hệ</label><input value="Chồng" /></div>
                    <div className="field"><label>Điện thoại liên hệ</label><input value="0918 456 789" /></div>
                    <div className="field"><label>Nghề nghiệp</label><input value="Nhân viên văn phòng" /></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="tab-content active">
              <div className="grid-2col">
                <div className="record-card">
                  <div className="record-card-head"><h3><i className="fa-solid fa-notes-medical"></i> Tiền sử bệnh</h3><span className="badge blue">Đã khai thác</span></div>
                  <div className="record-card-body">
                    <table className="data-table">
                      <thead><tr><th>Nhóm</th><th>Nội dung</th><th>Ghi chú</th></tr></thead>
                      <tbody>
                        <tr><td>Bản thân</td><td>Viêm dạ dày</td><td>Điều trị năm 2024</td></tr>
                        <tr><td>Dị ứng</td><td>Penicillin</td><td><span className="badge red">Cảnh báo</span></td></tr>
                        <tr><td>Phẫu thuật</td><td>Chưa ghi nhận</td><td>—</td></tr>
                        <tr><td>Thuốc đang dùng</td><td>Không thường xuyên</td><td>—</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="record-card">
                  <div className="record-card-head"><h3><i className="fa-solid fa-people-group"></i> Tiền sử gia đình</h3></div>
                  <div className="record-card-body">
                    <textarea style={{width: '100%', border: '1px solid #d9e2e8', borderRadius: '7px', padding: '9px 10px', minHeight: '76px', resize: 'vertical', fontSize: '12px'}}>Chưa ghi nhận bệnh lý di truyền hoặc bệnh mạn tính đáng chú ý trong gia đình.</textarea>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'visits' && (
            <div className="tab-content active">
              <div className="record-card">
                <div className="record-card-head"><h3><i className="fa-solid fa-calendar-check"></i> Lịch sử các lượt khám</h3><button className="btn">Lọc thời gian</button></div>
                <div className="record-card-body">
                  <table className="data-table">
                    <thead><tr><th>Ngày khám</th><th>Khoa / Phòng</th><th>Chẩn đoán</th><th>Bác sĩ</th><th>Trạng thái</th><th></th></tr></thead>
                    <tbody>
                      <tr><td>26/08/2026</td><td>Nội / P03</td><td>Viêm phổi cộng đồng</td><td>Nguyễn Văn Tuấn</td><td><span className="badge green">Hoàn thành</span></td><td><button className="btn">Xem</button></td></tr>
                      <tr><td>12/07/2026</td><td>Nội / P02</td><td>Ho</td><td>Trần Minh A</td><td><span className="badge green">Hoàn thành</span></td><td><button className="btn">Xem</button></td></tr>
                      <tr><td>20/03/2026</td><td>Nội / P01</td><td>Viêm họng</td><td>Lê Văn B</td><td><span className="badge green">Hoàn thành</span></td><td><button className="btn">Xem</button></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'diagnosis' && (
            <div className="tab-content active">
              <div className="record-card">
                <div className="record-card-head"><h3><i className="fa-solid fa-disease"></i> Lịch sử chẩn đoán</h3></div>
                <div className="record-card-body">
                  <table className="data-table">
                    <thead><tr><th>Mã ICD</th><th>Tên bệnh</th><th>Lần đầu ghi nhận</th><th>Lần gần nhất</th><th>Số lần</th><th>Trạng thái</th></tr></thead>
                    <tbody>
                      <tr><td>J18.9</td><td>Viêm phổi</td><td>26/08/2026</td><td>26/08/2026</td><td>1</td><td><span className="badge orange">Đang theo dõi</span></td></tr>
                      <tr><td>R06.0</td><td>Khó thở</td><td>26/08/2026</td><td>26/08/2026</td><td>1</td><td><span className="badge gray">Triệu chứng</span></td></tr>
                      <tr><td>K29.7</td><td>Viêm dạ dày</td><td>20/03/2024</td><td>20/03/2024</td><td>1</td><td><span className="badge blue">Tiền sử</span></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="tab-content active">
              <div className="record-card">
                <div className="record-card-head"><h3><i className="fa-solid fa-paperclip"></i> Tài liệu bệnh án</h3><button className="btn primary"><i className="fa-solid fa-upload"></i> Thêm tài liệu</button></div>
                <div className="record-card-body">
                  <table className="data-table">
                    <thead><tr><th>Tài liệu</th><th>Loại</th><th>Ngày tạo</th><th>Người cập nhật</th><th>Trạng thái</th><th></th></tr></thead>
                    <tbody>
                      <tr><td>Phiếu khám bệnh 26-08-2026</td><td>Phiếu khám</td><td>26/08/2026</td><td>BS. Nguyễn Văn Tuấn</td><td><span className="badge green">Hợp lệ</span></td><td><button className="btn"><i className="fa-solid fa-eye"></i> Xem</button></td></tr>
                      <tr><td>Kết quả X-quang phổi</td><td>Chẩn đoán hình ảnh</td><td>26/08/2026</td><td>KLS</td><td><span className="badge green">Hợp lệ</span></td><td><button className="btn"><i className="fa-solid fa-eye"></i> Xem</button></td></tr>
                      <tr><td>Đơn thuốc ngoại trú</td><td>Đơn thuốc</td><td>26/08/2026</td><td>BS. Nguyễn Văn Tuấn</td><td><span className="badge green">Hợp lệ</span></td><td><button className="btn"><i className="fa-solid fa-eye"></i> Xem</button></td></tr>
                    </tbody>
                  </table>
                  <p className="note-text"><i className="fa-solid fa-circle-info"></i> Tài liệu được liên kết với bệnh án và lượt khám tương ứng.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordsPanel;