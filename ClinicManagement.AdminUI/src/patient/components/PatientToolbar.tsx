import { Button, Space } from 'antd';
import {
  PlusOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  PrinterOutlined,
  BellOutlined,
  UploadOutlined,
} from '@ant-design/icons';
const toolbarStyles = `
.patient-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  background: #fff;
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}
.patient-toolbar .toolbar-left,
.patient-toolbar .toolbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.patient-toolbar .toolbar-right {
  margin-left: auto;
}
.patient-toolbar .ant-btn {
  height: 32px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.patient-toolbar .ant-btn .anticon {
  font-size: 14px;
}
.patient-toolbar .ant-btn-primary {
  background: #0f172a;
  border-color: #0f172a;
}
.patient-toolbar .ant-btn-primary:hover {
  background: #1e293b;
  border-color: #1e293b;
}
.patient-toolbar .ant-btn-primary .anticon {
  color: #fff;
}
@media (max-width: 820px) {
  .patient-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .patient-toolbar .toolbar-left,
  .patient-toolbar .toolbar-right {
    width: 100%;
  }
  .patient-toolbar .toolbar-right {
    margin-left: 0;
  }
  .patient-toolbar .ant-btn span:not(.anticon) {
    display: none;
  }
}
@media (max-width: 480px) {
  .patient-toolbar {
    padding: 6px 10px;
  }
  .patient-toolbar .ant-btn {
    height: 28px;
    font-size: 11px;
    padding: 0 8px;
  }
}
`;

interface PatientToolbarProps {
  onAddPatient?: () => void;
}

export const PatientToolbar = ({ onAddPatient }: PatientToolbarProps) => {
  return (
    <>
      <style>{toolbarStyles}</style>
      <div className="patient-toolbar">
        <div className="toolbar-left">
          <Button type="primary" icon={<PlusOutlined />} onClick={onAddPatient}>
            Thêm bệnh nhân
          </Button>
          <Button icon={<FileExcelOutlined />}>Excel</Button>
          <Button icon={<FilePdfOutlined />}>PDF</Button>
          <Button icon={<PrinterOutlined />}>In</Button>
        </div>
        <div className="toolbar-right">
          <Button icon={<BellOutlined />}>Thông báo</Button>
          <Button icon={<UploadOutlined />}>Nhập</Button>
        </div>
      </div>
    </>
  );
};