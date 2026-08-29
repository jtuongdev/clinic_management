// src/patient/components/PatientFilters.tsx

import { Input, Select, Button, Space } from 'antd';
import { SearchOutlined, FilterOutlined, UndoOutlined } from '@ant-design/icons';
import './style/PatientFilters.css'

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
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
      background: '#fff',
      padding: '10px 16px',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
    }}>
      <Search
        placeholder="Tìm theo tên, mã BN, CCCD, SĐT..."
        value={searchKeyword}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ minWidth: 200, flex: 1 }}
        allowClear
      />
      
      <Select
        placeholder="Tất cả trạng thái"
        value={statusFilter || undefined} // Vẫn dùng || undefined để allowClear hoạt động
        onChange={onStatusChange}
        allowClear
        style={{ minWidth: 130 }}
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
        style={{ minWidth: 120 }}
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
        style={{ minWidth: 120 }}
        options={[
          { value: 'Nội', label: 'Nội' },
          { value: 'Ngoại', label: 'Ngoại' },
          { value: 'Sản', label: 'Sản' },
          { value: 'Nhi', label: 'Nhi' },
        ]}
      />
      
      <Button icon={<FilterOutlined />} onClick={onFilter}>Lọc</Button>
      <Button icon={<UndoOutlined />} onClick={onReset}>Reset</Button>
    </div>
  );
};