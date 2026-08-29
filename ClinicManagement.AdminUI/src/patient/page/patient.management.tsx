import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, Row, Col, message } from 'antd';

import { usePatientData } from '../hook/usePatientData';
import { useThongKeBenhNhan } from '../hook/useThongKeBenhNhan';

import { KPIGrid } from '../components/kpiIGrid';
import { PatientToolbar } from '../components/PatientToolbar';
import { PatientFilters } from '../components/PatientFilters';
import { PatientTable } from '../components/PatientTable';
import { PatientRightSidebar } from '../components/PatientRightSidebar';
import { AddPatientForm } from '../components/AddPatientForm';

import './patient.management.css';

export const PatientManagement = () => {
  const navigate = useNavigate();

  const {
    data: patients,
    loading,
    total,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    keyword,
    setKeyword,
    refetch,
  } = usePatientData();

  const { data: thongKeData, loading: thongKeLoading } = useThongKeBenhNhan();

  const defaultStats = {
    tongBenhNhan: 0,
    dangKham: 0,
    choKham: 0,
    daHoanThanh: 0,
    daHuy: 0,
  };

  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [genderFilter, setGenderFilter] = useState<string | undefined>();
  const [deptFilter, setDeptFilter] = useState<string | undefined>();

  const handleFilter = () => {
    message.info('Đã áp dụng bộ lọc');
    refetch();
  };

  const handleView = (patient: any) => {
    navigate(`/patient/detail/${patient.id}`);
  };

  const handleEdit = (patient: any) => {
    message.info(`Sửa ${patient.name}`);
  };

  const handleDelete = (patient: any) => {
    message.info(`Xóa ${patient.name}`);
  };

  const handleAddPatient = () => {
    setActiveTab('add');
  };

  const handleAddSuccess = () => {
    message.success('Thêm bệnh nhân thành công!');
    setRefreshKey(prev => prev + 1);
    refetch();
    setActiveTab('overview');
  };

  const tabItems = [
    {
      key: 'overview',
      label: <span><i className="fas fa-chart-pie" /> Tổng quan</span>,
      children: (
        <>
          <div style={{ marginBottom: 12 }}>
            <PatientToolbar onAddPatient={handleAddPatient} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <PatientFilters
              searchKeyword={keyword}
              statusFilter={statusFilter}
              genderFilter={genderFilter}
              deptFilter={deptFilter}
              onSearchChange={setKeyword}
              onStatusChange={setStatusFilter}
              onGenderChange={setGenderFilter}
              onDeptChange={setDeptFilter}
              onReset={() => {
                setKeyword('');
                setStatusFilter(undefined);
                setGenderFilter(undefined);
                setDeptFilter(undefined);
              }}
              onFilter={handleFilter}
            />
          </div>

          <Row gutter={[20, 20]}>
            <Col xs={24} lg={17}>
              <PatientTable
                key={refreshKey}
                data={patients}
                loading={loading}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                pagination={{
                  current: pageIndex,
                  pageSize: pageSize,
                  total: total,
                  onChange: (page, size) => {
                    setPageIndex(page);
                    setPageSize(size);
                  }
                }}
              />
            </Col>

            <Col xs={24} lg={7}>
              <PatientRightSidebar
                deptDistribution={[]}
                genderStats={{ male: 0, female: 0, total: 0 }}
                todayStats={{ today: 0, treating: 0, waiting: 0 }}
              />
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: 'list',
      label: <span><i className="fas fa-list" /> Danh sách</span>,
      children: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#94a3b8' }}>
          <i className="fas fa-list" style={{ fontSize: 32, marginRight: 12, color: '#cbd5e1' }} />
          Danh sách bệnh nhân đầy đủ với bộ lọc nâng cao.
        </div>
      ),
    },
    {
      key: 'add',
      label: <span><i className="fas fa-user-plus" /> Thêm mới</span>,
      children: (
        <AddPatientForm
          defaultCoSoId={1}
          onSuccess={handleAddSuccess}
          onCancel={() => setActiveTab('overview')}
        />
      ),
    },
    {
      key: 'report',
      label: <span><i className="fas fa-file-alt" /> Báo cáo</span>,
      children: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#94a3b8' }}>
          <i className="fas fa-file-alt" style={{ fontSize: 32, marginRight: 12, color: '#cbd5e1' }} />
          Báo cáo thống kê bệnh nhân sẽ hiển thị ở đây.
        </div>
      ),
    },
  ];

  return (
    <div className="patient-management">
      <div style={{ marginBottom: 20 }}>
        <KPIGrid stats={thongKeData ?? defaultStats} loading={thongKeLoading} />
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="patient-tabs"
        items={tabItems}
      />
    </div>
  );
};