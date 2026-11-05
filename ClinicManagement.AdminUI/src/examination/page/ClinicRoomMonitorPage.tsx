import React, { useState } from 'react';
import { Card, Row, Col, Typography, Tag, Progress, Button, Space, Badge, Modal, Select, message } from 'antd';
import {
  SyncOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SwapOutlined,
  AlertOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

export interface RoomStatusItem {
  id: number;
  roomName: string;
  department: string;
  doctorName: string;
  registeredCount: number;
  waitingCount: number;
  examiningCount: number;
  completedCount: number;
  maxCapacity: number;
}

export const ClinicRoomMonitorPage: React.FC = () => {
  const [rooms, setRooms] = useState<RoomStatusItem[]>([
    {
      id: 1,
      roomName: 'Phòng 101 - Khám Nhi 1',
      department: 'Khoa Nhi',
      doctorName: 'BS. CKII. Sennv',
      registeredCount: 40,
      waitingCount: 12,
      examiningCount: 1,
      completedCount: 27,
      maxCapacity: 45,
    },
    {
      id: 2,
      roomName: 'Phòng 102 - Khám Nhi 2',
      department: 'Khoa Nhi',
      doctorName: 'BS. CKI. Nguyễn Văn B',
      registeredCount: 32,
      waitingCount: 6,
      examiningCount: 1,
      completedCount: 25,
      maxCapacity: 40,
    },
    {
      id: 3,
      roomName: 'Phòng 103 - Nội Tổng Quát',
      department: 'Khoa Nội',
      doctorName: 'ThS. BS. Trần Thị C',
      registeredCount: 48,
      waitingCount: 18,
      examiningCount: 1,
      completedCount: 29,
      maxCapacity: 50,
    },
    {
      id: 4,
      roomName: 'Phòng 104 - Tim Mạch & Lão Khoa',
      department: 'Khoa Nội',
      doctorName: 'PGS. TS. Lê Văn D',
      registeredCount: 28,
      waitingCount: 4,
      examiningCount: 1,
      completedCount: 23,
      maxCapacity: 35,
    },
    {
      id: 5,
      roomName: 'Phòng 105 - Tai Mũi Họng',
      department: 'Khoa Liên Chuyên Khoa',
      doctorName: 'BS. Hoàng Văn E',
      registeredCount: 36,
      waitingCount: 8,
      examiningCount: 1,
      completedCount: 27,
      maxCapacity: 40,
    },
    {
      id: 6,
      roomName: 'Phòng 106 - Răng Hàm Mặt',
      department: 'Khoa Liên Chuyên Khoa',
      doctorName: 'BS. Vũ Thị F',
      registeredCount: 22,
      waitingCount: 3,
      examiningCount: 1,
      completedCount: 18,
      maxCapacity: 30,
    },
    {
      id: 7,
      roomName: 'Phòng 107 - Sản Phụ Khoa',
      department: 'Khoa Phụ Sản',
      doctorName: 'BS. CKII. Đặng Thị G',
      registeredCount: 30,
      waitingCount: 9,
      examiningCount: 1,
      completedCount: 20,
      maxCapacity: 35,
    },
    {
      id: 8,
      roomName: 'Phòng 108 - Khám Cấp Cứu Ngoại Viện',
      department: 'Khoa Cấp Cứu',
      doctorName: 'BS. Trực Cấp Cứu',
      registeredCount: 15,
      waitingCount: 2,
      examiningCount: 2,
      completedCount: 11,
      maxCapacity: 20,
    },
  ]);

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [sourceRoom, setSourceRoom] = useState<RoomStatusItem | null>(null);
  const [targetRoomId, setTargetRoomId] = useState<number | null>(null);

  const handleOpenTransfer = (room: RoomStatusItem) => {
    setSourceRoom(room);
    setTargetRoomId(null);
    setTransferModalOpen(true);
  };

  const handleConfirmTransfer = () => {
    if (!sourceRoom || !targetRoomId) return;
    const target = rooms.find((r) => r.id === targetRoomId);
    if (!target) return;

    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === sourceRoom.id) {
          return { ...r, waitingCount: Math.max(0, r.waitingCount - 2) };
        }
        if (r.id === target.id) {
          return { ...r, waitingCount: r.waitingCount + 2 };
        }
        return r;
      })
    );

    message.success(`Đã điều chuyển 2 bệnh nhân chờ từ "${sourceRoom.roomName}" sang "${target.roomName}"`);
    setTransferModalOpen(false);
  };

  return (
    <div style={{ padding: '16px', background: '#f8fafc', minHeight: '100%' }}>
      {/* Top control bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#0f172a' }}>
            <span style={{ marginRight: 8 }}>🩺</span> Giám Sát & Điều Phối Phòng Khám Toàn Viện
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Theo dõi tải lượng bệnh nhân, tiến độ khám thời gian thực và cân bằng hàng đợi tự động
          </Text>
        </div>
        <Space>
          <Button icon={<SyncOutlined />} onClick={() => message.info('Đang đồng bộ trạng thái phòng khám...')}>
            Làm mới (F5)
          </Button>
        </Space>
      </div>

      {/* Grid of rooms */}
      <Row gutter={[16, 16]}>
        {rooms.map((room) => {
          const loadPercent = Math.min(100, Math.round((room.registeredCount / room.maxCapacity) * 100));
          const isOverloaded = loadPercent >= 85;
          const isWarning = loadPercent >= 70 && !isOverloaded;

          return (
            <Col xs={24} sm={12} lg={8} xl={6} key={room.id}>
              <Card
                size="small"
                style={{
                  borderRadius: '8px',
                  borderColor: isOverloaded ? '#fca5a5' : isWarning ? '#fed7aa' : '#e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: '13px', color: '#0f172a' }}>
                      {room.roomName}
                    </Text>
                    {isOverloaded ? (
                      <Tag color="error" icon={<AlertOutlined />}>Quá tải</Tag>
                    ) : (
                      <Badge status="processing" color="#16a34a" text={<span style={{ fontSize: 11, color: '#16a34a' }}>Đang khám</span>} />
                    )}
                  </div>
                }
                extra={
                  <Button
                    size="small"
                    type="link"
                    icon={<SwapOutlined />}
                    onClick={() => handleOpenTransfer(room)}
                    style={{ padding: 0 }}
                  >
                    Điều chuyển
                  </Button>
                }
              >
                {/* Doctor and department */}
                <div style={{ marginBottom: 10, fontSize: 12 }}>
                  <div style={{ color: '#0284c7', fontWeight: 600 }}>
                    <UserOutlined style={{ marginRight: 4 }} />
                    {room.doctorName}
                  </div>
                  <div style={{ color: '#64748b', fontSize: 11 }}>{room.department}</div>
                </div>

                {/* Queue Stats Matrix */}
                <Row gutter={8} style={{ textAlign: 'center', marginBottom: 12, background: '#f1f5f9', padding: '6px 0', borderRadius: '4px' }}>
                  <Col span={6}>
                    <div style={{ fontSize: 10, color: '#64748b' }}>TỔNG ĐK</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{room.registeredCount}</div>
                  </Col>
                  <Col span={6}>
                    <div style={{ fontSize: 10, color: '#c2410c' }}>ĐANG CHỜ</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#ea580c' }}>{room.waitingCount}</div>
                  </Col>
                  <Col span={6}>
                    <div style={{ fontSize: 10, color: '#0369a1' }}>ĐANG KHÁM</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0284c7' }}>{room.examiningCount}</div>
                  </Col>
                  <Col span={6}>
                    <div style={{ fontSize: 10, color: '#15803d' }}>ĐÃ KHÁM</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>{room.completedCount}</div>
                  </Col>
                </Row>

                {/* Capacity Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                    <span style={{ color: '#64748b' }}>Công suất phục vụ:</span>
                    <span style={{ fontWeight: 600, color: isOverloaded ? '#dc2626' : '#334155' }}>
                      {room.registeredCount}/{room.maxCapacity} ({loadPercent}%)
                    </span>
                  </div>
                  <Progress
                    percent={loadPercent}
                    size="small"
                    status={isOverloaded ? 'exception' : 'active'}
                    strokeColor={isOverloaded ? '#dc2626' : isWarning ? '#f97316' : '#16a34a'}
                    showInfo={false}
                  />
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Modal điều chuyển bệnh nhân giữa các phòng khám */}
      <Modal
        title={`Điều chuyển bệnh nhân từ: ${sourceRoom?.roomName || ''}`}
        open={transferModalOpen}
        onCancel={() => setTransferModalOpen(false)}
        onOk={handleConfirmTransfer}
        okText="Xác nhận điều chuyển"
        cancelText="Hủy"
        okButtonProps={{ disabled: !targetRoomId }}
      >
        <div style={{ padding: '12px 0' }}>
          <p style={{ color: '#475569', fontSize: '13px' }}>
            Phòng hiện tại có <b style={{ color: '#ea580c' }}>{sourceRoom?.waitingCount}</b> bệnh nhân đang chờ. Chọn phòng khám đích cùng chuyên khoa để san tải:
          </p>
          <Select
            style={{ width: '100%' }}
            placeholder="-- Chọn phòng khám tiếp nhận --"
            value={targetRoomId}
            onChange={(val) => setTargetRoomId(val)}
            options={rooms
              .filter((r) => r.id !== sourceRoom?.id)
              .map((r) => ({
                value: r.id,
                label: `${r.roomName} (Hiện chờ: ${r.waitingCount} người - ${r.doctorName})`,
              }))}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ClinicRoomMonitorPage;
