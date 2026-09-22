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

const patientManagementStyles = `
/* ===== COMMON UTILS & VARIABLES ===== */
:root {
  --color-primary: #0f172a;
  --color-primary-light: #1e293b;
  --color-accent: #3b82f6;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-gray-50: #f8fafc;
  --color-gray-100: #f1f5f9;
  --color-gray-200: #e2e8f0;
  --color-gray-300: #cbd5e1;
  --color-gray-400: #94a3b8;
  --color-gray-500: #64748b;
  --color-gray-600: #475569;
  --color-gray-700: #334155;
  --color-gray-800: #1e293b;
  --color-gray-900: #0f172a;
}
.patient-scroll::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.patient-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.patient-scroll::-webkit-scrollbar-track {
  background: transparent;
}

/* ===== PAGE STYLES ===== */
.patient-management {
  padding: 12px 16px;
  min-height: 100%;
  height: auto;
  background: #f1f5f9;
  padding-bottom: 16px;
}
.patient-management::-webkit-scrollbar {
  width: 7px;
}
.patient-management::-webkit-scrollbar-track {
  background: transparent;
}
.patient-management::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.patient-management::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
.patient-management .patient-tabs {
  width: 100%;
}
.patient-management .patient-tabs .ant-tabs-nav {
  margin-bottom: 16px;
  background: #fff;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}
.patient-management .patient-tabs .ant-tabs-nav::before {
  border-bottom: none;
}
.patient-management .patient-tabs .ant-tabs-tab {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  padding: 10px 16px;
  transition: all 0.2s;
  border-radius: 8px 8px 0 0;
}
.patient-management .patient-tabs .ant-tabs-tab:hover {
  color: #0f172a;
  background: #f8fafc;
}
.patient-management .patient-tabs .ant-tabs-tab-active {
  color: #0f172a;
  font-weight: 600;
}
.patient-management .patient-tabs .ant-tabs-tab .ant-tabs-tab-btn i {
  margin-right: 6px;
  font-size: 14px;
}
.patient-management .patient-tabs .ant-tabs-ink-bar {
  background: #3b82f6;
  height: 3px;
  border-radius: 3px 3px 0 0;
}
.patient-management .kpi-grid-wrapper {
  margin-bottom: 16px;
}
.patient-management .toolbar-wrapper {
  margin-bottom: 12px;
}
.patient-management .filters-wrapper {
  margin-bottom: 12px;
}
.patient-management .table-wrapper {
  width: 100%;
}
.patient-management .two-col {
  display: flex;
  gap: 20px;
  width: 100%;
  align-items: flex-start;
}
.patient-management .two-col .left-col {
  flex: 1;
  min-width: 0;
}
.patient-management .two-col .right-col {
  flex-shrink: 0;
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.patient-management .ant-table-wrapper {
  width: 100%;
}
.patient-management .ant-table {
  background: #fff;
}
@media (max-width: 1200px) {
  .patient-management .two-col .right-col {
    width: 240px;
  }
}
@media (max-width: 1024px) {
  .patient-management .two-col {
    flex-direction: column;
  }
  .patient-management .two-col .right-col {
    width: 100%;
  }
}
@media (max-width: 820px) {
  .patient-management .patient-tabs .ant-tabs-tab {
    padding: 8px 12px;
    font-size: 12px;
  }
  .patient-management .patient-tabs .ant-tabs-tab span:not(.ant-tabs-tab-btn) {
    display: none;
  }
  .patient-management .patient-tabs .ant-tabs-tab i {
    font-size: 16px;
    margin-right: 0;
  }
}
@media (max-width: 640px) {
  .patient-management {
    padding: 0;
    padding-bottom: 20px;
  }
  .patient-management .patient-tabs .ant-tabs-nav {
    padding: 0 8px;
    border-radius: 0;
    border-left: none;
    border-right: none;
    margin-bottom: 12px;
  }
  .patient-management .patient-tabs .ant-tabs-tab {
    padding: 6px 10px;
    font-size: 11px;
  }
  .patient-management .two-col {
    gap: 12px;
  }
}
`;

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
          <div className="toolbar-wrapper">
            <PatientToolbar onAddPatient={handleAddPatient} />
          </div>

          <div className="filters-wrapper">
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
                todayStats={{
                  today: thongKeData?.tongBenhNhan ?? 0,
                  treating: thongKeData?.dangKham ?? 0,
                  waiting: thongKeData?.choKham ?? 0,
                }}
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
    <>
      <style>{patientManagementStyles}</style>
      <div className="patient-management">
        <div className="kpi-grid-wrapper">
          <KPIGrid stats={thongKeData ?? defaultStats} loading={thongKeLoading} />
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="patient-tabs"
          items={tabItems}
        />
      </div>
    </>
  );
};