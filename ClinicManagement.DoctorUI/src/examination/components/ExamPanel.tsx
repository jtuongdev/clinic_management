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
  const { patients, loading, error, fetchQueue } = useQueue(1, 50);

  const {
    activeWorkspace,
    setActiveWorkspace,
    searchQueue,
    setSearchQueue,
    examData,
    handleSave,
  } = useExam();

  const handleExamFinished = () => {
    void fetchQueue();
    setSelectedPatient((prev) => (prev ? { ...prev, trangThaiLuotKham: 'HOAN_THANH' } : null));
    setIsExamStarted(false);
  };

  const [selectedPatient, setSelectedPatient] = useState<BenhNhanListDto | null>(null);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isStartingExam, setIsStartingExam] = useState(false);
  const [isSendingCls, setIsSendingCls] = useState(false);
  const [isResumingExam, setIsResumingExam] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const patientStatus = String(selectedPatient?.trangThaiLuotKham ?? '').trim();
  const isAlreadyExamining = ['DANG_KHAM', 'DangKham', 'exam', 'Dang_Kham'].includes(patientStatus);
  const isWaitingCls = ['CHO_CLS', 'ChoCls', 'Cho_Cls', 'CHO_CAN_LAM_SANG'].includes(patientStatus);
  const isCompleted = ['HOAN_THANH', 'HoanThanh', 'done', 'HUY_KHAM', 'HuyKham', 'cancel'].includes(patientStatus);
  const isExamActive = isExamStarted || isAlreadyExamining;

  const handleSelectPatient = (patient: BenhNhanListDto) => {
    setSelectedPatient(patient);
    const status = String(patient.trangThaiLuotKham ?? '').trim();
    const isExamining = ['DANG_KHAM', 'DangKham', 'exam', 'Dang_Kham'].includes(status);
    const isWaiting = ['CHO_CLS', 'ChoCls', 'Cho_Cls', 'CHO_CAN_LAM_SANG'].includes(status);
    
    setIsExamStarted(isExamining);
    if (isExamining || isWaiting) {
      setActiveWorkspace('examination');
    } else {
      setActiveWorkspace('patient');
    }
  };

  const handleStartExam = async () => {
    if (!selectedPatient || !selectedPatient.id || isExamActive) {
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
      setSelectedPatient((prev) => (prev ? { ...prev, trangThaiLuotKham: 'DANG_KHAM' } : null));
      setActiveWorkspace('examination');
    } catch (error) {
      console.error('Start exam failed:', error);
      const message = error instanceof Error ? error.message : 'Không thể bắt đầu khám. Vui lòng thử lại.';
      alert(message.includes('đang được khám') || message.includes('đang được khám lại') ? 'Bệnh nhân đang được khám. Không thể bắt đầu khám lại.' : message);
    } finally {
      setIsStartingExam(false);
    }
  };

  const handleSendToParaclinical = async () => {
    if (!selectedPatient || !selectedPatient.id) return;

    try {
      setIsSendingCls(true);
      const response = await examinationApi.sendToParaclinical(selectedPatient.id);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Không thể chuyển trạng thái chờ cận lâm sàng.');
      }
      setIsExamStarted(false);
      setSelectedPatient((prev) => (prev ? { ...prev, trangThaiLuotKham: 'CHO_CLS' } : null));
      alert('Đã chuyển bệnh nhân sang trạng thái chờ kết quả cận lâm sàng (CHO_CLS). Bác sĩ có thể tiếp tục nhận bệnh nhân khác.');
    } catch (error) {
      console.error('Send to paraclinical failed:', error);
      const message = error instanceof Error ? error.message : 'Không thể chuyển trạng thái chờ CLS.';
      alert(message);
    } finally {
      setIsSendingCls(false);
    }
  };

  const handleResumeExam = async () => {
    if (!selectedPatient || !selectedPatient.id) return;

    try {
      setIsResumingExam(true);
      const response = await examinationApi.resumeExam(selectedPatient.id);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Không thể khôi phục trạng thái khám.');
      }
      setIsExamStarted(true);
      setSelectedPatient((prev) => (prev ? { ...prev, trangThaiLuotKham: 'DANG_KHAM' } : null));
      setActiveWorkspace('treatment');
      alert('Đã khôi phục trạng thái ĐANG KHÁM cho bệnh nhân.');
    } catch (error) {
      console.error('Resume exam failed:', error);
      const message = error instanceof Error ? error.message : 'Không thể khôi phục khám.';
      alert(message);
    } finally {
      setIsResumingExam(false);
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
        if (selectedPatient) {
          void handleStartExam();
        }
        break;
      case 'send-cls':
        if (selectedPatient) {
          void handleSendToParaclinical();
        }
        break;
      case 'resume-exam':
        if (selectedPatient) {
          void handleResumeExam();
        }
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
      disabled: !selectedPatient || isStartingExam || isExamActive || isWaitingCls || isCompleted,
      onClick: (context: ActionToolbarClickContext<string>) => {
        const actionKey = context.payload ?? context.action.payload ?? 'start-exam';
        handleExamAction(actionKey);
      },
    },
    {
      key: 'send-cls',
      label: isSendingCls ? 'Đang chuyển...' : 'Chờ CLS',
      icon: isSendingCls ? 'spinner' : 'flask',
      color: 'warning',
      payload: 'send-cls',
      disabled: !selectedPatient || !isExamActive || isSendingCls || isCompleted,
      onClick: (context: ActionToolbarClickContext<string>) => {
        const actionKey = context.payload ?? context.action.payload ?? 'send-cls';
        handleExamAction(actionKey);
      },
    },
    {
      key: 'resume-exam',
      label: isResumingExam ? 'Đang mở lại...' : 'Tiếp tục khám',
      icon: isResumingExam ? 'spinner' : 'stethoscope',
      color: 'primary',
      payload: 'resume-exam',
      disabled: !selectedPatient || !isWaitingCls || isResumingExam,
      onClick: (context: ActionToolbarClickContext<string>) => {
        const actionKey = context.payload ?? context.action.payload ?? 'resume-exam';
        handleExamAction(actionKey);
      },
    },
    {
      key: 'cancel-exam',
      label: 'Đóng',
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
      (!isExamActive && !isWaitingCls && (item.key === 'examination' || item.key === 'treatment' || item.key === 'electronic-record'));
    return {
      ...item,
      disabled: isLockedTab,
    };
  });

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

          <div className="exam-content">
            <div
              style={{
                display: activeWorkspace === 'patient' ? 'flex' : 'none',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                height: '100%',
                overflow: 'hidden',
              }}
            >
              {selectedPatient ? <PatientWorkspace data={examData} luotKhamId={selectedPatient.id} /> : <PatientWorkspace />}
            </div>
            <div
              style={{
                display: activeWorkspace === 'examination' ? 'flex' : 'none',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                height: '100%',
                overflow: 'hidden',
              }}
            >
              <ExaminationWorkspace data={examData} luotKhamId={selectedPatient?.id} />
            </div>
            <div
              style={{
                display: activeWorkspace === 'treatment' ? 'flex' : 'none',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                height: '100%',
                overflow: 'hidden',
              }}
            >
              <TreatmentWorkspace data={examData} luotKhamId={selectedPatient?.id} onSave={handleSave} onFinish={handleExamFinished} />
            </div>
            <div
              style={{
                display: activeWorkspace === 'electronic-record' ? 'flex' : 'none',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                height: '100%',
                overflow: 'hidden',
              }}
            >
              <ElectronicRecordWorkspace data={examData} luotKhamId={selectedPatient?.id} onFinish={handleExamFinished} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;