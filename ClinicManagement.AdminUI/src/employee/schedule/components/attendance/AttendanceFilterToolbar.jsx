import { Button, Input, Select, Space } from 'antd';
import { Search, AlertCircle, FileText } from 'lucide-react';

export const AttendanceFilterToolbar = ({
  searchKeyword,
  setSearchKeyword,
  deptFilter,
  setDeptFilter,
  statusFilter,
  setStatusFilter,
  khoas = [],
  abnormalCount = 0,
  totalRows = 0,
  pendingAdjustmentsCount = 0,
  onOpenAdjustmentsModal,
  onOpenPeriodModal,
  onExportCsv,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
        flexWrap: 'wrap',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Input
          placeholder="Tìm theo tên nhân viên, ca..."
          prefix={<Search size={15} style={{ color: '#94a3b8' }} />}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          allowClear
          style={{ width: 220, borderRadius: 8 }}
        />
        <Select
          placeholder="Khoa phòng"
          allowClear
          value={deptFilter}
          onChange={setDeptFilter}
          style={{ width: 200 }}
          options={[
            { value: undefined, label: 'Tất cả khoa phòng' },
            ...khoas.map((k) => ({ value: k.id, label: k.ten })),
          ]}
        />
        <Select
          placeholder="Trạng thái"
          allowClear
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 170 }}
          options={[
            { value: undefined, label: 'Tất cả trạng thái' },
            { value: 'DA_CHECK_IN', label: 'Đã check-in' },
            { value: 'DA_CHECK_OUT', label: 'Đã check-out' },
            { value: 'DI_DUNG_GIO', label: 'Đúng giờ' },
            { value: 'DI_MUON', label: 'Đi muộn' },
            { value: 'DI_MUON_VE_SOM', label: 'Đi muộn & về sớm' },
            { value: 'THIEU_CHECK_OUT', label: 'Thiếu check-out' },
            { value: 'CHUA_CHAM_CONG', label: 'Chưa chấm công' },
            { value: 'VANG_MAT', label: 'Vắng mặt' },
            { value: 'NGHI_PHEP', label: 'Nghỉ phép' },
          ]}
        />
        <Button
          type={statusFilter === 'ABNORMAL' ? 'primary' : 'default'}
          onClick={() => setStatusFilter(statusFilter === 'ABNORMAL' ? undefined : 'ABNORMAL')}
          style={
            statusFilter === 'ABNORMAL'
              ? { background: '#b45309', borderColor: '#b45309', color: '#fff', fontWeight: 600 }
              : { color: '#b45309', borderColor: '#fde68a', background: '#fffbeb', fontWeight: 600 }
          }
        >
          <AlertCircle size={14} style={{ marginRight: 5, verticalAlign: -2 }} />
          Ca bất thường cần xử lý ({abnormalCount})
        </Button>
        <span style={{ fontSize: 13, color: '#64748b', marginLeft: 4 }}>
          Hiển thị <strong>{totalRows}</strong> bản ghi
        </span>
      </div>

      <Space wrap>
        <Button
          onClick={onOpenAdjustmentsModal}
          style={
            pendingAdjustmentsCount > 0
              ? { borderColor: '#d97706', color: '#b45309', background: '#fffbeb', fontWeight: 600, borderRadius: 8 }
              : { borderRadius: 8 }
          }
        >
          <FileText size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
          Đơn duyệt điều chỉnh ({pendingAdjustmentsCount})
        </Button>
        <Button onClick={onOpenPeriodModal} style={{ borderRadius: 8 }}>
          Quản lý kỳ chấm công
        </Button>
        <Button onClick={onExportCsv} disabled={!totalRows} style={{ borderRadius: 8 }}>
          Xuất báo cáo CSV
        </Button>
      </Space>
    </div>
  );
};
