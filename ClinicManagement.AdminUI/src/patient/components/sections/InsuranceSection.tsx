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
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item
                label="Ngày kết thúc"
                name={['baoHiem', 'ngayKetThuc']}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Mức hưởng (%)"
                name={['baoHiem', 'mucHuong']}
              >
                <Input type="number" min={0} max={100} />
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