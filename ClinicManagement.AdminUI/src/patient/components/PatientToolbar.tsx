import { Button, Space } from 'antd';
import {
  PlusOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  PrinterOutlined,
  BellOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import './style/PatientToolbar.css'

interface PatientToolbarProps {
  onAddPatient?: () => void;
}

export const PatientToolbar = ({ onAddPatient }: PatientToolbarProps) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 8,
    }}>
      <Space wrap>
        <Button type="primary" icon={<PlusOutlined />} onClick={onAddPatient}>
          Thêm bệnh nhân
        </Button>
        <Button icon={<FileExcelOutlined />}>Excel</Button>
        <Button icon={<FilePdfOutlined />}>PDF</Button>
        <Button icon={<PrinterOutlined />}>In</Button>
      </Space>
      <Space wrap>
        <Button icon={<BellOutlined />}>Thông báo</Button>
        <Button icon={<UploadOutlined />}>Nhập</Button>
      </Space>
    </div>
  );
};