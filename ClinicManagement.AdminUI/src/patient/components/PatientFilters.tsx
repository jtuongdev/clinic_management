// src/patient/components/PatientFilters.tsx

import { Input, Select, Button, Space } from 'antd';
import { SearchOutlined, FilterOutlined, UndoOutlined } from '@ant-design/icons';
const filterStyles = `
.patient-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  background: #fff;
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}
.patient-filters .search-box {
  position: relative;
  flex: 1;
  min-width: 180px;
}
.patient-filters .search-box .ant-input-affix-wrapper {
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  transition: all 0.2s;
  height: 34px;
}
.patient-filters .search-box .ant-input-affix-wrapper:focus,
.patient-filters .search-box .ant-input-affix-wrapper-focused {
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.patient-filters .search-box .ant-input-affix-wrapper .ant-input {
  background: transparent;
  font-size: 12px;
}
.patient-filters .search-box .ant-input-affix-wrapper .ant-input-prefix {
  color: #94a3b8;
}
.patient-filters .ant-select {
  min-width: 120px;
}
.patient-filters .ant-select .ant-select-selector {
  height: 34px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-size: 12px;
  transition: all 0.2s;
}
.patient-filters .ant-select .ant-select-selector:hover {
  border-color: #cbd5e1;
}
.patient-filters .ant-select-focused .ant-select-selector {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: #fff;
}
.patient-filters .ant-select .ant-select-selection-placeholder {
  color: #94a3b8;
}
.patient-filters .ant-btn {
  height: 34px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.patient-filters .ant-btn .anticon {
  font-size: 13px;
}
.patient-filters .ant-btn-primary {
  background: #0f172a;
  border-color: #0f172a;
}
.patient-filters .ant-btn-primary:hover {
  background: #1e293b;
  border-color: #1e293b;
}
@media (max-width: 820px) {
  .patient-filters {
    flex-direction: column;
    align-items: stretch;
    padding: 12px 14px;
  }
  .patient-filters .search-box {
    min-width: unset;
  }
  .patient-filters .ant-select {
    min-width: unset;
  }
}
@media (max-width: 480px) {
  .patient-filters {
    padding: 10px;
    gap: 8px;
  }
  .patient-filters .ant-btn {
    height: 30px;
    font-size: 11px;
    padding: 0 10px;
  }
}
`;

const { Search } = Input;

interface PatientFiltersProps {
  searchKeyword: string;
  statusFilter?: string;
  genderFilter?: string;
  deptFilter?: string;   
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onGenderChange: (value: string) => void;
  onDeptChange: (value: string) => void;
  onReset: () => void;
  onFilter: () => void;
}

export const PatientFilters = ({
  searchKeyword,
  statusFilter,
  genderFilter,
  deptFilter,
  onSearchChange,
  onStatusChange,
  onGenderChange,
  onDeptChange,
  onReset,
  onFilter,
}: PatientFiltersProps) => {
  return (
    <>
      <style>{filterStyles}</style>
      <div className="patient-filters">
      <div className="search-box">
        <Search
          placeholder="Tìm theo tên, mã BN, CCCD, SĐT..."
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
        />
      </div>
      
      <Select
        placeholder="Tất cả trạng thái"
        value={statusFilter || undefined}
        onChange={onStatusChange}
        allowClear
        options={[
          { value: 'CHO_KHAM', label: 'Chờ khám' },
          { value: 'DANG_KHAM', label: 'Đang khám' },
          { value: 'HOAN_THANH', label: 'Hoàn thành' },
          { value: 'DA_HUY', label: 'Đã hủy' },
        ]}
      />
      
      <Select
        placeholder="Tất cả giới tính"
        value={genderFilter || undefined}
        onChange={onGenderChange}
        allowClear
        options={[
          { value: 'M', label: 'Nam' },
          { value: 'F', label: 'Nữ' },
        ]}
      />
      
      <Select
        placeholder="Tất cả khoa"
        value={deptFilter || undefined}
        onChange={onDeptChange}
        allowClear
        options={[
          { value: 'Nội', label: 'Nội' },
          { value: 'Ngoại', label: 'Ngoại' },
          { value: 'Sản', label: 'Sản' },
          { value: 'Nhi', label: 'Nhi' },
        ]}
      />
      
      <Button type="primary" icon={<FilterOutlined />} onClick={onFilter}>Lọc</Button>
      <Button icon={<UndoOutlined />} onClick={onReset}>Reset</Button>
    </div>
    </>
  );
};