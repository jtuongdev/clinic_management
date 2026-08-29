import { useState } from 'react';
import type { ExamWorkspace, QueuePatient, ExamDetail } from '../types';

// Mock data
export const mockQueue: QueuePatient[] = [
  { id: 1, stt: '01', name: 'Nguyễn Thị An', code: 'BN-10234', avatar: 'NA', gender: 'Nữ', age: 39, visit: '1001', department: 'Nội tổng quát', priority: 'urgent', time: '08:12', status: 'exam', alert: true },
  { id: 2, stt: '02', name: 'Trần Văn Bình', code: 'BN-10789', avatar: 'TB', gender: 'Nam', age: 46, visit: '1002', department: 'Nội tổng quát', priority: 'normal', time: '08:20', status: 'wait', alert: false },
  { id: 3, stt: '03', name: 'Lê Thị Hoa', code: 'BN-11234', avatar: 'LH', gender: 'Nữ', age: 32, visit: '1003', department: 'Nội tổng quát', priority: 'urgent', time: '08:25', status: 'wait', alert: true },
  { id: 4, stt: '04', name: 'Phạm Văn Hùng', code: 'BN-09876', avatar: 'PH', gender: 'Nam', age: 59, visit: '1004', department: 'Nội tổng quát', priority: 'normal', time: '08:31', status: 'wait', alert: false },
  { id: 5, stt: '05', name: 'Đỗ Minh Tâm', code: 'BN-12121', avatar: 'DT', gender: 'Nữ', age: 22, visit: '1005', department: 'Nội tổng quát', priority: 'normal', time: '08:36', status: 'wait', alert: false },
];

export const mockExamDetail: ExamDetail = {
  visit: '1023',
  department: 'Nội tổng quát',
  room: 'Phòng 03',
  status: 'Đang xử trí',
  patient: {
    name: 'Nguyễn Thị An',
    code: 'BN-10234',
    dob: '15/08/1985',
    gender: 'Nữ',
    cccd: '079185001234',
    bhyt: 'HS-1234567890',
    phone: '0909 123 456',
    address: 'Ninh Kiều, Cần Thơ'
  },
  examination: {
    reason: 'Ho khan, khó thở nhẹ, sốt 2 ngày.',
    history: 'Bệnh nhân có tiền sử viêm phổi năm 2024.',
    vitals: {
      temperature: '38.5',
      pulse: '95',
      bloodPressure: '130/85',
      respiration: '20',
      spo2: '96',
      canNang: '58',
      chieuCao: '165'
    },
    symptoms: 'Ho khan, sốt, khó thở nhẹ.',
    initialAssessment: 'Nhiễm trùng đường hô hấp cấp, nghi ngờ viêm phổi cộng đồng.'
  },
  treatment: {
    diagnosis: {
      icd: 'J06.9',
      name: 'Nhiễm trùng đường hô hấp cấp không đặc hiệu',
      diagnosis: 'Viêm phổi cộng đồng',
      type: 'Chính',
      note: 'Khó thở, ho khan, sốt 38.5°C.',
      assessment: 'Hình ảnh và triệu chứng phù hợp nhiễm trùng đường hô hấp.'
    },
    diagnosisList: [
      { icd: 'J06.9', name: 'Nhiễm trùng đường hô hấp cấp', type: 'CHÍNH', note: 'Khó thở, ho khan' },
      { icd: 'R06.0', name: 'Khó thở', type: 'PHỤ', note: 'Triệu chứng kèm theo' },
    ],
    services: [
      { name: 'Chụp X-quang phổi', qty: 1, status: 'ĐÃ CHỈ ĐỊNH', time: '08:24' },
      { name: 'Xét nghiệm máu tổng quát', qty: 1, status: 'ĐÃ TIẾP NHẬN', time: '08:10' },
    ],
    drugs: [
      { name: 'Ceftriaxon', qty: 1, unit: 'Ống', dose: '1g', freq: 'Mỗi 12h', days: 5, route: 'TM' },
      { name: 'Azithromycin', qty: 1, unit: 'Viên', dose: '500mg', freq: 'Mỗi 24h', days: 3, route: 'Uống' },
    ],
    results: [
      { indicator: 'WBC', result: '12.5', unit: '10³/µL', ref: '4.0 - 10.0', evaluation: 'Cao' },
      { indicator: 'CRP', result: '45', unit: 'mg/L', ref: '< 5', evaluation: 'Cao' },
      { indicator: 'Hemoglobin', result: '13.2', unit: 'g/dL', ref: '12.0 - 16.0', evaluation: 'Bình thường' },
    ]
  }
};

export const useExam = () => {
  const [activeWorkspace, setActiveWorkspace] = useState<ExamWorkspace>('patient');
  const [selectedPatient, setSelectedPatient] = useState<QueuePatient | null>(mockQueue[0]);
  const [searchQueue, setSearchQueue] = useState('');
  const [examData, setExamData] = useState<ExamDetail>(mockExamDetail);

  // TODO: Gọi API lấy danh sách hàng đợi
  // TODO: Gọi API lấy chi tiết bệnh nhân khi chọn

  const filteredQueue = mockQueue.filter(p =>
    p.name.toLowerCase().includes(searchQueue.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQueue.toLowerCase())
  );

  const handleSave = () => {
    // TODO: Gọi API lưu xử trí
    alert('Đã lưu xử trí cho lượt khám ' + examData.visit);
  };

  const handleFinish = () => {
    if (confirm('Bạn chắc chắn muốn hoàn tất lượt khám này?')) {
      // TODO: Gọi API hoàn tất lượt khám
      alert('Lượt khám đã được hoàn tất.');
    }
  };

  const handleSelectPatient = (patient: QueuePatient) => {
    setSelectedPatient(patient);
    // TODO: Gọi API lấy chi tiết bệnh nhân
  };

  return {
    activeWorkspace,
    setActiveWorkspace,
    selectedPatient,
    setSelectedPatient: handleSelectPatient,
    searchQueue,
    setSearchQueue,
    examData,
    setExamData,
    filteredQueue,
    handleSave,
    handleFinish,
  };
};