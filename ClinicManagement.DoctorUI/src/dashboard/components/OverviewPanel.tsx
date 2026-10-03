import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../Auth/context/AuthProvider';
import { doctorScheduleApi, type TodayStatusDto } from '../../schedule/api/doctorSchedule.api';
import { examinationApi } from '../../examination/api/examination.api';
import type { BenhNhanListDto } from '../../examination/types/examination/queue.types';
import type { ExaminationDetailResponse } from '../../examination/types/examination/exam.types';

// ─── Helpers 

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

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Thẻ KPI nhỏ hiển thị trên header */
interface KpiCardProps {
  label: string;
  count: number;
  colorClass: string; // Tailwind text + bg + border combo
  dotColor: string;
}
const KpiCard: React.FC<KpiCardProps> = ({ label, count, colorClass, dotColor }) => (
  <div className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border ${colorClass}`}>
    <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
    <span className="text-xs font-medium leading-none">{label}</span>
    <span className="text-lg font-bold font-mono leading-none ml-1">{count}</span>
  </div>
);

/** Thẻ chỉ số sinh tồn */
interface VitalCardProps {
  label: string;
  value: string;
  accent?: string; // Tailwind border-left color class
}
const VitalCard: React.FC<VitalCardProps> = ({ label, value, accent = 'border-l-slate-300' }) => (
  <div className={`bg-white border border-slate-200 border-l-2 ${accent} rounded-lg p-3 text-center`}>
    <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
      {label}
    </div>
    <div className="text-sm font-bold font-mono text-slate-800 truncate">{value}</div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const OverviewPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [todayStatus, setTodayStatus] = useState<TodayStatusDto | null>(null);
  const [queuePatients, setQueuePatients] = useState<BenhNhanListDto[]>([]);
  const [currentExamPatient, setCurrentExamPatient] = useState<BenhNhanListDto | null>(null);
  const [examDetail, setExamDetail] = useState<ExaminationDetailResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'WAITING' | 'CLS' | 'DONE'>('WAITING');
  const [actionLoading, setActionLoading] = useState(false);
  const [loadingQueue, setLoadingQueue] = useState(false);

  // ── Tải trạng thái ca trực ──────────────────────────────────────────────────
  const loadStatus = useCallback(async () => {
    try {
      const res = await doctorScheduleApi.getTodayStatus();
      if (res?.data) setTodayStatus(res.data);
    } catch (err) {
      console.error('Không thể tải trạng thái ca trực:', err);
    }
  }, []);

  // ── Tải hàng đợi bệnh nhân ─────────────────────────────────────────────────
  const userId = user?.id;
  const loadQueue = useCallback(async () => {
    setLoadingQueue(true);
    try {
      const res = await examinationApi.getHangDoi({ maBacSi: userId || 0, pageSize: 50 });
      const items = res.data?.data?.items || [];
      setQueuePatients(items);

      const inExam = items.find(
        (p) =>
          p.trangThaiLuotKham === 'DANG_KHAM' ||
          p.trangThaiLuotKham === 'DangKham' ||
          p.trangThaiLuotKham === 'exam'
      );
      setCurrentExamPatient(inExam ?? null);
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

  // ── Tải chi tiết bệnh án khi có bệnh nhân đang khám ───────────────────────
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
        if (isMounted && res.data?.data) setExamDetail(res.data.data);
      })
      .catch((err) => {
        console.error('Không thể tải chi tiết ca khám:', err);
        if (isMounted) setExamDetail(null);
      });
    return () => { isMounted = false; };
  }, [currentExamPatientId]);

  // ── Phân loại danh sách hàng đợi ──────────────────────────────────────────
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

  const activeQueueList =
    activeTab === 'WAITING' ? waitingPatients :
    activeTab === 'CLS'     ? clsPatients :
                              completedPatients;

  const nextWaitingPatient = waitingPatients[0] ?? null;

  // ── Hành động: Gọi bệnh nhân cụ thể ───────────────────────────────────────
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

  // ── Hành động: Gọi bệnh nhân kế tiếp (F2) ─────────────────────────────────
  const handleCallNextPatient = useCallback(async () => {
    if (!nextWaitingPatient) {
      toast('Hàng đợi hiện không có bệnh nhân nào đang chờ.');
      return;
    }
    await handleCallPatient(nextWaitingPatient);
  }, [nextWaitingPatient, handleCallPatient]);

  // ── Phím tắt [F2] ──────────────────────────────────────────────────────────
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

  // ── Các hành động khám ─────────────────────────────────────────────────────
  const handleOpenExamRecord = () => {
    if (!currentExamPatient) return;
    navigate('/exam', { state: { patient: currentExamPatient } });
  };

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

  const handlePauseExam = () => {
    if (!currentExamPatient) return;
    toast(`Đã tạm hoãn ca khám của bệnh nhân ${currentExamPatient.hoTen}.`);
    setCurrentExamPatient(null);
  };

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

  // ── Dữ liệu bác sĩ & ca trực ───────────────────────────────────────────────
  const doctorName = user?.fullName || 'Bác sĩ điều trị';
  const departmentName = user?.chuyenKhoa || todayStatus?.schedule?.tenKhoa || 'Khoa Khám Bệnh';
  const roomName = todayStatus?.schedule?.tenPhongKham || 'Phòng khám';
  const shiftTime = todayStatus?.schedule
    ? `${todayStatus.schedule.thoiGianBatDau?.substring(0, 5) || '--:--'} – ${todayStatus.schedule.thoiGianKetThuc?.substring(0, 5) || '--:--'}`
    : null;
  const shiftName = todayStatus?.schedule?.tenCa || null;

  // ── Dữ liệu bệnh nhân đang khám ────────────────────────────────────────────
  const patientName = currentExamPatient?.hoTen || '';
  const patientGender =
    currentExamPatient?.gioiTinh === 'M' || currentExamPatient?.gioiTinh === 'Nam' ? 'Nam' : 'Nữ';
  const patientAge = currentExamPatient?.tuoi;
  const patientCode =
    currentExamPatient?.maBenhNhanNoiBo ||
    currentExamPatient?.maLuotKhamGanNhat ||
    (currentExamPatient ? `BN-${currentExamPatient.id}` : '');
  const patientStt = currentExamPatient?.soThuTu;

  // ── Sinh hiệu từ API ────────────────────────────────────────────────────────
  const bp =
    examDetail?.sinhHieu?.huyetApTamThu && examDetail?.sinhHieu?.huyetApTamTruong
      ? `${examDetail.sinhHieu.huyetApTamThu}/${examDetail.sinhHieu.huyetApTamTruong}`
      : '--/--';
  const pulse = examDetail?.sinhHieu?.mach ? `${examDetail.sinhHieu.mach}` : '--';
  const temp = examDetail?.sinhHieu?.nhietDo ? `${examDetail.sinhHieu.nhietDo}` : '--';
  const spo2 = examDetail?.sinhHieu?.spO2 ? `${examDetail.sinhHieu.spO2}` : '--';

  const allergyItems = examDetail?.tienSuBenhs
    ?.filter((t) => t.loaiTienSu === 1 || t.ten?.toLowerCase().includes('dị ứng'))
    .map((t) => t.ten);
  const allergyText =
    allergyItems && allergyItems.length > 0
      ? allergyItems.join(', ')
      : examDetail?.ghiChuTienSu || 'Không ghi nhận dị ứng';

  const reasonText = examDetail?.lyDoKham || 'Chưa cập nhật lý do khám';

  // ── Tab config ──────────────────────────────────────────────────────────────
  const tabs: { key: 'WAITING' | 'CLS' | 'DONE'; label: string; count: number }[] = [
    { key: 'WAITING', label: 'Chờ khám', count: waitingCount },
    { key: 'CLS',     label: 'Chờ KQ CLS', count: clsCount },
    { key: 'DONE',    label: 'Đã xong', count: doneCount },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-56px)] overflow-hidden flex flex-col bg-slate-50 font-sans text-slate-800">

      {/* ═══════════════════════════════════════════════════════════════════════
          HEADER: Thông tin bác sĩ + KPI bar
          ═══════════════════════════════════════════════════════════════════════ */}
      <header className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between gap-4 shrink-0 shadow-sm">

        {/* Nhóm trái: Avatar + Tên + Khoa/Phòng + Ca trực */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shrink-0 shadow ring-2 ring-blue-100 select-none">
            <span className="text-sm font-extrabold tracking-tight">{getInitials(doctorName)}</span>
          </div>

          {/* Tên + Khoa/Phòng */}
          <div className="flex flex-col min-w-0 leading-snug">
            <span className="text-sm font-bold text-slate-900 truncate">{doctorName}</span>
            <span className="text-xs text-slate-500 truncate">
              {departmentName}
              {roomName && roomName !== 'Phòng khám' && (
                <> · <span className="text-blue-600 font-medium">{roomName}</span></>
              )}
            </span>
          </div>

          {/* Badge ca trực */}
          {shiftTime ? (
            <div className="ml-1 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 flex flex-col items-center shrink-0">
              <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider leading-none">
                {shiftName || 'Ca trực'}
              </span>
              <span className="text-xs font-bold text-indigo-700 leading-tight mt-0.5 font-mono">
                {shiftTime}
              </span>
            </div>
          ) : (
            <span className="ml-1 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-500 shrink-0">
              Chưa có lịch ca trực
            </span>
          )}
        </div>

        {/* Nhóm phải: 3 thẻ KPI */}
        <div className="flex items-center gap-2 shrink-0">
          <KpiCard
            label="Đang chờ khám"
            count={waitingCount}
            colorClass="bg-amber-50 border-amber-200 text-amber-800"
            dotColor="bg-amber-400"
          />
          <KpiCard
            label="Chờ KQ CLS"
            count={clsCount}
            colorClass="bg-sky-50 border-sky-200 text-sky-800"
            dotColor="bg-sky-400"
          />
          <KpiCard
            label="Đã hoàn thành"
            count={doneCount}
            colorClass="bg-emerald-50 border-emerald-200 text-emerald-800"
            dotColor="bg-emerald-400"
          />
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════════
          WORKSPACE: Phân vùng 65% / 35%
          ═══════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 flex gap-3 p-3 overflow-hidden min-h-0">

        {/* ─────────────────────────────────────────────────────────────────────
            PHẦN TRÁI (65%): Ca đang khám
            ───────────────────────────────────────────────────────────────────── */}
        <section className="w-[65%] min-w-0 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

          {/* Header card */}
          <div className="h-11 px-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {/* Stethoscope icon (SVG inline) */}
              <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                <circle cx="20" cy="10" r="2" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ca đang khám
              </span>
            </div>
            {currentExamPatient && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Đang trong phòng khám</span>
              </div>
            )}
          </div>

          {/* ── Active State: Có bệnh nhân đang khám ─────────────────────────── */}
          {currentExamPatient ? (
            <div className="flex-1 overflow-y-auto min-h-0 p-5 flex flex-col gap-4">

              {/* Hồ sơ bệnh nhân */}
              <div className="flex items-start gap-4">
                {/* STT lớn */}
                <div className="w-16 h-16 shrink-0 rounded-xl bg-blue-600 flex flex-col items-center justify-center text-white shadow-md">
                  <span className="text-[10px] font-semibold uppercase tracking-widest opacity-80 leading-none">STT</span>
                  <span className="text-2xl font-black font-mono leading-none mt-0.5">
                    {patientStt !== null && patientStt !== undefined
                      ? String(patientStt).padStart(2, '0')
                      : '--'}
                  </span>
                </div>

                {/* Thông tin hành chính */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-extrabold text-slate-900 uppercase truncate leading-tight">
                    {patientName}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap mt-1.5">
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      {patientGender}
                    </span>
                    {patientAge !== undefined && (
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        {patientAge} tuổi
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      #{patientCode}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      BHYT
                    </span>
                  </div>
                </div>
              </div>

              {/* Dấu hiệu sinh tồn — 4 cột */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Dấu hiệu sinh tồn
                </p>
                <div className="grid grid-cols-4 gap-2.5">
                  <VitalCard label="Huyết áp" value={`${bp} mmHg`} accent="border-l-rose-400" />
                  <VitalCard label="Mạch" value={`${pulse} l/p`} accent="border-l-orange-400" />
                  <VitalCard label="Thân nhiệt" value={`${temp} °C`} accent="border-l-amber-400" />
                  <VitalCard label="SpO₂" value={`${spo2} %`} accent="border-l-sky-400" />
                </div>
              </div>

              {/* Dị ứng + Lý do khám */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-lg p-3">
                  <svg className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <div className="text-sm text-rose-800 leading-relaxed">
                    <strong className="font-semibold">Dị ứng: </strong>{allergyText}
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                  <div className="text-sm text-slate-700 leading-relaxed">
                    <strong className="font-semibold text-slate-800">Lý do khám: </strong>
                    <span className="italic">"{reasonText}"</span>
                  </div>
                </div>
              </div>

              {/* Bộ nút hành động */}
              <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleOpenExamRecord}
                  disabled={actionLoading}
                  className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                  Ghi Bệnh Án &amp; Kê Đơn
                </button>
                <button
                  type="button"
                  onClick={handleOrderParaclinical}
                  disabled={actionLoading}
                  className="h-10 px-4 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-sm font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer disabled:opacity-60 active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.414 2.798H4.213c-1.444 0-2.414-1.798-1.414-2.798L4.2 15.3" />
                  </svg>
                  Chỉ Định CLS
                </button>
                <button
                  type="button"
                  onClick={handlePauseExam}
                  disabled={actionLoading}
                  className="h-10 px-4 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 text-sm font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer disabled:opacity-60 active:scale-[0.98]"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                  </svg>
                  Tạm Hoãn
                </button>
                <button
                  type="button"
                  onClick={handleFinishExam}
                  disabled={actionLoading}
                  className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer disabled:opacity-60 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Kết Thúc
                </button>
              </div>
            </div>

          ) : (
            /* ── Empty State: Phòng đang trống ────────────────────────────── */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              {/* Illustration */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center mb-5 shadow-inner">
                <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9" />
                </svg>
              </div>

              <h3 className="text-base font-bold text-slate-700 mb-1">Phòng khám đang trống</h3>
              <p className="text-sm text-slate-400 mb-6 max-w-xs leading-relaxed">
                Chưa có bệnh nhân nào đang được khám.
                {waitingCount > 0 && (
                  <> Hiện có <strong className="text-amber-600 font-semibold">{waitingCount} bệnh nhân</strong> đang chờ trong hàng đợi.</>
                )}
              </p>

              {/* Phím tắt hint */}
              <p className="text-xs text-slate-400 mb-3">
                Nhấn{' '}
                <kbd className="px-1.5 py-0.5 rounded-md border border-slate-300 bg-slate-100 text-slate-600 font-mono text-[11px] font-semibold shadow-sm">
                  F2
                </kbd>
                {' '}để gọi nhanh, hoặc bấm nút bên dưới
              </p>

              <button
                type="button"
                onClick={handleCallNextPatient}
                disabled={actionLoading || !nextWaitingPatient}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Gọi bệnh nhân kế tiếp
                {nextWaitingPatient?.soThuTu && (
                  <span className="bg-blue-500 text-white px-2 py-0.5 rounded-lg text-xs font-mono font-bold">
                    STT {String(nextWaitingPatient.soThuTu).padStart(2, '0')}
                  </span>
                )}
                <span className="opacity-60 text-xs">[F2]</span>
              </button>
            </div>
          )}
        </section>

        {/* ─────────────────────────────────────────────────────────────────────
            PHẦN PHẢI (35%): Smart Queue Sidebar
            ───────────────────────────────────────────────────────────────────── */}
        <section className="w-[35%] min-w-0 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

          {/* Tab header */}
          <div className="border-b border-slate-100 bg-slate-50/70 px-2 pt-2 pb-0 flex gap-1 shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-semibold
                  rounded-t-lg transition-all cursor-pointer border-b-2
                  ${activeTab === tab.key
                    ? 'border-blue-500 text-blue-700 bg-white shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}
                `}
              >
                <span>{tab.label}</span>
                <span
                  className={`
                    min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold font-mono flex items-center justify-center
                    ${activeTab === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-600'}
                  `}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Queue list */}
          <div className="flex-1 overflow-y-auto min-h-0 p-1.5">
            {loadingQueue ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span className="text-xs">Đang tải hàng đợi...</span>
              </div>
            ) : activeQueueList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <span className="text-xs italic">Hàng đợi đang trống</span>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {activeQueueList.map((p, idx) => {
                  const sttDisplay = String(p.soThuTu ?? idx + 1).padStart(2, '0');
                  const arrivalTime = formatTime(p.thoiGianBatDauKham);
                  const pGenderText = p.gioiTinh === 'M' || p.gioiTinh === 'Nam' ? 'Nam' : 'Nữ';
                  const pCodeText = p.maBenhNhanNoiBo
                    ? `#${p.maBenhNhanNoiBo}`
                    : p.maLuotKhamGanNhat
                    ? `LK#${p.maLuotKhamGanNhat}`
                    : `#BN-${p.id}`;

                  // Màu badge STT theo tab
                  const sttBg =
                    activeTab === 'WAITING' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    activeTab === 'CLS'     ? 'bg-sky-100 text-sky-800 border-sky-200' :
                                             'bg-emerald-100 text-emerald-800 border-emerald-200';

                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 group"
                    >
                      {/* STT Badge */}
                      <div className={`w-10 h-10 shrink-0 rounded-lg border flex items-center justify-center font-mono font-extrabold text-sm ${sttBg}`}>
                        {sttDisplay}
                      </div>

                      {/* Thông tin bệnh nhân */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-slate-800 truncate leading-tight">
                          {p.hoTen}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                          <span>{pCodeText}</span>
                          <span className="text-slate-300">·</span>
                          <span>{pGenderText}</span>
                          {p.tuoi && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span>{p.tuoi}T</span>
                            </>
                          )}
                          {arrivalTime && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span>{arrivalTime}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Nút Gọi vào */}
                      {activeTab !== 'DONE' && (
                        <button
                          type="button"
                          onClick={() => handleCallPatient(p)}
                          disabled={actionLoading}
                          className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all cursor-pointer disabled:opacity-50 opacity-0 group-hover:opacity-100 shadow-sm"
                        >
                          Gọi vào
                        </button>
                      )}
                      {activeTab === 'DONE' && (
                        <span className="shrink-0 px-2 py-1 text-[10px] font-semibold rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                          Xong
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer: Tổng bệnh nhân trong ngày */}
          <div className="border-t border-slate-100 px-4 py-2.5 flex items-center justify-between shrink-0 bg-slate-50/50">
            <span className="text-xs text-slate-400">Tổng lượt khám hôm nay</span>
            <span className="text-xs font-bold font-mono text-slate-700">
              {waitingCount + clsCount + doneCount}
            </span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OverviewPanel;