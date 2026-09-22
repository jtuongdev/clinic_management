import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatientProfile } from '../hook/usePatientProfile';
import OverviewTab from '../components/patientDetail/OverviewTab';
import PersonalTab from '../components/patientDetail/PersonalTab';
import VisitsTab from '../components/patientDetail/VisitsTab/VisitsTab';
import PrescriptionsTab from '../components/patientDetail/VisitsTab/PrescriptionsTab';
import HistoryTab from '../components/patientDetail/VisitsTab/HistoryTab';
import LabsTab from '../components/patientDetail/VisitsTab/LabsTab';
import BillingTab from '../components/patientDetail/BillingTab';
import InsuranceTab from '../components/patientDetail/InsuranceTab';
import AccountTab from '../components/patientDetail/AccountTab';

const patientDetailStyles = `
.patient-detail-page,
.patient-detail-page * {
    box-sizing: border-box;
}

.patient-detail-page {
    font-family: 'Inter', -apple-system, sans-serif;
    background: #f0f2f8;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.patient-detail-page.app-wrapper,
.patient-detail-page .app-wrapper,
.app-wrapper {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #fff;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.patient-detail-page .brand,
.brand {
    display: flex;
    align-items: center;
    gap: 12px;
    color: white;
    font-weight: 700;
    font-size: 18px;
}

.patient-detail-page .brand i,
.brand i {
    font-size: 24px;
}

.patient-detail-page .back-row,
.back-row {
    padding: 10px 24px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    flex-shrink: 0;
}

.patient-detail-page .back-row-left,
.back-row-left {
    display: flex;
    align-items: center;
    gap: 16px;
}

.patient-detail-page .back-row-right,
.back-row-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.patient-detail-page .back-btn,
.back-btn {
    padding: 8px 16px;
    border: 1px solid #dee2e6;
    background: #fff;
    border-radius: 6px;
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #1e4663;
}

.patient-detail-page .back-btn:hover,
.back-btn:hover {
    background: #f1f5f9;
    border-color: #2c7da0;
    color: #2c7da0;
    transform: translateY(-1px);
}

.patient-detail-page .back-btn i,
.back-btn i {
    font-size: 14px;
}

.patient-detail-page .back-btn span,
.back-btn span {
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
}

.patient-detail-page .back-row-right button,
.back-row-right button {
    padding: 8px 18px;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    transition: 0.2s;
    background: #eef2ff;
    color: #1e4663;
}

.patient-detail-page .back-row-right button:hover,
.back-row-right button:hover {
    background: #d6eaf8;
}

.patient-detail-page .back-row-right .btn-primary,
.back-row-right .btn-primary {
    background: #27ae60;
    color: #fff;
}

.patient-detail-page .back-row-right .btn-primary:hover,
.back-row-right .btn-primary:hover {
    background: #1e8449;
}

.patient-detail-page .back-row-right .avatar,
.back-row-right .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #eef2ff;
    color: #1e4663;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
}

.patient-detail-page .main-layout,
.main-layout {
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 16px;
    background: #fff;
}

.patient-detail-page .main-tabs-container,
.main-tabs-container {
    flex-shrink: 0;
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 10;
    padding-top: 4px;
    border-bottom: 2px solid #e2e8f0;
    margin-bottom: 0;
}

.patient-detail-page .tabs-container,
.tabs-container {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}

.patient-detail-page .tab-btn,
.tab-btn {
    padding: 8px 18px;
    border: none;
    background: transparent;
    font-weight: 500;
    font-size: 13px;
    color: #4a5568;
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.patient-detail-page .tab-btn:hover,
.tab-btn:hover {
    color: #1e4663;
}

.patient-detail-page .tab-btn.active,
.tab-btn.active {
    color: #2c7da0;
    border-bottom-color: #2c7da0;
    font-weight: 600;
}

.patient-detail-page .main-content,
.main-content {
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    gap: 24px;
}

.patient-detail-page .left-panel,
.left-panel {
    width: 340px;
    flex-shrink: 0;
    background: #ffffff;
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.patient-detail-page .panel-header,
.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 18px;
    background: #f8fafc;
    border-bottom: 2px solid #e2e8f0;
    flex-shrink: 0;
}

.patient-detail-page .panel-header h4,
.panel-header h4 {
    font-size: 14px;
    color: #1e4663;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
}

.patient-detail-page .panel-header .badge-count,
.panel-header .badge-count {
    background: #eef2ff;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: #2c7da0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.patient-detail-page .activity-list,
.activity-list {
    overflow-y: auto;
    flex: 1;
    scrollbar-width: thin;
}

.activity-list::-webkit-scrollbar {
    width: 6px;
}

.activity-list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.activity-list::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
}

.patient-detail-page .activity-row,
.activity-row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    padding: 14px 18px;
    border-bottom: 1px solid #f0f2f5;
    cursor: pointer;
    transition: all 0.2s;
    align-items: center;
    gap: 12px;
}

.activity-row:hover {
    background: #f8f9ff;
}

.activity-row.active {
    background: #eef4ff;
    border-left: 4px solid #2c7da0;
}

.activity-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #eef2ff;
    color: #2c7da0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
}

.activity-content {
    font-size: 13px;
    color: #1e2f3e;
    line-height: 1.4;
}

.activity-content .title {
    font-weight: 600;
}

.activity-content .desc {
    font-size: 12px;
    color: #7f8c8d;
    margin-top: 2px;
}

.activity-time {
    font-size: 11px;
    color: #7f8c8d;
    white-space: nowrap;
}

.activity-status {
    font-size: 10px;
    font-weight: 600;
    padding: 2px 10px;
    border-radius: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: inline-block;
}

.activity-status.hoan-thanh {
    background: #d4efdf;
    color: #1e8449;
}

.activity-status.dang-xu-ly {
    background: #fef9e7;
    color: #b7950b;
}

.activity-status.that-bai {
    background: #fdedec;
    color: #c0392b;
}

.patient-detail-page .right-panel,
.right-panel {
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding-right: 4px;
}

.sub-tabs-container {
    display: flex;
    gap: 4px;
    margin-bottom: 12px;
    padding: 0 0 4px 0;
    border-bottom: 1px solid #e2e8f0;
    flex-wrap: wrap;
    position: sticky;
    top: 0;
    background: #fff;
    z-index: 9;
    padding-top: 4px;
    flex-shrink: 0;
}

.sub-tab-btn {
    padding: 6px 14px;
    border: none;
    background: transparent;
    font-weight: 500;
    font-size: 12px;
    color: #4a5568;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.sub-tab-btn:hover {
    color: #1e4663;
}

.sub-tab-btn.active {
    color: #2c7da0;
    border-bottom-color: #2c7da0;
    font-weight: 600;
}

.patient-detail-page .tab-content,
.tab-content {
    flex: 1;
}

.patient-detail-page .card,
.card {
    background: #fefefe;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    padding: 18px;
    margin-bottom: 16px;
}

.card .section-title {
    font-weight: 600;
    font-size: 14px;
    color: #2c3e50;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.patient-detail-page .tab-header,
.tab-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.tab-header h2 {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
}

.tab-header .edit-btn {
    padding: 6px 16px;
    border: 1px solid #2c7da0;
    background: #fff;
    color: #2c7da0;
    border-radius: 6px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.tab-header .edit-btn:hover {
    background: #2c7da0;
    color: #fff;
}

.grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}

.grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

.field label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #4a5568;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-bottom: 2px;
}

.field strong {
    font-size: 14px;
    font-weight: 600;
}

.field .muted {
    color: #7f8c8d;
    font-size: 12px;
}

.table-wrap {
    overflow-x: auto;
}

.patient-detail-page table,
table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.patient-detail-page th,
th {
    text-align: left;
    padding: 8px 8px 8px 0;
    font-weight: 600;
    color: #4a5568;
    border-bottom: 1px solid #e2e8f0;
}

.patient-detail-page td,
td {
    padding: 8px 8px 8px 0;
    border-bottom: 1px solid #f0f2f5;
}

.tag {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
}

.tag-success {
    background: #d4efdf;
    color: #1e8449;
}

.tag-danger {
    background: #fdedec;
    color: #c0392b;
}

.tag-primary {
    background: #d6eaf8;
    color: #21618c;
}

.tag-warning {
    background: #fef9e7;
    color: #b7950b;
}

.small-btn {
    padding: 4px 12px;
    font-size: 12px;
    border-radius: 6px;
    border: 1px solid #dee2e6;
    background: #fff;
    cursor: pointer;
    transition: 0.2s;
}

.small-btn:hover {
    background: #f1f5f9;
}

.vitals-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
}

.vital-item {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px 14px;
    background: #fff;
    text-align: center;
}

.vital-item small {
    display: block;
    color: #7f8c8d;
    font-size: 10px;
    text-transform: uppercase;
    font-weight: 700;
}

.vital-item b {
    display: block;
    font-size: 18px;
    font-weight: 700;
    margin-top: 4px;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    margin-bottom: 16px;
}

.summary-box {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 14px 16px;
    background: #f8fafc;
}

.summary-box small {
    display: block;
    color: #7f8c8d;
    font-size: 11px;
    font-weight: 600;
}

.summary-box b {
    display: block;
    font-size: 16px;
    font-weight: 700;
    margin: 4px 0 2px;
}

.timeline {
    padding: 16px 20px;
}

.event {
    border-left: 2px solid #e2e8f0;
    padding: 12px 0 12px 24px;
    position: relative;
}

.event::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 18px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #2c7da0;
    border: 2px solid #fff;
    box-shadow: 0 0 0 2px #d6eaf8;
}

.event-date {
    font-size: 11px;
    color: #7f8c8d;
    font-weight: 600;
}

.event-title {
    font-weight: 700;
    margin: 4px 0;
    font-size: 14px;
}

.event-text {
    font-size: 12px;
    color: #7f8c8d;
}

.invoice-list {
    display: grid;
    gap: 10px;
    padding: 12px 0;
}

.invoice-row {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 14px 16px;
    display: grid;
    grid-template-columns: 1.4fr 0.8fr 0.8fr auto;
    align-items: center;
    gap: 12px;
    transition: 0.2s;
}

.invoice-row:hover {
    border-color: #2c7da0;
    background: #f8f9ff;
}

.invoice-row b {
    font-size: 14px;
}

.invoice-row small {
    display: block;
    color: #7f8c8d;
    font-size: 11px;
    margin-top: 2px;
}

.invoice-total {
    text-align: right;
    font-weight: 700;
    font-size: 15px;
}

.invoice-total small {
    display: block;
    font-weight: 400;
    font-size: 11px;
    color: #7f8c8d;
}

.app-footer {
    padding: 12px 24px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    font-size: 12px;
    color: #5a6e8a;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    flex-shrink: 0;
}

@media (max-width: 1100px) {
    .patient-detail-page .main-content,
    .main-content {
        flex-direction: column;
    }
    .patient-detail-page .left-panel,
    .left-panel {
        width: 100%;
    }
    .patient-detail-page .activity-list,
    .activity-list {
        max-height: 40vh;
    }
}

@media (max-width: 768px) {
    .grid-2,
    .grid-3,
    .grid-4 {
        grid-template-columns: 1fr;
    }
    .summary-grid {
        grid-template-columns: 1fr 1fr;
    }
    .vitals-grid {
        grid-template-columns: 1fr 1fr;
    }
    .invoice-row {
        grid-template-columns: 1fr;
        gap: 8px;
    }
    .invoice-total {
        text-align: left;
    }
    .back-row {
        flex-wrap: wrap;
        padding: 8px 16px;
    }
    .back-row-right {
        flex-wrap: wrap;
    }
    .tabs-container {
        flex-wrap: wrap;
    }
    .tab-btn {
        font-size: 12px;
        padding: 6px 12px;
    }
}

@media (max-width: 480px) {
    .summary-grid {
        grid-template-columns: 1fr;
    }
    .vitals-grid {
        grid-template-columns: 1fr 1fr;
    }
}

.patient-detail-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    font-size: 18px;
    color: #7f8c8d;
}

.patient-detail-empty {
    text-align: center;
    padding: 40px;
    color: #7f8c8d;
}
`;

export const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const patientId = id ? parseInt(id, 10) : 0;

  const [activeTab, setActiveTab] = useState('overview');
  const [subTab, setSubTab] = useState('visits');

  const { profile, loading, error } = usePatientProfile(patientId);

  // Xây dựng danh sách hoạt động gần đây từ dữ liệu API thực tế
  const activities = useMemo(() => {
    if (!profile) return [];

    const list: Array<{
      id: string;
      icon: string;
      title: string;
      desc: string;
      time: string;
      rawDate: Date;
      status: string;
    }> = [];

    // 1. Lượt khám gần nhất
    if (profile.luotKhamGanNhat && Array.isArray(profile.luotKhamGanNhat)) {
      profile.luotKhamGanNhat.forEach((v) => {
        const vDate = v.ngayKham ? new Date(v.ngayKham) : new Date();
        const statusMap: Record<string, string> = {
          CHO_KHAM: 'Chờ khám',
          DANG_KHAM: 'Đang khám',
          DA_KHAM: 'Đã khám',
          KET_LUAN: 'Kết luận',
          HOAN_THANH: 'Hoàn thành',
          DA_HUY: 'Đã hủy',
        };
        const descParts = [];
        if (v.khoa) descParts.push(v.khoa);
        if (v.bacSi) descParts.push(`BS. ${v.bacSi}`);
        if (v.chanDoanChinh) descParts.push(`CĐ: ${v.chanDoanChinh}`);
        else if (v.lyDoKham) descParts.push(`Lý do: ${v.lyDoKham}`);

        list.push({
          id: `visit-${v.id}`,
          icon: 'fa-notes-medical',
          title: 'Khám bệnh',
          desc: descParts.join(' — ') || 'Khám lâm sàng',
          time: vDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
          rawDate: vDate,
          status: statusMap[v.trangThai] || v.trangThai || 'Hoàn thành',
        });
      });
    }

    // 2. Hóa đơn gần nhất
    if (profile.hoaDonGanNhat && Array.isArray(profile.hoaDonGanNhat)) {
      profile.hoaDonGanNhat.forEach((h) => {
        const hDate = h.ngayLap ? new Date(h.ngayLap) : new Date();
        const statusMap: Record<string, string> = {
          CHO_THANH_TOAN: 'Chờ thu',
          DA_THANH_TOAN: 'Đã thu',
          DA_HUY: 'Đã hủy',
        };
        const formattedTotal = Number(h.tongTien || 0).toLocaleString('vi-VN') + ' ₫';
        const desc = h.conNo > 0
          ? `${formattedTotal} (Còn nợ: ${Number(h.conNo).toLocaleString('vi-VN')} ₫)`
          : `${formattedTotal} (Đã thanh toán đủ)`;

        list.push({
          id: `inv-${h.id}`,
          icon: 'fa-coins',
          title: `Hóa đơn #${h.soHoaDon || h.id}`,
          desc: desc,
          time: hDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
          rawDate: hDate,
          status: statusMap[h.trangThai] || h.trangThai || 'Đã thu',
        });
      });
    }

    // 3. Tiền sử bệnh
    if (profile.tienSuBenhs && Array.isArray(profile.tienSuBenhs)) {
      profile.tienSuBenhs.forEach((t) => {
        const tDate = t.ngayGhiNhan ? new Date(t.ngayGhiNhan) : new Date();
        list.push({
          id: `ts-${t.id}`,
          icon: t.loaiTienSu === 'DI_UNG' ? 'fa-triangle-exclamation' : 'fa-history',
          title: t.loaiTienSu === 'DI_UNG' ? `Dị ứng: ${t.ten}` : `Tiền sử: ${t.ten}`,
          desc: t.ghiChu || 'Ghi nhận hồ sơ bệnh nhân',
          time: tDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          rawDate: tDate,
          status: t.loaiTienSu === 'DI_UNG' ? 'Có bất thường' : 'Ghi nhận',
        });
      });
    }

    // Sắp xếp giảm dần theo thời gian
    list.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
    return list;
  }, [profile]);

  const mainTabs = [
    { key: 'overview', label: 'Tổng quan', icon: 'fa-th-list' },
    { key: 'personal', label: 'Cá nhân', icon: 'fa-user' },
    { key: 'medical-record', label: 'Hồ sơ bệnh án', icon: 'fa-folder-open' },
    { key: 'appointments', label: 'Lịch hẹn', icon: 'fa-calendar-plus' },
    { key: 'billing', label: 'Tài chính', icon: 'fa-coins' },
    { key: 'insurance', label: 'Bảo hiểm', icon: 'fa-shield-alt' },
    { key: 'account', label: 'Tài khoản', icon: 'fa-user-lock' },
  ];

  const medicalSubTabs = [
    { key: 'visits', label: 'Lượt khám', icon: 'fa-notes-medical' },
    { key: 'prescriptions', label: 'Đơn thuốc', icon: 'fa-prescription' },
    { key: 'labs', label: 'Xét nghiệm', icon: 'fa-microscope' },
    { key: 'history', label: 'Tiền sử', icon: 'fa-history' },
  ];

  const handleTabClick = (tab: string) => setActiveTab(tab);
  const handleSubTabClick = (sub: string) => setSubTab(sub);

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      'Hoàn thành': 'hoan-thanh',
      'Đang khám': 'dang-xu-ly',
      'Đang xử lý': 'dang-xu-ly',
      'Chờ khám': 'dang-xu-ly',
      'Chờ thu': 'dang-xu-ly',
      'Đã khám': 'hoan-thanh',
      'Kết luận': 'hoan-thanh',
      'Đã thu': 'hoan-thanh',
      'Đã thanh toán': 'hoan-thanh',
      'Đã xác nhận': 'hoan-thanh',
      'Ghi nhận': 'hoan-thanh',
      'Có bất thường': 'that-bai',
      'Dị ứng': 'that-bai',
      'Đã hủy': 'that-bai',
      'Thất bại': 'that-bai',
      'Hết hạn': 'that-bai',
    };
    return map[status] || 'dang-xu-ly';
  };

  const renderPersonal = () => {
    if (!profile) {
      return <div className="card">Đang tải thông tin cá nhân...</div>;
    }
    return <PersonalTab patient={profile} />;
  };

  const renderVisits = () => <VisitsTab patientId={patientId} />;
  const renderPrescriptions = () => <PrescriptionsTab patientId={patientId} />;
  const renderLabs = () => <LabsTab patientId={patientId} />;
  const renderHistory = () => <HistoryTab patientId={patientId} />;
  const renderBilling = () => <BillingTab patientId={patientId} />;
  const renderInsurance = () => (
    <InsuranceTab insurances={profile?.baoHiems || []} loading={loading} />
  );
  const renderAccount = () => {
    if (!profile) {
      return <div className="card">Đang tải thông tin tài khoản...</div>;
    }
    return <AccountTab profile={profile} />;
  };

  const renderAppointments = () => (
    <>
      <div className="tab-header"><h2>Lịch hẹn</h2></div>
      <div className="card">
        <div className="timeline">
          <div className="event">
            <div className="event-date">--</div>
            <div className="event-title">Chưa có lịch hẹn sắp tới</div>
            <div className="event-text">Bệnh nhân chưa có lịch tái khám nào được ghi nhận trên hệ thống.</div>
          </div>
        </div>
      </div>
    </>
  );

  const renderMedicalRecord = () => {
    switch (subTab) {
      case 'visits': return renderVisits();
      case 'prescriptions': return renderPrescriptions();
      case 'labs': return renderLabs();
      case 'history': return renderHistory();
      default: return null;
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/patients');
    }
  };

  if (loading) {
    return (
      <>
        <style>{patientDetailStyles}</style>
        <div className="patient-detail-page app-wrapper">
          <div className="main-layout" style={{ padding: '40px', justifyContent: 'center', alignItems: 'center' }}>
            <div className="patient-detail-loading">
              <i className="fas fa-spinner fa-spin" style={{ fontSize: 32, marginRight: 16, color: '#2c7da0' }}></i>
              Đang tải dữ liệu hồ sơ bệnh nhân...
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{patientDetailStyles}</style>
        <div className="patient-detail-page app-wrapper">
          <div className="main-layout" style={{ padding: '40px', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', color: '#c0392b' }}>
              <i className="fas fa-exclamation-triangle" style={{ fontSize: 48, marginBottom: 16 }}></i>
              <h3>Lỗi tải dữ liệu</h3>
              <p>{error}</p>
              <button className="back-btn" onClick={() => window.location.reload()}>
                <i className="fas fa-sync"></i> Thử lại
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{patientDetailStyles}</style>
      <div className="patient-detail-page app-wrapper">
        <div className="main-layout">
          {/* Back row */}
          <div className="back-row">
            <div className="back-row-left">
              <button className="back-btn" onClick={handleBack} title="Quay lại danh sách">
                <i className="fas fa-arrow-left"></i>
                <span>Quay lại</span>
              </button>
            </div>
            <div className="back-row-right">
              <button onClick={() => window.print()}><i className="fas fa-print"></i> In</button>
              <button className="btn-primary" onClick={() => alert('Xuất hồ sơ bệnh nhân JSON')}><i className="fas fa-file-export"></i> Xuất dữ liệu</button>
            </div>
          </div>

          {/* Main Tabs – nằm giữa back-row và main-content */}
          <div className="tabs-container main-tabs-container">
            {mainTabs.map(tab => (
              <button
                key={tab.key}
                className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                onClick={() => handleTabClick(tab.key)}
              >
                <i className={`fas ${tab.icon}`}></i> {tab.label}
              </button>
            ))}
          </div>

          {/* Main content */}
          <div className="main-content">
            {/* Left panel - activities */}
            <div className="left-panel">
              <div className="panel-header">
                <h4><i className="fas fa-clock"></i> Hoạt động gần đây</h4>
                <span className="badge-count"><i className="fas fa-list"></i> {activities.length}</span>
              </div>
              <div className="activity-list">
                {activities.length === 0 ? (
                  <div style={{ padding: '36px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    <i className="fas fa-clock-rotate-left" style={{ fontSize: '28px', marginBottom: '10px', display: 'block', color: '#cbd5e1' }}></i>
                    Chưa có hoạt động nào được ghi nhận
                  </div>
                ) : (
                  activities.map((act) => (
                    <div className="activity-row" key={act.id}>
                      <div className="activity-icon"><i className={`fas ${act.icon}`}></i></div>
                      <div className="activity-content">
                        <div className="title">{act.title}</div>
                        <div className="desc">{act.desc}</div>
                      </div>
                      <div className="activity-time">{act.time}</div>
                      <div style={{ gridColumn: 3, textAlign: 'right' }}>
                        <span className={`activity-status ${getStatusClass(act.status)}`}>{act.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right panel */}
            <div className="right-panel">
              {/* Sub-tabs for medical record – chỉ hiển thị khi activeTab === 'medical-record' */}
              {activeTab === 'medical-record' && (
                <div className="sub-tabs-container">
                  {medicalSubTabs.map(sub => (
                    <button
                      key={sub.key}
                      className={`sub-tab-btn ${subTab === sub.key ? 'active' : ''}`}
                      onClick={() => handleSubTabClick(sub.key)}
                    >
                      <i className={`fas ${sub.icon}`}></i> {sub.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Tab content */}
              <div className="tab-content">
                {activeTab === 'overview' && profile && <OverviewTab patient={profile} />}
                {activeTab === 'personal' && renderPersonal()}
                {activeTab === 'medical-record' && renderMedicalRecord()}
                {activeTab === 'appointments' && renderAppointments()}
                {activeTab === 'billing' && renderBilling()}
                {activeTab === 'insurance' && renderInsurance()}
                {activeTab === 'account' && renderAccount()}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="app-footer">
          <span><i className="fas fa-hospital"></i> Phòng khám Đa khoa &bull; Hồ sơ Bệnh nhân Chi tiết</span>
          <span><i className="fas fa-id-card"></i> Mã BN: {profile?.maBenhNhanNoiBo || '---'}</span>
          <span><i className="fas fa-clock"></i> {new Date().toLocaleString('vi-VN')}</span>
        </div>
      </div>
    </>
  );
};

export default PatientDetail;