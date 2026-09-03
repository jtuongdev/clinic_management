// src/examination/pages/ExamPage.tsx
import React, { useState } from 'react';
import ActionToolbar, { type ActionToolbarItem } from './ActionToolbar';
import ExamSidebar from './ExamSidebar';
import {
  PatientWorkspace,
  ExaminationWorkspace,
  TreatmentWorkspace,
  ElectronicRecordWorkspace,
} from './index';
import { useQueue } from '../hooks/useQueueExamination';
import { useExam } from '../hooks/useExam';
import { examinationApi } from '../api/examination.api';
import type { BenhNhanListDto } from '../types/examination/queue.types';
import '../../styles/components/ExamPanel.css';
import type { ActionToolbarClickContext } from '../types/examination/action-toolbar.types';

const workflowItems = [
  { key: 'patient', label: 'Bệnh nhân', icon: 'fa-user' },
  { key: 'examination', label: 'Khám bệnh', icon: 'fa-stethoscope' },
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
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isStartingExam, setIsStartingExam] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const isSelectedPatientAlreadyExamining =
    !!selectedPatient &&
    ['DANG_KHAM', 'DangKham', 'exam'].includes(String(selectedPatient.trangThaiLuotKham ?? '').trim());

  const handleSelectPatient = (patient: BenhNhanListDto) => {
    setSelectedPatient(patient);
    setIsExamStarted(false);
    setActiveWorkspace('patient');
    // TODO: Gọi API lấy chi tiết bệnh án
  };

  const handleStartExam = async () => {
    if (!selectedPatient || !selectedPatient.id || isSelectedPatientAlreadyExamining) {
      alert('Bệnh nhân đang được khám. Không thể bắt đầu khám lại.');
      return;
    }

    try {
      setIsStartingExam(true);
      const response = await examinationApi.startExam(selectedPatient.id);
      const payload = response.data?.data;

      if (!response.data?.success || !payload) {
        throw new Error(response.data?.message || 'Không thể bắt đầu khám');
      }

      setIsExamStarted(true);
      setActiveWorkspace('examination');
    } catch (error) {
      console.error('Start exam failed:', error);
      const message = error instanceof Error ? error.message : 'Không thể bắt đầu khám. Vui lòng thử lại.';
      alert(message.includes('đang được khám') || message.includes('đang được khám lại') ? 'Bệnh nhân đang được khám. Không thể bắt đầu khám lại.' : message);
    } finally {
      setIsStartingExam(false);
    }
  };

  const handleExamAction = (actionKey: string) => {
    switch (actionKey) {
      case 'refresh':
        setSearchQueue('');
        setSelectedPatient(null);
        setIsExamStarted(false);
        setActiveWorkspace('patient');
        break;
      case 'start-exam':
        if (!selectedPatient) {
          setActiveWorkspace('patient');
          break;
        }
        void handleStartExam();
        break;
      case 'pause-exam':
        if (!isExamStarted) {
          break;
        }
        setIsExamStarted(false);
        setActiveWorkspace('patient');
        alert('Đã tạm ngưng quá trình khám bệnh.');
        break;
      case 'cancel-exam':
        setSelectedPatient(null);
        setIsExamStarted(false);
        setActiveWorkspace('patient');
        break;
      default:
        break;
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  // Định nghĩa kiểu cho context của action
  const examActions: ActionToolbarItem<string>[] = [
    {
      key: 'refresh',
      label: 'Làm mới',
      icon: 'rotate',
      color: 'secondary',
      variant: 'outline',
      payload: 'refresh',
      onClick: (context: ActionToolbarClickContext<string>) => {
        const actionKey = context.payload ?? context.action.payload ?? 'refresh';
        handleExamAction(actionKey);
      },
    },
    {
      key: 'start-exam',
      label: isStartingExam ? 'Đang bắt đầu...' : 'Bắt đầu khám',
      icon: isStartingExam ? 'spinner' : 'play',
      color: 'success',
      payload: 'start-exam',
      disabled: !selectedPatient || isStartingExam || isSelectedPatientAlreadyExamining,
      onClick: (context: ActionToolbarClickContext<string>) => {
        const actionKey = context.payload ?? context.action.payload ?? 'start-exam';
        handleExamAction(actionKey);
      },
    },
    {
      key: 'pause-exam',
      label: 'Tạm ngưng',
      icon: 'pause',
      color: 'warning',
      payload: 'pause-exam',
      disabled: !selectedPatient || (!isExamStarted && !isSelectedPatientAlreadyExamining),
      onClick: (context: ActionToolbarClickContext<string>) => {
        const actionKey = context.payload ?? context.action.payload ?? 'pause-exam';
        handleExamAction(actionKey);
      },
    },
    {
      key: 'cancel-exam',
      label: 'Huỷ',
      icon: 'xmark',
      color: 'danger',
      payload: 'cancel-exam',
      disabled: !selectedPatient,
      onClick: (context: ActionToolbarClickContext<string>) => {
        const actionKey = context.payload ?? context.action.payload ?? 'cancel-exam';
        handleExamAction(actionKey);
      },
    },
  ];

  const workflowActions = workflowItems.map((item) => {
    const isLockedTab =
      !selectedPatient ||
      (!isExamStarted && !isSelectedPatientAlreadyExamining && (item.key === 'examination' || item.key === 'treatment'));
    return {
      ...item,
      disabled: isLockedTab,
    };
  });

  const renderWorkspace = () => {
    switch (activeWorkspace) {
      case 'patient':
        return selectedPatient ? <PatientWorkspace data={examData} luotKhamId={selectedPatient.id} /> : <PatientWorkspace />;
      case 'examination':
        return <ExaminationWorkspace data={examData} luotKhamId={selectedPatient?.id} />;
      case 'treatment':
        return <TreatmentWorkspace data={examData} luotKhamId={selectedPatient?.id} onSave={handleSave} onFinish={handleFinish} />;
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

      <div className={`exam-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <ExamSidebar
          patients={patients}
          loading={loading}
          selectedPatient={selectedPatient}
          searchQueue={searchQueue}
          onSearchChange={setSearchQueue}
          onSelectPatient={handleSelectPatient}
          collapsed={isSidebarCollapsed}
        />

        <div className="exam-main">
          <div className="workspace-bar">
            <div className="workspace-title">
              <button
                className="sidebar-toggle"
                onClick={toggleSidebar}
                title={isSidebarCollapsed ? 'Mở sidebar' : 'Thu gọn sidebar'}
              >
                <i className={`fa-solid ${isSidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
              </button>
              <i className="fa-solid fa-file-medical"></i>
              <span>Hồ sơ điều trị</span>
            </div>
            <div className="workflow">
              {workflowActions.map((item) => (
                <button
                  key={item.key}
                  className={activeWorkspace === item.key ? 'active' : ''}
                  onClick={() => !item.disabled && setActiveWorkspace(item.key as any)}
                  disabled={item.disabled}
                >
                  <i className={`fa-solid ${item.icon}`}></i>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {selectedPatient && <ActionToolbar actions={examActions} align="right" />}
          </div>

          <div className="exam-content">{renderWorkspace()}</div>
        </div>
      </div>

    </div>
  );
};

export default ExamPage;