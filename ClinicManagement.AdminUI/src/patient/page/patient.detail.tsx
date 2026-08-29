import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './PatientDetail.css';
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

// Mock activities (tạm thời)
const MOCK_ACTIVITIES = [
  { id: 1, icon: 'fa-notes-medical', title: 'Khám bệnh', desc: 'Nội tổng quát - BS. Trần Minh Quân', time: '22/08 08:30', status: 'Hoàn thành' },
  { id: 2, icon: 'fa-prescription', title: 'Đơn thuốc', desc: '3 thuốc - Đã xuất đủ', time: '22/08 09:15', status: 'Hoàn thành' },
  { id: 3, icon: 'fa-microscope', title: 'Xét nghiệm', desc: 'Sinh hóa máu - 4 chỉ số', time: '22/08 10:00', status: 'Có bất thường' },
  { id: 4, icon: 'fa-coins', title: 'Thanh toán hóa đơn', desc: '400.000 ₫ - Phiếu thu PT20260822031', time: '22/08 10:20', status: 'Đã thu' },
  { id: 5, icon: 'fa-calendar-plus', title: 'Lịch hẹn tái khám', desc: '30/08 09:00 - BS. Trần Minh Quân', time: '20/08 14:30', status: 'Đã xác nhận' },
];

export const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const patientId = id ? parseInt(id, 10) : 0;

  const [activeTab, setActiveTab] = useState('overview');
  const [subTab, setSubTab] = useState('visits');
  const [patient] = useState<any>({ activities: MOCK_ACTIVITIES });

  const { profile, loading, error } = usePatientProfile(patientId);

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
      'Đang xử lý': 'dang-xu-ly',
      'That bại': 'that-bai',
      'Đã xác nhận': 'hoan-thanh',
      'Có bất thường': 'dang-xu-ly',
      'Bình thường': 'hoan-thanh',
      'Hết hạn': 'that-bai',
      'Còn hiệu lực': 'hoan-thanh',
      'Đã thanh toán': 'hoan-thanh',
      'Đang quản lý': 'hoan-thanh',
      'Đã đăng ký': 'hoan-thanh',
    };
    return map[status] || 'dang-xu-ly';
  };

  const getTagClass = (type: string) => {
    const map: Record<string, string> = {
      'success': 'tag-success',
      'danger': 'tag-danger',
      'primary': 'tag-primary',
      'warning': 'tag-warning',
    };
    return map[type] || 'tag-primary';
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
      <div className="tab-header"><h2>Lịch hẹn</h2><button className="edit-btn" onClick={() => alert('Sửa lịch hẹn')}><i className="fas fa-pen"></i> Sửa</button></div>
      <div className="card">
        <div className="timeline">
          <div className="event">
            <div className="event-date">--</div>
            <div className="event-title">Chưa có dữ liệu</div>
            <div className="event-text">Lịch hẹn sẽ được hiển thị sau khi tích hợp API</div>
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

  if (loading) {
    return (
      <div className="app-wrapper">
        <div className="main-layout" style={{ padding: '40px', justifyContent: 'center', alignItems: 'center' }}>
          <div className="patient-detail-loading">
            <i className="fas fa-spinner fa-spin" style={{ fontSize: 32, marginRight: 16, color: '#2c7da0' }}></i>
            Đang tải dữ liệu...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-wrapper">
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
    );
  }

  return (
    <div className="app-wrapper">
      <div className="main-layout">
        {/* Back row */}
        <div className="back-row">
          <div className="back-row-left">
            <button className="back-btn back-btn-icon" onClick={() => window.history.back()}>
              <i className="fas fa-arrow-left"> Quay về </i>
            </button>
          </div>
          <div className="back-row-right">
            <button onClick={() => window.print()}><i className="fas fa-print"></i> In</button>
            <button className="btn-primary" onClick={() => alert('Xuất JSON')}><i className="fas fa-file-export"></i> Xuất dữ liệu</button>
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
              <span><i className="fas fa-list"></i> {patient.activities.length}</span>
            </div>
            <div className="activity-list">
              {patient.activities.map((act: any) => (
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
              ))}
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
        <span><i className="fas fa-hospital"></i> Khoa Nội - Hồi sức tích cực | Phòng khám 1,2,3</span>
        <span><i className="fas fa-user-md"></i> Bác sĩ: Nguyễn Văn Tuấn</span>
        <span><i className="fas fa-clock"></i> {new Date().toLocaleString('vi-VN')}</span>
      </div>
    </div>
  );
};

export default PatientDetail;