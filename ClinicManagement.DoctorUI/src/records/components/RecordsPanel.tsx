import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/components/RecordsPanel.css';
import { 
  patientRecordsApi, 
  type BenhNhanRecordDto, 
  type PatientVisitHistoryDto 
} from '../api/patientRecords.api';

const RecordsPanel: React.FC = () => {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<BenhNhanRecordDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [patientDetail, setPatientDetail] = useState<BenhNhanRecordDto | null>(null);
  const [visits, setVisits] = useState<PatientVisitHistoryDto[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Tải danh sách bệnh nhân từ backend
  const fetchPatients = useCallback(async (keyword?: string) => {
    setIsLoadingList(true);
    try {
      const res = await patientRecordsApi.getPaged({ keyword, pageSize: 25 });
      const items = res.data?.data?.items || [];
      setPatients(items);
      setTotalCount(res.data?.data?.totalCount || 0);

      if (items.length > 0 && !selectedPatientId) {
        setSelectedPatientId(items[0].id);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách bệnh nhân:', err);
    } finally {
      setIsLoadingList(false);
    }
  }, [selectedPatientId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, fetchPatients]);

  // Tải chi tiết bệnh nhân, lịch sử khám, đơn thuốc khi chọn bệnh nhân
  useEffect(() => {
    if (!selectedPatientId) return;

    let isMounted = true;
    setIsLoadingDetail(true);

    Promise.allSettled([
      patientRecordsApi.getProfile(selectedPatientId),
      patientRecordsApi.getVisits(selectedPatientId, { pageSize: 15 }),
      patientRecordsApi.getPrescriptions(selectedPatientId, { pageSize: 10 }),
    ]).then(([profRes, visRes, rxRes]) => {
      if (!isMounted) return;

      if (profRes.status === 'fulfilled' && profRes.value.data?.data) {
        setPatientDetail(profRes.value.data.data);
      }
      if (visRes.status === 'fulfilled' && visRes.value.data?.data) {
        setVisits(visRes.value.data.data.items || []);
      }
      if (rxRes.status === 'fulfilled' && rxRes.value.data?.data) {
        setPrescriptions(rxRes.value.data.data.items || rxRes.value.data.data || []);
      }
      setIsLoadingDetail(false);
    });

    return () => {
      isMounted = false;
    };
  }, [selectedPatientId]);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patientDetail;

  const calculateAge = (dobString?: string) => {
    if (!dobString) return '--';
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return '--';
    const ageDifMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // const getInitials = (fullName?: string) => {
  //   if (!fullName) return 'BN';
  //   const parts = fullName.trim().split(' ');
  //   if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  //   return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
  // };

  const activeInsurance = patientDetail?.baoHiems?.find(b => b.isValid) || patientDetail?.baoHiems?.[0];
  const allergies = patientDetail?.tienSuBenhs?.filter(t => t.loaiTienSu?.toLowerCase().includes('dị ứng') || t.loaiTienSu?.toLowerCase().includes('diung')) || [];
  const latestVisit = visits[0];

  return (
    <div className="panel-records active">
      <aside className="records-sidebar">
        <div className="records-sidebar-head">
          <h3><i className="fa-solid fa-users"></i> Hồ sơ bệnh án</h3>
          <span className="count">{totalCount} hồ sơ</span>
        </div>
        <div className="records-sidebar-search">
          <div className="search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              placeholder="Tìm theo tên, mã BN, CCCD, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="records-patient-list">
          {isLoadingList && patients.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
              <i className="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu...
            </div>
          ) : patients.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
              Không tìm thấy hồ sơ phù hợp.
            </div>
          ) : (
            patients.map((p, index) => {
              const age = calculateAge(p.ngaySinh);
              const isSelected = selectedPatientId === p.id;
              const genderLabel = p.gioiTinh === 'M' ? 'Nam' : p.gioiTinh === 'F' ? 'Nữ' : p.gioiTinh || 'Khác';

              return (
                <div
                  key={p.id}
                  className={`records-patient-item ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedPatientId(p.id)}
                >
                  <div className="stt-cell">{index + 1}</div>
                  <div className="pbody">
                    <div className="pname">{p.hoTen}</div>
                    <div className="pcode">{p.maBenhNhanNoiBo || `BN-${p.id}`} · {genderLabel} · {age} tuổi</div>
                  </div>
                  {p.trangThaiLuotKham && (
                    <span className="ptype">{p.trangThaiLuotKham}</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      <div className="records-content">
        <div className="records-content-head">
          <div className="title">
            <i className="fa-solid fa-file-medical"></i>
            <h2>Hồ sơ bệnh án điện tử</h2>
            {isLoadingDetail && <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '12px' }}><i className="fa-solid fa-spinner fa-spin"></i> Đang đồng bộ...</span>}
          </div>
          <div className="actions">
            <button className="btn" onClick={() => window.print()}><i className="fa-solid fa-print"></i> In bệnh án</button>
            <button className="btn primary" onClick={() => alert('Xuất tệp hồ sơ PDF chuẩn Bộ Y Tế')}><i className="fa-solid fa-download"></i> Xuất hồ sơ</button>
          </div>
        </div>

        <div className="records-tabs">
          {['overview', 'personal', 'history', 'visits', 'prescriptions'].map(tab => (
            <button
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <i className={`fa-solid ${
                tab === 'overview' ? 'fa-file-lines' :
                tab === 'personal' ? 'fa-user' :
                tab === 'history' ? 'fa-notes-medical' :
                tab === 'visits' ? 'fa-stethoscope' :
                'fa-prescription-bottle-medical'}`}></i>
              {tab === 'overview' ? 'Tổng quan' :
               tab === 'personal' ? 'Hành chính' :
               tab === 'history' ? 'Tiền sử & Dị ứng' :
               tab === 'visits' ? 'Lịch sử khám' :
               'Đơn thuốc'}
            </button>
          ))}
        </div>
        {/* tabs records-wor */}
        <div className="records-workspace">
          {activeTab === 'overview' && (
            <div className="tab-content active">
              <div className="grid-2col">
                <div>
                  <div className="record-card">
                    <div className="record-card-head">
                      <h3><i className="fa-solid fa-circle-info"></i> Thông tin hồ sơ</h3>
                      <span className="badge green">Đang hoạt động</span>
                    </div>
                    {/* thông tin hồ sơ bệnh nhân */}
                    <div className="record-card-body">
                      <div className="form-grid">
                        <div className="field"><label>Mã bệnh nhân</label><input className="readonly" value={selectedPatient?.maBenhNhanNoiBo || (selectedPatient ? `BN-${selectedPatient.id}` : '---')} readOnly /></div>
                        <div className="field"><label>Họ và tên</label><input className="readonly" value={selectedPatient?.hoTen || '---'} readOnly /></div>
                        <div className="field"><label>Ngày sinh</label><input className="readonly" value={selectedPatient?.ngaySinh ? new Date(selectedPatient.ngaySinh).toLocaleDateString('vi-VN') : '---'} readOnly /></div>
                        <div className="field"><label>Giới tính</label><input className="readonly" value={selectedPatient?.gioiTinh === 'M' ? 'Nam' : selectedPatient?.gioiTinh === 'F' ? 'Nữ' : 'Khác'} readOnly /></div>
                        <div className="field"><label>Số điện thoại</label><input className="readonly" value={selectedPatient?.dienThoai || '---'} readOnly /></div>
                        <div className="field"><label>Số thẻ BHYT</label><input className="readonly" value={activeInsurance?.soThe || 'Không có'} readOnly /></div>
                        <div className="field"><label>Cơ sở đăng ký</label><input className="readonly" value={selectedPatient?.tenKhoa || 'Bệnh viện Đa khoa'} readOnly /></div>
                        <div className="field"><label>Số CCCD / CMND</label><input className="readonly" value={selectedPatient?.soCCCD || '---'} readOnly /></div>
                      </div>
                    </div>
                  </div>
                  {/* Lươt khám gần nhất */}
                  <div className="record-card">
                    <div className="record-card-head">
                      <h3><i className="fa-solid fa-stethoscope"></i> Lượt khám gần nhất</h3>
                      <span className="badge blue">{latestVisit?.khoa || 'Chưa có'}</span>
                    </div>
                    <div className="record-card-body">
                      {latestVisit ? (
                        <div className="form-grid">
                          <div className="field wide"><label>Lý do khám</label><input className="readonly" value={latestVisit.lyDoKham || '---'} readOnly /></div>
                          <div className="field"><label>Ngày khám</label><input className="readonly" value={new Date(latestVisit.ngayKham).toLocaleDateString('vi-VN')} readOnly /></div>
                          <div className="field"><label>Bác sĩ điều trị</label><input className="readonly" value={latestVisit.bacSi || '---'} readOnly /></div>
                          <div className="field full"><label>Phòng khám</label><input className="readonly" value={latestVisit.tenPhongKham || '---'} readOnly /></div>
                        </div>
                      ) : (
                        <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '12px' }}>Chưa ghi nhận lượt khám nào.</div>
                      )}
                    </div>
                  </div>
                </div>
                {/* //Cảnh báo an toàn y tế */}
                <div>
                  <div className="record-card">
                    <div className="record-card-head"><h3><i className="fa-solid fa-triangle-exclamation"></i> Cảnh báo an toàn y tế</h3></div>
                    <div className="record-card-body">
                      {allergies.length > 0 ? (
                        allergies.map(a => (
                          <div key={a.id} className="alert-box" style={{ marginBottom: '8px' }}>
                            <strong>Dị ứng: </strong> {a.ten} {a.ghiChu ? `(${a.ghiChu})` : ''}
                          </div>
                        ))
                      ) : (
                        <div style={{ color: '#16a34a', fontSize: '13px', padding: '8px', background: '#f0fdf4', borderRadius: '4px' }}>
                          <i className="fa-solid fa-circle-check"></i> Chưa ghi nhận tiền sử dị ứng thuốc hay thực phẩm.
                        </div>
                      )}
                      {activeInsurance && (
                        <div className="alert-box" style={{ borderColor: '#bfdbfe', background: '#eff6ff', color: '#1e40af', marginTop: '8px' }}>
                          <strong>BHYT:</strong> {activeInsurance.tenNhaCungCap} (Mức hưởng: {activeInsurance.mucHuong}%)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="record-card">
                    <div className="record-card-head"><h3><i className="fa-solid fa-chart-simple"></i> Chỉ số hồ sơ</h3></div>
                    <div className="record-card-body">
                      <div className="info-list">
                        <div className="info-item"><span>Lần khám gần nhất</span><strong>{latestVisit ? new Date(latestVisit.ngayKham).toLocaleDateString('vi-VN') : 'Chưa có'}</strong></div>
                        <div className="info-item"><span>Tổng lượt khám</span><strong>{visits.length} lượt</strong></div>
                        <div className="info-item"><span>Tiền sử ghi nhận</span><strong>{patientDetail?.tienSuBenhs?.length || 0} mục</strong></div>
                        <div className="info-item"><span>Đơn thuốc đã kê</span><strong>{prescriptions.length} đơn</strong></div>
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
                <div className="record-card-head"><h3><i className="fa-solid fa-user"></i> Thông tin hành chính bệnh nhân</h3><span className="badge blue">Dữ liệu từ CSDL</span></div>
                <div className="record-card-body">
                  <div className="form-grid">
                    <div className="field wide"><label>Họ và tên</label><input className="readonly" value={selectedPatient?.hoTen || ''} readOnly /></div>
                    <div className="field"><label>Giới tính</label><input className="readonly" value={selectedPatient?.gioiTinh === 'M' ? 'Nam' : selectedPatient?.gioiTinh === 'F' ? 'Nữ' : 'Khác'} readOnly /></div>
                    <div className="field"><label>Ngày sinh</label><input className="readonly" value={selectedPatient?.ngaySinh ? new Date(selectedPatient.ngaySinh).toLocaleDateString('vi-VN') : ''} readOnly /></div>
                    <div className="field"><label>Số CCCD / Định danh</label><input className="readonly" value={selectedPatient?.soCCCD || ''} readOnly /></div>
                    <div className="field"><label>Số điện thoại</label><input className="readonly" value={selectedPatient?.dienThoai || ''} readOnly /></div>
                    <div className="field"><label>Email</label><input className="readonly" value={selectedPatient?.email || '---'} readOnly /></div>
                    <div className="field wide"><label>Địa chỉ thường trú</label><input className="readonly" value={selectedPatient?.diaChi || '---'} readOnly /></div>
                    <div className="field"><label>Người liên hệ khẩn cấp</label><input className="readonly" value={selectedPatient?.nguoiLienHeTen || '---'} readOnly /></div>
                    <div className="field"><label>Điện thoại người liên hệ</label><input className="readonly" value={selectedPatient?.nguoiLienHeDienThoai || '---'} readOnly /></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="tab-content active">
              <div className="grid-2col">
                <div className="record-card">
                  <div className="record-card-head"><h3><i className="fa-solid fa-notes-medical"></i> Tiền sử bệnh & Dị ứng</h3><span className="badge blue">{patientDetail?.tienSuBenhs?.length || 0} mục</span></div>
                  <div className="record-card-body">
                    {(!patientDetail?.tienSuBenhs || patientDetail.tienSuBenhs.length === 0) ? (
                      <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '12px' }}>Chưa ghi nhận tiền sử bệnh.</div>
                    ) : (
                      <table className="data-table">
                        <thead><tr><th>Phân loại</th><th>Tên bệnh / Tác nhân</th><th>Ghi chú</th><th>Ngày ghi</th></tr></thead>
                        <tbody>
                          {patientDetail.tienSuBenhs.map(t => (
                            <tr key={t.id}>
                              <td><span className="badge gray">{t.loaiTienSu}</span></td>
                              <td><strong>{t.ten}</strong></td>
                              <td>{t.ghiChu || '—'}</td>
                              <td>{t.ngayGhiNhan ? new Date(t.ngayGhiNhan).toLocaleDateString('vi-VN') : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
                <div className="record-card">
                  <div className="record-card-head"><h3><i className="fa-solid fa-shield-halved"></i> Thông tin Bảo hiểm Y tế</h3></div>
                  <div className="record-card-body">
                    {(!patientDetail?.baoHiems || patientDetail.baoHiems.length === 0) ? (
                      <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '12px' }}>Không có thông tin bảo hiểm y tế.</div>
                    ) : (
                      patientDetail.baoHiems.map(b => (
                        <div key={b.id} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>{b.tenNhaCungCap} ({b.loaiBaoHiem})</strong>
                            <span className={`badge ${b.isValid ? 'green' : 'red'}`}>{b.isValid ? 'Còn hạn' : 'Hết hạn'}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Số thẻ: <code>{b.soThe}</code> · Mức hưởng: {b.mucHuong}%</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                            Hiệu lực: {b.ngayBatDau ? new Date(b.ngayBatDau).toLocaleDateString('vi-VN') : '--'} – {b.ngayKetThuc ? new Date(b.ngayKetThuc).toLocaleDateString('vi-VN') : '--'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'visits' && (
            <div className="tab-content active">
              <div className="record-card">
                <div className="record-card-head"><h3><i className="fa-solid fa-calendar-check"></i> Lịch sử các lượt khám</h3><span className="badge blue">{visits.length} lượt</span></div>
                <div className="record-card-body">
                  {visits.length === 0 ? (
                    <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '12px' }}>Bệnh nhân chưa có lượt khám nào được lưu trữ.</div>
                  ) : (
                    <table className="data-table">
                      <thead><tr><th>Ngày khám</th><th>Khoa / Phòng</th><th>Lý do khám</th><th>Bác sĩ</th><th>Trạng thái</th></tr></thead>
                      <tbody>
                        {visits.map(v => (
                          <tr key={v.id}>
                            <td>{new Date(v.ngayKham).toLocaleDateString('vi-VN')}</td>
                            <td><strong>{v.khoa}</strong> · {v.tenPhongKham}</td>
                            <td>{v.lyDoKham || '---'}</td>
                            <td>{v.bacSi} ({v.chuyenKhoaBacSi})</td>
                            <td><span className={`badge ${v.trangThai === 'HOAN_THANH' ? 'green' : 'blue'}`}>{v.trangThai}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="tab-content active">
              <div className="record-card">
                <div className="record-card-head"><h3><i className="fa-solid fa-prescription-bottle-medical"></i> Lịch sử đơn thuốc đã kê</h3></div>
                <div className="record-card-body">
                  {prescriptions.length === 0 ? (
                    <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '12px' }}>Chưa có đơn thuốc nào được ghi nhận.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {prescriptions.map((rx: any, i: number) => (
                        <div key={rx.id || i} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong>Đơn thuốc #{rx.id || i + 1} ({rx.ngayKe ? new Date(rx.ngayKe).toLocaleDateString('vi-VN') : 'Lượt khám'})</strong>
                            <span className="tag primary">{rx.bacSiKe || 'Bác sĩ điều trị'}</span>
                          </div>
                          {rx.chiTietDonThuocs ? (
                            rx.chiTietDonThuocs.map((d: any, di: number) => (
                              <div key={di} style={{ fontSize: '12px', padding: '4px 0', borderBottom: '1px dashed #f1f5f9' }}>
                                • <strong>{d.tenThuoc}</strong>: {d.soLuong} {d.donViTinh} ({d.cachDung})
                              </div>
                            ))
                          ) : (
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Chi tiết đơn thuốc lưu trong bệnh án điện tử.</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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