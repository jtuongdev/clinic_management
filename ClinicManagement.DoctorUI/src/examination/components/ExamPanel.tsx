// src/examination/pages/ExamPage.tsx
import React, { useState } from 'react';
import ActionBar, { type ActionItem } from '../../components/common/ActionBar';
import ExamSidebar from '../components/ExamSidebar';
import {
  PatientWorkspace,
  ExaminationWorkspace,
  MedicalRecordWorkspace,
  TreatmentWorkspace,
  ElectronicRecordWorkspace,
} from '../components';
import { useQueue } from '../hooks/useQueueExamination';
import { useExam } from '../hooks/useExam';
import { type BenhNhanListDto } from '../types/queue.examination.type';
import '../../styles/components/ExamPanel.css';

const workflowItems = [
  { key: 'patient', label: 'Bệnh nhân', icon: 'fa-user' },
  { key: 'examination', label: 'Khám bệnh', icon: 'fa-stethoscope' },
  { key: 'medical-record', label: 'Bệnh án', icon: 'fa-folder-open' },
  { key: 'treatment', label: 'Xử trí', icon: 'fa-clipboard-check' },
  { key: 'electronic-record', label: 'Bệnh án điện tử', icon: 'fa-file-circle-check' },
];

const ExamPage: React.FC = () => {
  const { patients, loading, error } = useQueue(1, 50);

  const {
    activeWorkspace,
    setActiveWorkspace,
    searchQueue,
    setSearchQueue,
    examData,
    handleSave,
    handleFinish,
  } = useExam();

  const [selectedPatient, setSelectedPatient] = useState<BenhNhanListDto | null>(null);
  const [showActionBar, setShowActionBar] = useState(false);

  // Xử lý action từ ActionBar
  const handleAction = (id: number | string, actionKey: string) => {
    const patient = patients.find(p => p.id === id);
    if (!patient) return;

    switch (actionKey) {
      case 'start-exam':
        alert(`Bắt đầu khám cho bệnh nhân ${patient.hoTen} (${patient.maBenhNhanNoiBo})`);
        setActiveWorkspace('treatment');
        break;
      case 'view-record':
        alert(`Xem hồ sơ của bệnh nhân ${patient.hoTen} (${patient.maBenhNhanNoiBo})`);
        setActiveWorkspace('medical-record');
        break;
      case 'print':
        alert(`In phiếu cho bệnh nhân ${patient.hoTen} (${patient.maBenhNhanNoiBo})`);
        break;
      case 'export':
        alert(`Xuất bệnh án cho bệnh nhân ${patient.hoTen} (${patient.maBenhNhanNoiBo})`);
        break;
      default:
        break;
    }
    setShowActionBar(false);
  };

  // Định nghĩa các action cho ActionBar
  const actions: ActionItem[] = [
    {
      label: 'Xem hồ sơ',
      icon: 'file-lines',
      onClick: (id) => handleAction(id, 'view-record'),
      color: 'primary',
    },
    {
      label: 'Bắt đầu khám',
      icon: 'play',
      onClick: (id) => handleAction(id, 'start-exam'),
      color: 'success',
    },
    {
      label: 'In phiếu',
      icon: 'print',
      onClick: (id) => handleAction(id, 'print'),
      color: 'warning',
    },
    {
      label: 'Xuất bệnh án',
      icon: 'file-export',
      onClick: (id) => handleAction(id, 'export'),
      color: 'info',
    },
  ];

  const handleSelectPatient = (patient: BenhNhanListDto) => {
    setSelectedPatient(patient);
    setShowActionBar(true);
    // TODO: Gọi API lấy chi tiết bệnh án
  };

  const handleCloseActionBar = () => {
    setShowActionBar(false);
  };

  const renderWorkspace = () => {
    switch (activeWorkspace) {
      case 'patient':
        return <PatientWorkspace data={examData} />;
      case 'examination':
        return <ExaminationWorkspace data={examData} />;
      case 'medical-record':
        return <MedicalRecordWorkspace data={examData} />;
      case 'treatment':
        return <TreatmentWorkspace data={examData} onSave={handleSave} onFinish={handleFinish} />;
      case 'electronic-record':
        return <ElectronicRecordWorkspace data={examData} onFinish={handleFinish} />;
      default:
        return <TreatmentWorkspace data={examData} onSave={handleSave} onFinish={handleFinish} />;
    }
  };

  return (
    <div className="panel-exam active">
      {error && (
        <div className="api-error-banner" style={{ background: '#fef2f2', color: '#dc2626', padding: '8px 16px', fontSize: '14px', borderBottom: '1px solid #fee2e2' }}>
          <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }}></i> Lỗi hệ thống: {error}
        </div>
      )}

      <div className="exam-layout">
        <ExamSidebar
          patients={patients}
          loading={loading}
          selectedPatient={selectedPatient}
          searchQueue={searchQueue}
          onSearchChange={setSearchQueue}
          onSelectPatient={handleSelectPatient}
        />

        <div className="exam-main">
          <div className="workspace-bar">
            <div className="workspace-title">
              <i className="fa-solid fa-file-medical"></i> Hồ sơ điều trị
            </div>
            <div className="workflow">
              {workflowItems.map((item) => (
                <button
                  key={item.key}
                  className={activeWorkspace === item.key ? 'active' : ''}
                  onClick={() => setActiveWorkspace(item.key as any)}
                >
                  <i className={`fa-solid ${item.icon}`}></i>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="exam-content">{renderWorkspace()}</div>
        </div>
      </div>

      {/* ===== ActionBar ===== */}
      <ActionBar
        isVisible={showActionBar && !!selectedPatient}
        onClose={handleCloseActionBar}
        selectedId={selectedPatient?.id ?? null}
        actions={actions}
        title="Bệnh nhân"
        entityName={selectedPatient?.hoTen || 'không xác định'}
      />
    </div>
  );
};

export default ExamPage;