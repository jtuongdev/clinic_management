import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Empty, Row, Col, Select, Space, Spin, Tag, Tooltip, Typography } from 'antd';
import {
  ApartmentOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  ShopOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { facilityExaminationApi } from '../api/facility.examination.api';
import {
  ExaminationFacilityDepartment,
  ExaminationFacilityLocation,
  ExaminationFacilityRoom,
} from '../type/facility.examination.type';

const { Text } = Typography;

const ExaminationFacility: React.FC = () => {
  const [locations, setLocations] = useState<ExaminationFacilityLocation[]>([]);
  const [departments, setDepartments] = useState<ExaminationFacilityDepartment[]>([]);
  const [rooms, setRooms] = useState<ExaminationFacilityRoom[]>([]);
  const [locationId, setLocationId] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const loadFacility = useCallback(async (selectedLocationId?: number) => {
    setLoading(true);
    setError(undefined);
    try {
      const [locationsResponse, departmentsResponse] = await Promise.all([
        facilityExaminationApi.getLocations(),
        facilityExaminationApi.getDepartments(selectedLocationId),
      ]);
      const loadedLocations = Array.from(
        new Map((locationsResponse.data.data ?? []).map((location) => [location.id, location])).values()
      );
      const loadedDepartments = Array.from(
        new Map((departmentsResponse.data.data ?? []).map((department) => [department.maKhoa, department])).values()
      );
      setLocations(loadedLocations);
      setDepartments(loadedDepartments);

      const roomResponses = await Promise.all(
        loadedDepartments.map((department) =>
          facilityExaminationApi.getRoomsByDepartment(department.maKhoa)
        )
      );
      const uniqueRooms = new Map<number, ExaminationFacilityRoom>();
      roomResponses.forEach((response, index) => {
        (response.data.data ?? []).forEach((room) => {
          if (!uniqueRooms.has(room.id)) {
            uniqueRooms.set(room.id, {
              id: room.id,
              code: room.ma,
              name: room.ten,
              status: room.trangThai,
              departmentName: room.tenKhoa || loadedDepartments[index].tenKhoa,
              waitingCount: loadedDepartments[index].soLuotCho,
            });
          }
        });
      });
      setRooms([...uniqueRooms.values()]);
    } catch (requestError) {
      console.error('Không thể tải dữ liệu cơ sở và phòng khám', requestError);
      setError('Không thể tải dữ liệu cơ sở và phòng khám.');
      setDepartments([]);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFacility(locationId);
  }, [loadFacility, locationId]);

  const kpis = useMemo(() => [
    { label: 'Tổng phòng khám', value: rooms.length, icon: <ShopOutlined />, color: '#0b4f6c' },
    { label: 'Tổng khoa', value: departments.length, icon: <ApartmentOutlined />, color: '#0284c7' },
    {
      label: 'Tổng lượt chờ',
      value: departments.reduce((total, department) => total + department.soLuotCho, 0),
      icon: <ClockCircleOutlined />,
      color: '#f59e0b',
    },
    {
      label: 'Bác sĩ hoạt động',
      value: departments.reduce((total, department) => total + department.soBacSi, 0),
      icon: <TeamOutlined />,
      color: '#8b5cf6',
    },
  ], [departments, rooms.length]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: '#fff' }}>
      <div style={{ minHeight: 42, background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 18, overflowX: 'auto' }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            <span style={{ color: kpi.color }}>{kpi.icon}</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>{kpi.label}:</span>
            <strong style={{ color: kpi.color }}>{kpi.value}</strong>
          </div>
        ))}
      </div>

      <div style={{ minHeight: 46, padding: '6px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <Space>
          <ApartmentOutlined style={{ color: '#0b4f6c' }} />
          <Text strong>Sơ đồ cơ sở và phòng khám</Text>
          <Badge count={rooms.length} style={{ backgroundColor: '#0b4f6c' }} />
        </Space>
        <Space>
          <Select
            allowClear
            placeholder="Tất cả cơ sở"
            value={locationId}
            options={locations.map((location) => ({ value: location.id, label: `${location.code} - ${location.name}` }))}
            onChange={setLocationId}
            style={{ minWidth: 220 }}
          />
          <Tooltip title="Tải lại dữ liệu từ API">
            <Button icon={<ReloadOutlined />} onClick={() => void loadFacility(locationId)} loading={loading}>
              Làm mới
            </Button>
          </Tooltip>
        </Space>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 16 }}>
        {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}
        {loading ? <Spin description="Đang tải dữ liệu cơ sở và phòng khám..." /> : rooms.length === 0 ? (
          <Empty description="Chưa có dữ liệu phòng khám từ hệ thống" />
        ) : (
          <Row gutter={[12, 12]}>
            {rooms.map((room) => (
              <Col xs={24} sm={12} md={8} lg={6} key={room.id}>
                <div style={{ border: '1px solid #bae0ff', borderRadius: 6, padding: '12px 14px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#0b4f6c' }} />
                  <Text strong style={{ fontSize: 15, color: '#0b4f6c', display: 'block' }}>{room.code}</Text>
                  <Text type="secondary">{room.name}</Text>
                  <div style={{ marginTop: 10 }}>
                    <Tag color="blue">{room.departmentName}</Tag>
                    <Tag color={room.status === 'Hoạt động' ? 'success' : 'default'}>{room.status}</Tag>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Tag icon={<ClockCircleOutlined />} color={room.waitingCount > 0 ? 'warning' : 'success'}>
                      {room.waitingCount > 0 ? `${room.waitingCount} lượt đang chờ` : 'Không có lượt chờ'}
                    </Tag>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default ExaminationFacility;
