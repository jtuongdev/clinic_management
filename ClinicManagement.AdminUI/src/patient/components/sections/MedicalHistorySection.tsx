import { Button, Card, Col, Form, Input, Row, Select } from 'antd';
import { DeleteOutlined, PlusOutlined, FileTextOutlined } from '@ant-design/icons';

const { Option } = Select;

interface MedicalHistorySectionProps {
  historyList: any[];
  addHistory: () => void;
  removeHistory: (index: number) => void;
}

export const MedicalHistorySection = ({
  historyList,
  addHistory,
  removeHistory,
}: MedicalHistorySectionProps) => {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <FileTextOutlined />
        <span style={{ fontWeight: 600, fontSize: 14 }}>Tiền sử bệnh</span>
      </div>

      {historyList.map((_, index) => (
        <Card
          key={index}
          size="small"
          style={{ marginBottom: 12, background: '#fafafa' }}
          extra={
            historyList.length > 1 && (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeHistory(index)}
              />
            )
          }
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Loại tiền sử"
                name={['tienSuList', index, 'loaiTienSu']}
              >
                <Select>
                    <Option value="BENH_NEN">Bệnh nền</Option>
                    <Option value="DI_UNG">Dị ứng</Option>
                    <Option value="PHAU_THUAT">Phẫu thuật</Option>
                    <Option value="TIEN_SU_GIA_DINH">Tiền sử gia đình</Option>
                    <Option value="THOI_QUEN_SINH_HOAT">Thói quen sinh hoạt</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Tên bệnh / tình trạng"
                name={['tienSuList', index, 'ten']}
              >
                <Input placeholder="Tên bệnh" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Ghi chú"
                name={['tienSuList', index, 'ghiChu']}
              >
                <Input placeholder="Ghi chú" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ))}

      <Button
        type="dashed"
        onClick={addHistory}
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
      >
        Thêm tiền sử
      </Button>
    </>
  );
};