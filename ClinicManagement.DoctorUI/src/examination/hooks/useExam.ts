import { useState, useEffect } from 'react';
import type { ExamWorkspace, QueuePatient, ExamDetail } from '../types/examination';
import { examinationApi } from '../api/examination.api';
import { useAuth } from '../../Auth/context/AuthProvider';

// 1. Chuẩn hóa kiểu trả về của hàm mapStatus để khớp chính xác với kiểu dữ liệu của QueuePatient.status
const mapStatus = (status: string): 'wait' | 'exam' | 'done' | 'cancel' => {
  switch (status) {
    case 'DANG_KHAM': return 'exam';
    case 'CHO_KHAM': return 'wait';
    case 'HOAN_THANH': return 'done';
    case 'DA_HUY': return 'cancel';
    default: return 'wait';
  }
};

export const useExam = () => {
  const { user } = useAuth();
  const [activeWorkspace, setActiveWorkspace] = useState<ExamWorkspace>('patient');
  const [selectedPatient, setSelectedPatient] = useState<QueuePatient | null>(null);
  const [searchQueue, setSearchQueue] = useState('');
  const [examData, setExamData] = useState<ExamDetail>({
    visit: '',
    department: '',
    room: '',
    status: '',
    patient: {
      name: '',
      code: '',
      dob: '',
      gender: '',
      cccd: '',
      bhyt: '',
      phone: '',
      address: ''
    },
    examination: {
      reason: '',
      history: '',
      vitals: {
        temperature: '',
        pulse: '',
        bloodPressure: '',
        respiration: '',
        spo2: '',
        canNang: '',
        chieuCao: ''
      },
      symptoms: '',
      initialAssessment: ''
    },
    treatment: {
      diagnosis: {
        icd: '',
        name: '',
        diagnosis: '',
        type: '',
        note: '',
        assessment: ''
      },
      diagnosisList: [],
      services: [],
      drugs: [],
      results: []
    }
  });
  const [queue, setQueue] = useState<QueuePatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hàm lấy danh sách hàng đợi từ API
  const fetchQueue = async (maBacSi?: number) => {
    const doctorId = maBacSi || user?.id;
    if (!doctorId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await examinationApi.getHangDoi({ maBacSi: doctorId });
      
      if (response.data?.success && response.data?.data?.items) {
        // 2. Định nghĩa rõ ràng kiểu dữ liệu QueuePatient[] cho mảng sau khi map
        const mapped: QueuePatient[] = response.data.data.items.map((item: any) => ({
          // Đảm bảo ép kiểu id về dạng number theo đúng interface QueuePatient
          id: Number(item.id), 
          stt: item.soThuTu?.toString() || '',
          name: item.hoTen || '',
          code: item.maBenhNhanNoiBo || '',
          avatar: '',
          gender: item.gioiTinh || '',
          age: item.tuoi || 0,
          visit: item.maLuotKhamGanNhat || '',
          department: item.khoa || '',
          // Khóa chặt kiểu chuỗi 'normal' thành Literal Type bằng "as const"
          priority: 'normal' as const, 
          time: item.thoiGianBatDauKham || '',
          status: mapStatus(item.trangThaiLuotKham),
          alert: false,
        }));
        setQueue(mapped);
      } else {
        setError(response.data?.message || 'Không thể tải hàng đợi');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy chi tiết bệnh nhân
  const fetchPatientDetail = async (luotKhamId: number) => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Gọi API lấy chi tiết lượt khám
      console.log(`Fetch detail for lượt khám ${luotKhamId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải chi tiết');
    } finally {
      setLoading(false);
    }
  };

  // Lọc hàng đợi theo từ khóa
  const filteredQueue = queue.filter(p =>
    p.name.toLowerCase().includes(searchQueue.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQueue.toLowerCase())
  );

  const handleSelectPatient = (patient: QueuePatient) => {
    setSelectedPatient(patient);
    if (patient.id) {
      fetchPatientDetail(patient.id);
    }
  };

  const handleSave = () => {
    alert('Đã lưu xử trí cho lượt khám ' + examData.visit);
  };

  const handleFinish = () => {
    if (confirm('Bạn chắc chắn muốn hoàn tất lượt khám này?')) {
      alert('Lượt khám đã được hoàn tất.');
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchQueue(user.id);
    }
  }, [user?.id]);

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
    loading,
    error,
  };
};
