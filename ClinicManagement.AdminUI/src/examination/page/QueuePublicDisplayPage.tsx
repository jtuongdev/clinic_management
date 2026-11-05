import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Typography, Space } from 'antd';
import {
  SoundOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ArrowRightOutlined,
  NotificationOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export interface DisplayQueueItem {
  stt: number;
  tenBenhNhan: string;
  phongKham: string;
  bacSi: string;
}

export const QueuePublicDisplayPage: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Bệnh nhân đang được gọi khám chính (trên TV lớn)
  const [currentCall, setCurrentCall] = useState<DisplayQueueItem>({
    stt: 15,
    tenBenhNhan: 'NGUYỄN THỊ BÌNH AN',
    phongKham: 'PHÒNG 101 - KHÁM NHI 1',
    bacSi: 'BS. CKII. SENNV',
  });

  // Hàng đợi các phòng khám khác trong viện
  const [upcomingRooms, setUpcomingRooms] = useState<DisplayQueueItem[]>([
    { stt: 16, tenBenhNhan: 'LỤC VĂN TIÊN', phongKham: 'Phòng 101 - Khám Nhi 1', bacSi: 'BS. CKII. Sennv' },
    { stt: 28, tenBenhNhan: 'NGUYỄN ĐÌNH PHÓNG', phongKham: 'Phòng 103 - Nội Tổng Quát', bacSi: 'ThS. BS. Trần Thị C' },
    { stt: 29, tenBenhNhan: 'NGUYỄN HOÀNG LONG', phongKham: 'Phòng 103 - Nội Tổng Quát', bacSi: 'ThS. BS. Trần Thị C' },
    { stt: 12, tenBenhNhan: 'ĐỖ MỸ LINH', phongKham: 'Phòng 105 - Tai Mũi Họng', bacSi: 'BS. Hoàng Văn E' },
    { stt: 7, tenBenhNhan: 'NGUYỄN ĐÌNH PHÙNG', phongKham: 'Phòng 106 - Răng Hàm Mặt', bacSi: 'BS. Vũ Thị F' },
  ]);

  // Đồng hồ thời gian thực
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Âm thanh Ding-Dong Y tế (Web Audio Synthesizer)
  const playHospitalChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;

      // Note 1: E5 (659.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.8);

      // Note 2: C5 (523.25 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(523.25, now + 0.4);
      gain2.gain.setValueAtTime(0.3, now + 0.4);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.4);
      osc2.stop(now + 1.2);
    } catch {
      // Audio not permitted or supported
    }
  };

  // Đọc loa gọi số bằng Text-to-Speech Tiếng Việt
  const speakPatientCall = (patient: DisplayQueueItem) => {
    playHospitalChime();

    if ('speechSynthesis' in window) {
      setTimeout(() => {
        const text = `Xin mời bệnh nhân số ${patient.stt}, ${patient.tenBenhNhan}, vào ${patient.phongKham}.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'vi-VN';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }, 700);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSimulateCallNext = () => {
    if (upcomingRooms.length === 0) return;
    const next = upcomingRooms[0];
    setCurrentCall(next);
    setUpcomingRooms((prev) => prev.slice(1));
    speakPatientCall(next);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #091e3a 0%, #102a45 100%)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
        userSelect: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* 1. Header TV Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 32px',
          background: 'rgba(0, 0, 0, 0.25)',
          borderBottom: '2px solid #0284c7',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ background: '#0284c7', padding: '6px 14px', borderRadius: 6, fontWeight: 800, fontSize: 18 }}>
            CLINIC EMR
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>HỆ THỐNG GỌI SỐ TỰ ĐỘNG NGOẠI TRÚ</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>BỆNH VIỆN / PHÒNG KHÁM ĐA KHOA QUỐC TẾ</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#38bdf8' }}>
              {currentTime.toLocaleTimeString('vi-VN')}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </div>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<SoundOutlined />}
              onClick={() => speakPatientCall(currentCall)}
              style={{ background: '#16a34a', borderColor: '#16a34a' }}
            >
              Phát âm gọi số
            </Button>
            <Button
              icon={<NotificationOutlined />}
              onClick={handleSimulateCallNext}
            >
              Gọi số kế tiếp
            </Button>
            <Button
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={toggleFullscreen}
            />
          </Space>
        </div>
      </div>

      {/* 2. Main Display Split: Big Callout (Left) + Multi-room Queue (Right) */}
      <div style={{ flex: 1, display: 'flex', padding: 24, gap: 24, minHeight: 0 }}>
        {/* Khối Trái: Bệnh nhân đang được gọi (Nổi bật nhất) */}
        <div
          style={{
            flex: '1 1 60%',
            background: 'radial-gradient(circle at top left, #1e3a8a 0%, #0f172a 100%)',
            borderRadius: 16,
            border: '2px solid #38bdf8',
            boxShadow: '0 0 35px rgba(56, 189, 248, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 32,
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 20,
              background: '#ef4444',
              color: '#ffffff',
              padding: '4px 20px',
              borderRadius: 20,
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: 2,
              animation: 'pulse 2s infinite',
            }}
          >
            ● ĐANG GỌI VÀO KHÁM
          </div>

          <div style={{ color: '#94a3b8', fontSize: 18, fontWeight: 600, marginTop: 20, textTransform: 'uppercase' }}>
            SỐ THỨ TỰ TIẾP ĐÓN
          </div>

          {/* SỐ THỨ TỰ KHỔNG LỒ */}
          <div
            style={{
              fontSize: '110px',
              fontWeight: 900,
              lineHeight: 1,
              color: '#facc15',
              textShadow: '0 0 30px rgba(250, 204, 21, 0.5)',
              margin: '12px 0',
            }}
          >
            {currentCall.stt < 10 ? `0${currentCall.stt}` : currentCall.stt}
          </div>

          {/* HỌ VÀ TÊN BỆNH NHÂN */}
          <div
            style={{
              fontSize: 38,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: 1.5,
              marginBottom: 16,
            }}
          >
            {currentCall.tenBenhNhan}
          </div>

          {/* PHÒNG KHÁM VÀ BÁC SĨ */}
          <div
            style={{
              background: 'rgba(2, 132, 199, 0.25)',
              border: '1px solid #0284c7',
              borderRadius: 12,
              padding: '16px 36px',
              maxWidth: '90%',
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
              <ArrowRightOutlined style={{ marginRight: 10 }} />
              {currentCall.phongKham}
            </div>
            <div style={{ fontSize: 16, color: '#e2e8f0', marginTop: 4 }}>
              Bác sĩ trực khám: <b>{currentCall.bacSi}</b>
            </div>
          </div>
        </div>

        {/* Khối Phải: Danh sách hàng chờ các phòng */}
        <div
          style={{
            flex: '1 1 40%',
            background: 'rgba(15, 23, 42, 0.75)',
            borderRadius: 16,
            border: '1px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 20px',
              background: '#1e293b',
              borderBottom: '1px solid #334155',
              fontSize: 16,
              fontWeight: 700,
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ClockCircleOutlined /> DANH SÁCH CHUẨN BỊ VÀO KHÁM
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
            {upcomingRooms.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: 8,
                  marginBottom: 8,
                  borderLeft: '4px solid #0284c7',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      background: '#0284c7',
                      color: '#ffffff',
                      fontSize: 20,
                      fontWeight: 800,
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.stt < 10 ? `0${item.stt}` : item.stt}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>{item.tenBenhNhan}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{item.phongKham}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 12, color: '#e2e8f0', background: '#334155', padding: '2px 8px', borderRadius: 4 }}>
                    Chuẩn bị
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Ticker Banner Cuối Màn Hình */}
      <div
        style={{
          background: '#0284c7',
          color: '#ffffff',
          padding: '8px 24px',
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>
          📢 Xin quý khách lưu ý: Khi số thứ tự của mình hiển thị trên màn hình, xin vui lòng đến đúng phòng khám đã chỉ dẫn.
        </span>
        <span>Hỗ trợ y tế: 1900 6868</span>
      </div>
    </div>
  );
};

export default QueuePublicDisplayPage;
