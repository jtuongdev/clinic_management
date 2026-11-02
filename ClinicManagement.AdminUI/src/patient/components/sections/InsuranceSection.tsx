import { Button, Card, Col, DatePicker, Form, Input, Row, Select } from 'antd';
import { DeleteOutlined, PlusOutlined, MedicineBoxOutlined } from '@ant-design/icons';

const { Option } = Select;

interface InsuranceSectionProps {
  insuranceList: any[];
  addInsurance: () => void;
  removeInsurance: (index: number) => void;
}

export const InsuranceSection = ({
  insuranceList,
  addInsurance,
  removeInsurance,
}: InsuranceSectionProps) => {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <MedicineBoxOutlined />
        <span style={{ fontWeight: 600, fontSize: 14 }}>Bảo hiểm</span>
      </div>

      {insuranceList.map((_, index) => (
        <Card
          key={index}
          size="small"
          style={{ marginBottom: 12, background: '#fafafa' }}
          extra={
            insuranceList.length > 1 && (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeInsurance(index)}
              />
            )
          }
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Loại bảo hiểm"
                name={['baoHiem', 'loaiBaoHiem']}
              >
                <Select>
                    <Option value="BHYT">BHYT</Option>
                    <Option value="BAO_HIEM_SUC_KHOE_TU_NHAN">Bảo hiểm sức khỏe tư nhân</Option>
                    <Option value="BAO_HIEM_TAI_NAN">Bảo hiểm tai nạn</Option>
                    <Option value="KHAC">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Nhà cung cấp"
                name={['baoHiem', 'tenNhaCungCap']}
              >
                <Input placeholder="Tên nhà cung cấp" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Số thẻ"
                name={['baoHiem', 'soThe']}
              >
                <Input placeholder="Số thẻ" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Ngày bắt đầu"
                name={['baoHiem', 'ngayBatDau']}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày bắt đầu" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Ngày kết thúc (Hạn dùng)"
                name={['baoHiem', 'ngayKetThuc']}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày kết thúc" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Mức hưởng theo thẻ BHYT (%)"
                name={['baoHiem', 'mucHuong']}
                tooltip="Mức hưởng được in trên thẻ BHYT (ví dụ: 80%, 95%, 100%). Hệ thống sẽ tự động trừ viện phí theo mức này."
              >
                <Input type="number" min={0} max={100} placeholder="Nhập mức hưởng theo thẻ (VD: 80, 95, 100)" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      ))}

      <Button
        type="dashed"
        onClick={addInsurance}
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
      >
        Thêm bảo hiểm
      </Button>
    </>
  );
};