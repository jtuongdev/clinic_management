import React, { useState, useEffect, useCallback } from 'react';
import type { ElectronicRecordWorkspaceProps } from '../../types/examination/electronic-record.types';
import { examinationApi } from '../../api/examination.api';
import { patientWorkspaceApi } from '../../api/patientWorkspace.api';
import type { 
  ThongTinBenhNhanTrongLuotKhamDto, 
  ExaminationDetailResponse, 
  DiagnosisItem, 
  ServiceOrderDto 
} from '../../types/examination/index';

interface ExtendedElectronicRecordProps extends ElectronicRecordWorkspaceProps {
  luotKhamId?: number;
  onRefreshQueue?: () => void;
}

const ElectronicRecordWorkspace: React.FC<ExtendedElectronicRecordProps> = ({ 
  data, 
  luotKhamId,
  onFinish 
}) => {
  const { patient, visit, department, examination, treatment } = data;
  const targetId = luotKhamId || (parseInt(visit.replace(/\D/g, ''), 10) || 0);

  const [isLoading, setIsLoading] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimestamp, setLockTimestamp] = useState<string | null>(null);
  const [digitalSignature, setDigitalSignature] = useState<string | null>(null);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);

  // Dữ liệu thật từ backend API
  const [patientInfo, setPatientInfo] = useState<ThongTinBenhNhanTrongLuotKhamDto | null>(null);
  const [examDetail, setExamDetail] = useState<ExaminationDetailResponse | null>(null);
  const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>([]);
  const [services, setServices] = useState<ServiceOrderDto[]>([]);
  const [prescriptionDrugs, setPrescriptionDrugs] = useState<any[]>([]);

  // Tải dữ liệu bệnh án điện tử từ backend
  const loadClinicalData = useCallback(async () => {
    if (!targetId) return;
    setIsLoading(true);
    try {
      const [ptRes, exRes, dxRes, svRes, rxRes] = await Promise.allSettled([
        patientWorkspaceApi.getThongTinBenhNhan(targetId),
        examinationApi.getExaminationDetail(targetId),
        examinationApi.getDiagnoses(targetId),
        examinationApi.getServiceOrders(targetId),
        examinationApi.getPrescription(targetId),
      ]);

      if (ptRes.status === 'fulfilled' && ptRes.value.data?.data) {
        setPatientInfo(ptRes.value.data.data);
        if (ptRes.value.data.data.trangThai === 'HOAN_THANH') {
          setIsLocked(true);
        }
      }

      if (exRes.status === 'fulfilled' && exRes.value.data?.data) {
        setExamDetail(exRes.value.data.data);
      }

      if (dxRes.status === 'fulfilled' && dxRes.value.data?.data) {
        setDiagnoses(dxRes.value.data.data);
      }

      if (svRes.status === 'fulfilled' && svRes.value.data?.data) {
        setServices(svRes.value.data.data);
      }

      if (rxRes.status === 'fulfilled' && rxRes.value.data?.data) {
        const rxData = rxRes.value.data.data;
        const items = rxData.chiTietDonThuocs || rxData.items || [];
        setPrescriptionDrugs(items);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu bệnh án điện tử:', err);
    } finally {
      setIsLoading(false);
    }
  }, [targetId]);

  useEffect(() => {
    loadClinicalData();
  }, [loadClinicalData]);

  // Merge dữ liệu thật với prop fallback
  const displayPatientCode = patientInfo?.maBenhNhanNoiBo || patient.code || '---';
  const displayPatientName = patientInfo?.hoTen || patient.name || '---';
  const displayDob = patientInfo?.ngaySinh ? new Date(patientInfo.ngaySinh).toLocaleDateString('vi-VN') : patient.dob || '---';
  const displayGender = patientInfo?.gioiTinh === 'M' ? 'Nam' : patientInfo?.gioiTinh === 'F' ? 'Nữ' : patient.gender || '---';
  const displayVisit = patientInfo?.maLuotKham || visit || '---';
  const displayDept = patientInfo?.khoa || department || 'Khoa Khám Bệnh';

  const displayReason = examDetail?.lyDoKham || examination.reason || '---';
  const displayAssessment = examDetail?.ghiChuTienSu || examination.initialAssessment || '---';

  const primaryDiagnosis = diagnoses.find(d => d.laChanDoanChinh) || (diagnoses.length > 0 ? diagnoses[0] : null);
  const displayIcdCode = primaryDiagnosis?.maICD || treatment?.diagnosis?.icd || '---';
  const displayDiagnosisName = primaryDiagnosis?.tenChanDoan || treatment?.diagnosis?.diagnosis || treatment?.diagnosis?.name || '---';

  // Validation rules trước khi hoàn tất
  const hasPrimaryDiagnosis = Boolean(primaryDiagnosis?.maICD || treatment?.diagnosis?.icd || (treatment?.diagnosisList && treatment.diagnosisList.length > 0));
  const hasReason = Boolean(examDetail?.lyDoKham?.trim() || examination?.reason?.trim());
  const canComplete = hasPrimaryDiagnosis && hasReason;

  const handleCompleteAndLock = async () => {
    if (!canComplete) {
      alert('Vui lòng kiểm tra lại: Bắt buộc phải có Lý do khám và ít nhất một Chẩn đoán bệnh trước khi hoàn tất!');
      return;
    }

    if (!window.confirm('Xác nhận hoàn tất lượt khám và ký số khóa hồ sơ bệnh án điện tử? Sau khi ký, hồ sơ sẽ chuyển sang chế độ Chỉ đọc (Read-only).')) {
      return;
    }

    setIsFinishing(true);
    setCompletionMessage(null);
    setCompletionError(null);

    try {
      const sig = `SIG_${Date.now().toString(36).toUpperCase()}_DOC_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      
      const response = await examinationApi.completeAndLockExam(targetId, {
        chuKySo: sig,
        lyDo: 'Bác sĩ hoàn tất khám và ký số đóng bệnh án điện tử',
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Hồ sơ chưa đủ điều kiện hoàn tất.');
      }

      const resData = response.data.data;
      setDigitalSignature(resData?.chuKySo || sig);
      setIsLocked(true);
      setLockTimestamp(new Date().toLocaleTimeString('vi-VN'));
      setCompletionMessage(resData?.message || 'Lượt khám đã được hoàn tất thành công! Hồ sơ đã được ký số và chuyển sang khâu Viện phí.');

      if (onFinish) {
        onFinish();
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg = err?.response?.data?.message || err.message || 'Không thể hoàn tất và khóa hồ sơ.';
      setCompletionError(errorMsg);
      alert(`Lỗi khi hoàn tất và khóa hồ sơ:\n${errorMsg}`);
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div 
      className="tab-panel active"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflowY: 'auto',
        boxSizing: 'border-box',
        padding: '12px 14px',
      }}
    >
      {/* Thông báo hoàn tất thành công */}
      {completionMessage && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: '6px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fa-solid fa-circle-check" style={{ fontSize: '16px' }}></i>
          <strong>{completionMessage}</strong>
        </div>
      )}

      {/* Thông báo lỗi khi ký số / hoàn tất thất bại */}
      {completionError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: '6px', marginBottom: '14px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginTop: '3px', fontSize: '15px' }}></i>
            <div>
              <strong>Lỗi khi hoàn tất lượt khám:</strong>
              <div style={{ marginTop: '4px', fontSize: '13px', lineHeight: '1.4' }}>{completionError}</div>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setCompletionError(null)} 
            style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}
            title="Đóng thông báo"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      {/* Banner Khóa & Ký số */}
      {isLocked && (
        <>
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 16px', borderRadius: '6px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <i className="fa-solid fa-lock" style={{ marginRight: '8px' }}></i>
              <strong>HỒ SƠ ĐÃ ĐƯỢC KHÓA BỆNH ÁN ĐIỆN TỬ (READ-ONLY)</strong>
              <div style={{ fontSize: '12px', marginTop: '2px' }}>
                {lockTimestamp ? `Khóa lúc: ${lockTimestamp} | ` : ''}
                {digitalSignature ? <>Chữ ký số: <code>{digitalSignature}</code></> : 'Đã xác thực chữ ký số'}
              </div>
            </div>
            <span style={{ background: '#dc2626', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>ĐÃ KÝ SỐ</span>
          </div>

          {/* Hướng dẫn các bước tiếp theo sau khi chốt hồ sơ */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '12px 16px',
            marginBottom: '14px',
            fontSize: '13px',
            color: '#334155'
          }}>
            <div style={{ fontWeight: 700, marginBottom: '8px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fa-solid fa-route" style={{ color: '#0284c7' }}></i>
              <span>Quy trình tiếp theo sau khi bác sĩ ký số khóa hồ sơ:</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '8px 12px' }}>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>
                  <i className="fa-solid fa-cash-register" style={{ color: '#0284c7', marginRight: 6 }}></i>
                  1. Quầy Thu ngân / Viện phí
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}>
                  Hóa đơn viện phí tự động phát sinh. Hướng dẫn bệnh nhân tới quầy thu ngân để thanh toán tiền khám, dịch vụ và thuốc.
                </div>
              </div>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '8px 12px' }}>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>
                  <i className="fa-solid fa-prescription-bottle-medical" style={{ color: '#16a34a', marginRight: 6 }}></i>
                  2. Quầy Dược / Cấp phát thuốc
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}>
                  Đơn thuốc đã được duyệt tự động. Sau khi hóa đơn được thanh toán, Dược sĩ tiếp nhận đơn, kiểm tra FEFO và cấp thuốc.
                </div>
              </div>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '8px 12px' }}>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>
                  <i className="fa-solid fa-user-check" style={{ color: '#7c3aed', marginRight: 6 }}></i>
                  3. Tiếp nhận ca khám tiếp theo
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}>
                  Bác sĩ có thể bấm <strong>"In bệnh án"</strong> để phát cho bệnh nhân, sau đó chọn bệnh nhân tiếp theo trong hàng đợi bên trái.
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Thanh tác vụ trên đầu (Sticky Top Action Bar) - Đưa nút ký số và in lên trên khi thu nhỏ màn hình hoặc cuộn */}
      <div 
        className="emr-top-actions-bar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '10px 14px',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          marginBottom: '14px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <i className="fa-solid fa-file-circle-check" style={{ color: '#0284c7' }}></i>
            <span>Bệnh án điện tử</span>
          </h3>
          {isLoading && <span style={{ fontSize: '12px', color: '#64748b' }}><i className="fa-solid fa-spinner fa-spin"></i> Đang tải...</span>}
          <span className={`badge ${isLocked ? 'red' : 'green'}`} style={{
            fontSize: '11px',
            padding: '3px 8px',
            borderRadius: '12px',
            fontWeight: 600,
            background: isLocked ? '#fee2e2' : '#dcfce7',
            color: isLocked ? '#dc2626' : '#16a34a'
          }}>
            {isLocked ? 'Đã khóa hồ sơ' : 'Sẵn sàng chốt'}
          </span>
        </div>

        <div className="actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            type="button"
            className="btn" 
            onClick={() => window.print()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '32px', padding: '0 14px', fontSize: '12px', fontWeight: 600, borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', cursor: 'pointer' }}
          >
            <i className="fa-solid fa-print"></i> In bệnh án
          </button>
          {!isLocked && (
            <button 
              type="button"
              className="btn danger" 
              onClick={handleCompleteAndLock}
              disabled={isFinishing || !canComplete}
              title={!canComplete ? 'Cần có lý do khám và chẩn đoán' : 'Ký số và chốt hồ sơ'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '32px',
                padding: '0 16px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '4px',
                border: '1px solid #dc2626',
                background: '#dc2626',
                color: '#fff',
                cursor: (isFinishing || !canComplete) ? 'not-allowed' : 'pointer',
                opacity: (!canComplete || isFinishing) ? 0.6 : 1
              }}
            >
              <i className={`fa-solid ${isFinishing ? 'fa-spinner fa-spin' : 'fa-signature'}`}></i> 
              {isFinishing ? ' Đang xử lý...' : ' Ký số & Khóa hồ sơ khám'}
            </button>
          )}
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h3><i className="fa-solid fa-id-card"></i> Thông tin hành chính</h3>
        </div>
        <div className="section-body">
          <div className="form-grid">
            <div className="field"><label>Mã bệnh nhân</label><input className="readonly" value={displayPatientCode} readOnly /></div>
            <div className="field"><label>Họ tên</label><input className="readonly" value={displayPatientName} readOnly /></div>
            <div className="field"><label>Ngày sinh</label><input className="readonly" value={displayDob} readOnly /></div>
            <div className="field"><label>Giới tính</label><input className="readonly" value={displayGender} readOnly /></div>
            <div className="field"><label>Lượt khám</label><input className="readonly" value={displayVisit} readOnly /></div>
            <div className="field"><label>Khoa</label><input className="readonly" value={displayDept} readOnly /></div>
          </div>
        </div>
      </div>

      <div className="grid-2col">
        <div>
          <div className="section">
            <div className="section-head"><h3><i className="fa-solid fa-stethoscope"></i> Tóm tắt Khám bệnh</h3></div>
            <div className="section-body">
              <div className="field"><label>Lý do khám</label><input className="readonly" value={displayReason} readOnly /></div>
              <div style={{marginTop: '8px'}}>
                <div className="field"><label>Ghi chú diễn biến / Tiền sử</label><input className="readonly" value={displayAssessment} readOnly /></div>
              </div>
              {examDetail?.sinhHieu && (
                <div style={{marginTop: '8px', padding: '8px', background: '#f8fafc', borderRadius: '4px', fontSize: '12px'}}>
                  <strong>Sinh hiệu: </strong>
                  Mạch: {examDetail.sinhHieu.mach ?? '--'} ck/ph | HA: {examDetail.sinhHieu.huyetApTamThu ?? '--'}/{examDetail.sinhHieu.huyetApTamTruong ?? '--'} mmHg | SpO2: {examDetail.sinhHieu.spO2 ?? '--'}% | Nhiệt độ: {examDetail.sinhHieu.nhietDo ?? '--'}°C
                </div>
              )}
            </div>
          </div>

          <div className="section">
            <div className="section-head">
              <h3><i className="fa-solid fa-disease"></i> Chẩn đoán kết luận</h3>
              <span className="tag primary">{diagnoses.length} chẩn đoán</span>
            </div>
            <div className="section-body">
              <div className="field">
                <label>Mã ICD chính</label>
                <input className="readonly" value={displayIcdCode} readOnly />
              </div>
              <div style={{marginTop: '8px'}}>
                <div className="field">
                  <label>Bệnh chính</label>
                  <input className="readonly" value={displayDiagnosisName} readOnly />
                </div>
              </div>
              {diagnoses.length > 1 && (
                <div style={{ marginTop: '10px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Các chẩn đoán kèm theo:</label>
                  {diagnoses.filter(d => !d.laChanDoanChinh).map(d => (
                    <div key={d.id} style={{ fontSize: '12px', padding: '4px 0', borderBottom: '1px dashed #e2e8f0' }}>
                      <strong>{d.maICD}</strong> - {d.tenChanDoan} {d.ghiChu ? `(${d.ghiChu})` : ''}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="section">
            <div className="section-head">
              <h3><i className="fa-solid fa-prescription-bottle-medical"></i> Đơn thuốc ngoại trú</h3>
              <span className="tag primary">{prescriptionDrugs.length || treatment.drugs?.length || 0} thuốc</span>
            </div>
            <div className="section-body">
              {(prescriptionDrugs.length === 0 && (!treatment.drugs || treatment.drugs.length === 0)) ? (
                <div style={{ color: '#64748b', fontSize: '13px', fontStyle: 'italic' }}>Không kê đơn thuốc</div>
              ) : prescriptionDrugs.length > 0 ? (
                prescriptionDrugs.map((d: any, i: number) => (
                  <div key={d.id || i} style={{borderBottom: '1px solid var(--line)', padding: '6px 0', fontSize: '13px'}}>
                    <strong>{i + 1}. {d.tenThuoc || d.itemName || d.name}</strong> - {d.soLuong || d.quantity || d.qty} {d.donViTinh || d.baseUnit || d.unit} 
                    <div style={{ fontSize: '12px', color: '#64748b' }}>HDSD: {d.huongDanSuDung || d.huongDan || d.cachDung || d.dose || 'Theo chỉ dẫn của bác sĩ'}</div>
                  </div>
                ))
              ) : (
                treatment.drugs?.map((d, i) => (
                  <div key={i} style={{borderBottom: '1px solid var(--line)', padding: '6px 0', fontSize: '13px'}}>
                    <strong>{i + 1}. {d.name}</strong> - {d.qty} {d.unit} ({d.dose}, {d.freq}, {d.days} ngày)
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="section">
            <div className="section-head">
              <h3><i className="fa-solid fa-flask"></i> Dịch vụ cận lâm sàng</h3>
              <span className="tag primary">{services.length || treatment.services?.length || 0} dịch vụ</span>
            </div>
            <div className="section-body">
              {(services.length === 0 && (!treatment.services || treatment.services.length === 0)) ? (
                <div style={{ color: '#64748b', fontSize: '13px', fontStyle: 'italic' }}>Không chỉ định dịch vụ CLS</div>
              ) : services.length > 0 ? (
                services.map((s, i) => (
                  <div key={s.id || i} style={{borderBottom: '1px solid var(--line)', padding: '6px 0', fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <strong>{s.tenDichVu}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{s.loaiDichVu} {s.ketLuan ? `• Kết luận: ${s.ketLuan}` : ''}</div>
                    </div>
                    <span className={`tag ${s.trangThai === 'DA_CO_KET_QUA' ? 'success' : 'primary'}`}>
                      {s.trangThai === 'DA_CO_KET_QUA' ? 'Đã có KQ' : s.trangThai === 'DANG_THUC_HIEN' ? 'Đang làm' : 'Đã chỉ định'}
                    </span>
                  </div>
                ))
              ) : (
                treatment.services?.map((s, i) => (
                  <div key={i} style={{borderBottom: '1px solid var(--line)', padding: '6px 0', fontSize: '13px', display: 'flex', justifyContent: 'space-between'}}>
                    <span><strong>{s.name}</strong></span>
                    <span className="tag success">{s.status || 'Đã thực hiện'}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Checklist điều kiện trước khi chốt */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', marginTop: '14px' }}>
        <h4 style={{ fontSize: '13px', marginBottom: '8px', color: '#334155' }}>Kiểm tra điều kiện xuất hồ sơ:</h4>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
          <span style={{ color: hasReason ? '#16a34a' : '#dc2626' }}>
            <i className={`fa-solid ${hasReason ? 'fa-check' : 'fa-xmark'}`}></i> Lý do khám bệnh
          </span>
          <span style={{ color: hasPrimaryDiagnosis ? '#16a34a' : '#dc2626' }}>
            <i className={`fa-solid ${hasPrimaryDiagnosis ? 'fa-check' : 'fa-xmark'}`}></i> Chẩn đoán chính (ICD-10)
          </span>
          <span style={{ color: '#16a34a' }}>
            <i className="fa-solid fa-check"></i> Sinh hiệu ban đầu
          </span>
        </div>
      </div>

      <div className="footer-actions" style={{ marginTop: '16px' }}>
        <div className="save-state">
          <i className="fa-solid fa-circle-check"></i> {isLocked ? 'Hồ sơ đã khóa bất biến' : 'Bản nháp tự động lưu'}
        </div>
        <div className="actions" style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" onClick={() => window.print()}>
            <i className="fa-solid fa-print"></i> In bệnh án
          </button>
          {!isLocked && (
            <button 
              className="btn danger" 
              onClick={handleCompleteAndLock}
              disabled={isFinishing || !canComplete}
              title={!canComplete ? 'Cần có lý do khám và chẩn đoán' : 'Ký số và chốt hồ sơ'}
            >
              <i className={`fa-solid ${isFinishing ? 'fa-spinner fa-spin' : 'fa-signature'}`}></i> 
              {isFinishing ? ' Đang xử lý...' : ' Ký số & Khóa hồ sơ khám'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElectronicRecordWorkspace;
