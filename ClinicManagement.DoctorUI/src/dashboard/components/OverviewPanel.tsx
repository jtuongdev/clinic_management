import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../Auth/context/AuthProvider';
import { doctorScheduleApi, type TodayStatusDto } from '../../schedule/api/doctorSchedule.api';
import { examinationApi } from '../../examination/api/examination.api';
import type { BenhNhanListDto } from '../../examination/types/examination/queue.types';
import type { ExaminationDetailResponse } from '../../examination/types/examination/exam.types';

const formatTime = (dateStr?: string | null): string | null => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return null;
  }
};

/** Lấy chữ viết tắt từ tên bác sĩ (bỏ tiền tố học hàm/học vị) */
const getInitials = (name: string): string => {
  if (!name) return 'BS';
  const cleanName = name
    .replace(/^(BS\.?|BSCKI\.?|BSCKII\.?|ThS\.?|TS\.?|PGS\.?|GS\.?|CKI\.?|CKII\.?)\s*/gi, '')
    .trim();
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'BS';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const OverviewPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [todayStatus, setTodayStatus] = useState<TodayStatusDto | null>(null);
  const [queuePatients, setQueuePatients] = useState<BenhNhanListDto[]>([]);
  const [currentExamPatient, setCurrentExamPatient] = useState<BenhNhanListDto | null>(null);
  const [examDetail, setExamDetail] = useState<ExaminationDetailResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'WAITING' | 'CLS'>('WAITING');
  const [actionLoading, setActionLoading] = useState(false);
  const [loadingQueue, setLoadingQueue] = useState(false);

  // Tải trạng thái ca trực từ backend
  const loadStatus = useCallback(async () => {
    try {
      const res = await doctorScheduleApi.getTodayStatus();
      if (res?.data) {
        setTodayStatus(res.data);
      }
    } catch (err) {
      console.error('Không thể tải trạng thái ca trực:', err);
    }
  }, []);

  // Tải hàng đợi bệnh nhân thật từ API
  const userId = user?.id;
  const loadQueue = useCallback(async () => {
    setLoadingQueue(true);
    try {
      const res = await examinationApi.getHangDoi({
        maBacSi: userId || 0,
        pageSize: 50,
      });
      const items = res.data?.data?.items || [];
      setQueuePatients(items);

      const inExam = items.find(
        (p) =>
          p.trangThaiLuotKham === 'DANG_KHAM' ||
          p.trangThaiLuotKham === 'DangKham' ||
          p.trangThaiLuotKham === 'exam'
      );
      if (inExam) {
        setCurrentExamPatient(inExam);
      } else {
        setCurrentExamPatient(null);
      }
    } catch (err) {
      console.error('Không thể tải hàng đợi bệnh nhân:', err);
      setQueuePatients([]);
      setCurrentExamPatient(null);
    } finally {
      setLoadingQueue(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadStatus();
    void loadQueue();
  }, [loadStatus, loadQueue]);

  // Tải chi tiết bệnh án & sinh hiệu thật khi có bệnh nhân đang khám
  const currentExamPatientId = currentExamPatient?.id;
  useEffect(() => {
    if (!currentExamPatientId) {
      setExamDetail(null);
      return;
    }

    let isMounted = true;
    examinationApi
      .getExaminationDetail(currentExamPatientId)
      .then((res) => {
        if (isMounted && res.data?.data) {
          setExamDetail(res.data.data);
        }
      })
      .catch((err) => {
        console.error('Không thể tải chi tiết ca khám:', err);
        if (isMounted) setExamDetail(null);
      });

    return () => {
      isMounted = false;
    };
  }, [currentExamPatientId]);

  // Phân loại danh sách từ API CSDL
  const waitingPatients = queuePatients.filter(
    (p) =>
      p.trangThaiLuotKham === 'CHO_KHAM' ||
      p.trangThaiLuotKham === 'ChoKham' ||
      p.trangThaiLuotKham === 'wait'
  );

  const clsPatients = queuePatients.filter(
    (p) =>
      p.trangThaiLuotKham === 'CHO_KET_QUA_CLS' ||
      p.trangThaiLuotKham === 'CHO_CLS' ||
      p.trangThaiLuotKham === 'ChoCls' ||
      p.trangThaiLuotKham === 'CHO_CAN_LAM_SANG'
  );

  const completedPatients = queuePatients.filter(
    (p) =>
      p.trangThaiLuotKham === 'HOAN_THANH' ||
      p.trangThaiLuotKham === 'HoanThanh' ||
      p.trangThaiLuotKham === 'done'
  );

  const waitingCount = waitingPatients.length;
  const clsCount = clsPatients.length;
  const doneCount = completedPatients.length;

  const activeQueueList = activeTab === 'WAITING' ? waitingPatients : clsPatients;
  const nextWaitingPatient = waitingPatients[0] || null;

  // Thao tác: Gọi một bệnh nhân cụ thể vào phòng khám
  const handleCallPatient = useCallback(
    async (patient: BenhNhanListDto) => {
      try {
        setActionLoading(true);
        await examinationApi.startExam(patient.id);
        toast.success(`Đã gọi bệnh nhân ${patient.hoTen} vào phòng khám!`);
        await loadQueue();
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Thao tác gọi bệnh nhân thất bại.';
        toast.error(msg);
      } finally {
        setActionLoading(false);
      }
    },
    [loadQueue]
  );

  // Thao tác: Gọi bệnh nhân kế tiếp (F2)
  const handleCallNextPatient = useCallback(async () => {
    if (!nextWaitingPatient) {
      toast('Hàng đợi hiện không có bệnh nhân nào đang chờ.');
      return;
    }
    await handleCallPatient(nextWaitingPatient);
  }, [nextWaitingPatient, handleCallPatient]);

  // Lắng nghe phím tắt [F2]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        handleCallNextPatient();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCallNextPatient]);

  // Hành động: Ghi Bệnh Án & Kê Đơn
  const handleOpenExamRecord = () => {
    if (!currentExamPatient) return;
    navigate('/exam', { state: { patient: currentExamPatient } });
  };

  // Hành động: Chỉ Định Cận Lâm Sàng
  const handleOrderParaclinical = async () => {
    if (!currentExamPatient) return;
    try {
      setActionLoading(true);
      await examinationApi.sendToParaclinical(currentExamPatient.id);
      toast.success(`Đã chuyển bệnh nhân ${currentExamPatient.hoTen} sang chờ cận lâm sàng.`);
      await loadQueue();
    } catch {
      navigate('/exam', { state: { patient: currentExamPatient, openCls: true } });
    } finally {
      setActionLoading(false);
    }
  };

  // Hành động: Tạm Hoãn Ca
  const handlePauseExam = () => {
    if (!currentExamPatient) return;
    toast(`Đã tạm hoãn ca khám của bệnh nhân ${currentExamPatient.hoTen}.`);
    setCurrentExamPatient(null);
  };

  // Hành động: Kết Thúc Khám
  const handleFinishExam = async () => {
    if (!currentExamPatient) return;
    try {
      setActionLoading(true);
      await examinationApi.completeExam(currentExamPatient.id);
      toast.success(`Đã hoàn tất ca khám cho bệnh nhân ${currentExamPatient.hoTen}!`);
      await loadQueue();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể hoàn tất ca khám.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Thông tin bác sĩ & ca trực từ API
  const doctorName = user?.fullName || 'Bác sĩ điều trị';
  const departmentName = user?.chuyenKhoa || todayStatus?.schedule?.tenKhoa || 'Khoa Khám Bệnh';
  const roomName = todayStatus?.schedule?.tenPhongKham || 'Phòng khám';
  const shiftText = todayStatus?.schedule
    ? `${todayStatus.schedule.tenCa || 'Ca trực'}: ${
        todayStatus.schedule.thoiGianBatDau?.substring(0, 5) || '--:--'
      } - ${todayStatus.schedule.thoiGianKetThuc?.substring(0, 5) || '--:--'}`
    : 'Chưa có lịch ca trực';

  // Thông tin bệnh nhân đang khám (từ API)
  const patientName = currentExamPatient?.hoTen || '';
  const patientGender =
    currentExamPatient?.gioiTinh === 'M' || currentExamPatient?.gioiTinh === 'Nam' ? 'Nam' : 'Nữ';
  const patientAge = currentExamPatient?.tuoi;
  const patientCode =
    currentExamPatient?.maBenhNhanNoiBo ||
    currentExamPatient?.maLuotKhamGanNhat ||
    (currentExamPatient ? `BN-${currentExamPatient.id}` : '');

  // Sinh hiệu từ API CSDL
  const bp =
    examDetail?.sinhHieu?.huyetApTamThu && examDetail?.sinhHieu?.huyetApTamTruong
      ? `${examDetail.sinhHieu.huyetApTamThu}/${examDetail.sinhHieu.huyetApTamTruong} mmHg`
      : '--/-- mmHg';
  const pulse = examDetail?.sinhHieu?.mach ? `${examDetail.sinhHieu.mach} l/p` : '-- l/p';
  const temp = examDetail?.sinhHieu?.nhietDo ? `${examDetail.sinhHieu.nhietDo} °C` : '-- °C';
  const spo2 = examDetail?.sinhHieu?.spO2 ? `${examDetail.sinhHieu.spO2} %` : '-- %';

  const allergyItems = examDetail?.tienSuBenhs
    ?.filter((t) => t.loaiTienSu === 1 || t.ten?.toLowerCase().includes('dị ứng'))
    .map((t) => t.ten);
  const allergyText =
    allergyItems && allergyItems.length > 0
      ? allergyItems.join(', ')
      : examDetail?.ghiChuTienSu || 'Không ghi nhận dị ứng';

  const reasonText = examDetail?.lyDoKham || 'Chưa cập nhật lý do khám';

  return (
    <div className="h-[calc(100vh-115px)] overflow-hidden flex flex-col bg-slate-100 font-sans text-slate-800">
      {/* ========================================================================= */}
      {/* 1. THANH CA TRỰC TRÊN CÙNG (Shift Header)                                  */}
      {/* ========================================================================= */}
      <header className="h-16 bg-white border-b border-slate-200 px-5 flex items-center justify-between shrink-0">
        {/* Cụm thông tin Bác sĩ (Bên trái) — Avatar + Tên + Khoa/Phòng + Ca */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar bác sĩ */}
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shrink-0 shadow-sm ring-2 ring-blue-100">
            <span className="text-sm font-bold tracking-wide">
              {getInitials(doctorName)}
            </span>
          </div>

          {/* Tên + Khoa/Phòng */}
          <div className="flex flex-col min-w-0 leading-tight">
            <span className="text-base font-bold text-slate-900 truncate">
              {doctorName}
            </span>
            <span className="text-sm text-slate-500 truncate mt-0.5">
              {departmentName} · {roomName}
            </span>
          </div>

          {/* Badge ca trực */}
          <span className="ml-2 px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
            {shiftText}
          </span>
        </div>

        {/* Cụm Chỉ Số Nhanh (Bên phải) */}
        <div className="flex gap-2.5 items-center shrink-0">
          <div className="px-3 py-1.5 rounded-md bg-amber-50 border border-amber-200 flex items-center gap-2">
            <span className="text-sm text-amber-800">Chờ khám</span>
            <span className="text-sm font-mono font-bold text-amber-900">{waitingCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-md bg-sky-50 border border-sky-200 flex items-center gap-2">
            <span className="text-sm text-sky-800">Chờ KQ CLS</span>
            <span className="text-sm font-mono font-bold text-sky-900">{clsCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 flex items-center gap-2">
            <span className="text-sm text-slate-600">Đã xong</span>
            <span className="text-sm font-mono font-bold text-slate-800">{doneCount}</span>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. PHÂN VÙNG LÀM VIỆC CHÍNH                                                */}
      {/* ========================================================================= */}
      <main className="h-full flex gap-3 p-3 overflow-hidden min-h-0">
        {/* ----------------------------------------------------------------------- */}
        {/* PHÂN VÙNG TRÁI: CA ĐANG KHÁM (62%)                                       */}
        {/* ----------------------------------------------------------------------- */}
        <section className="w-[62%] min-w-0 flex flex-col bg-white border border-slate-200 rounded-md overflow-hidden">
          {/* Header Thẻ Khám */}
          <div className="h-12 px-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Ca đang khám
            </span>
            {currentExamPatient && (
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span>ĐANG TRONG PHÒNG KHÁM</span>
              </div>
            )}
          </div>

          {/* Nội Dung Hồ Sơ Bệnh Nhân */}
          {currentExamPatient ? (
            <div className="p-5 flex flex-col gap-4 flex-1 overflow-y-auto min-h-0">
              {/* Hàng 1: Thông tin hành chính */}
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl font-bold text-slate-900 uppercase truncate">
                  {patientName}
                </h2>
                <div className="text-sm text-slate-500 font-mono flex items-center gap-2 flex-wrap">
                  <span>{patientGender}</span>
                  {patientAge !== undefined && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span>{patientAge} tuổi</span>
                    </>
                  )}
                  <span className="text-slate-300">•</span>
                  <span className="font-semibold text-slate-700">Mã: #{patientCode}</span>
                  <span className="text-slate-300">•</span>
                  <span className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                    BHYT
                  </span>
                </div>
              </div>

              {/* Hàng 2: Chỉ số sinh tồn — Grid 4 cột */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                    Huyết áp
                  </div>
                  <div className="text-base font-bold font-mono text-slate-800 mt-1 truncate">
                    {bp}
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                    Mạch
                  </div>
                  <div className="text-base font-bold font-mono text-slate-800 mt-1 truncate">
                    {pulse}
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                    Thân nhiệt
                  </div>
                  <div className="text-base font-bold font-mono text-slate-800 mt-1 truncate">
                    {temp}
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-center">
                  <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                    SpO2
                  </div>
                  <div className="text-base font-bold font-mono text-slate-800 mt-1 truncate">
                    {spo2}
                  </div>
                </div>
              </div>

              {/* Hàng 3: Dị ứng + Triệu chứng */}
              <div className="flex flex-col gap-2.5">
                <div className="bg-rose-50 border border-rose-200 rounded-md p-3 text-sm text-rose-800">
                  <span className="truncate">
                    <strong className="font-semibold">Dị ứng:</strong> {allergyText}
                  </span>
                </div>
                <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-md border border-slate-100 leading-relaxed">
                  <strong className="font-semibold">Triệu chứng:</strong> &ldquo;{reasonText}&rdquo;
                </div>
              </div>

              {/* Hàng 4: Bộ Nút Hành Động */}
              <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleOpenExamRecord}
                  disabled={actionLoading}
                  className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md flex items-center justify-center transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Ghi Bệnh Án &amp; Kê Đơn
                </button>
                <button
                  type="button"
                  onClick={handleOrderParaclinical}
                  disabled={actionLoading}
                  className="h-10 px-4 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 text-sm font-medium rounded-md flex items-center justify-center transition-colors shrink-0 cursor-pointer disabled:opacity-60"
                >
                  Chỉ Định CLS
                </button>
                <button
                  type="button"
                  onClick={handlePauseExam}
                  disabled={actionLoading}
                  className="h-10 px-4 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-600 text-sm font-medium rounded-md flex items-center justify-center transition-colors shrink-0 cursor-pointer disabled:opacity-60"
                >
                  Tạm Hoãn Ca
                </button>
                <button
                  type="button"
                  onClick={handleFinishExam}
                  disabled={actionLoading}
                  className="h-10 px-4 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-md flex items-center justify-center transition-colors shrink-0 cursor-pointer disabled:opacity-60"
                >
                  Kết Thúc
                </button>
              </div>
            </div>
          ) : (
            /* Empty State — Phòng đang trống */
            <div className="m-auto flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 mb-4"></div>
              <p className="text-base font-medium text-slate-500 mb-5">
                Hiện tại không có bệnh nhân nào trong phòng khám.
              </p>
              <button
                type="button"
                onClick={handleCallNextPatient}
                disabled={actionLoading || !nextWaitingPatient}
                className="h-12 px-7 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md shadow-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>
                  GỌI BỆNH NHÂN KẾ TIẾP{' '}
                  {nextWaitingPatient?.soThuTu
                    ? `(STT ${String(nextWaitingPatient.soThuTu).padStart(2, '0')})`
                    : ''}{' '}
                  — [F2]
                </span>
              </button>
            </div>
          )}
        </section>

        {/* ----------------------------------------------------------------------- */}
        {/* PHÂN VÙNG PHẢI: HÀNG ĐỢI PHÒNG KHÁM (38%)                                */}
        {/* ----------------------------------------------------------------------- */}
        <section className="w-[38%] min-w-0 flex flex-col bg-white border border-slate-200 rounded-md overflow-hidden">
          {/* Tab Chuyển Đổi Hàng Đợi */}
          <div className="h-12 px-3 border-b border-slate-200 bg-slate-50 flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('WAITING')}
              className={`px-4 py-2 rounded-md text-sm transition-all cursor-pointer ${
                activeTab === 'WAITING'
                  ? 'font-semibold bg-white border border-slate-200 text-slate-800 shadow-sm'
                  : 'font-medium text-slate-500 hover:text-slate-700 border border-transparent'
              }`}
            >
              Chờ Khám ({waitingCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('CLS')}
              className={`px-4 py-2 rounded-md text-sm transition-all cursor-pointer ${
                activeTab === 'CLS'
                  ? 'font-semibold bg-white border border-slate-200 text-slate-800 shadow-sm'
                  : 'font-medium text-slate-500 hover:text-slate-700 border border-transparent'
              }`}
            >
              Đã Có KQ CLS ({clsCount})
            </button>
          </div>

          {/* Danh Sách Hàng Đợi */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1.5 min-h-0">
            {loadingQueue ? (
              <div className="p-8 text-center text-sm text-slate-400">
                Đang tải danh sách hàng đợi...
              </div>
            ) : activeQueueList.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-400 italic">
                Hàng đợi đang trống.
              </div>
            ) : (
              activeQueueList.map((p, idx) => {
                const sttDisplay = String(p.soThuTu ?? idx + 1).padStart(2, '0');
                const arrivalTime = formatTime(p.thoiGianBatDauKham);
                const badgeText =
                  activeTab === 'CLS'
                    ? 'Đã có KQ'
                    : arrivalTime
                    ? `Hẹn ${arrivalTime}`
                    : 'Chờ khám';
                const pGenderText = p.gioiTinh === 'M' || p.gioiTinh === 'Nam' ? 'Nam' : 'Nữ';
                const pCodeText = p.maBenhNhanNoiBo
                  ? `#${p.maBenhNhanNoiBo}`
                  : p.maLuotKhamGanNhat
                  ? `#${p.maLuotKhamGanNhat}`
                  : `#BN-${p.id}`;

                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors rounded-md"
                  >
                    {/* 1. Cột STT */}
                    <div className="w-11 h-11 shrink-0 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-sm text-slate-700">
                      {sttDisplay}
                    </div>

                    {/* 2. Cột Thông tin */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-800 truncate">
                          {p.hoTen}
                        </span>
                        <span className="shrink-0 px-2 py-0.5 rounded text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {badgeText}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1 truncate">
                        <span className="shrink-0">{pCodeText}</span>
                        <span className="text-slate-300 shrink-0">•</span>
                        <span className="shrink-0">Đến: {arrivalTime || '--:--'}</span>
                        <span className="text-slate-300 shrink-0">•</span>
                        <span className="text-slate-500 shrink-0">
                          {p.tuoi}T - {pGenderText}
                        </span>
                      </div>
                    </div>

                    {/* 3. Cột Thao tác */}
                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCallPatient(p)}
                        disabled={actionLoading}
                        className="h-8 px-3 bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-700 text-sm font-medium rounded-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        Gọi vào
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default OverviewPanel;