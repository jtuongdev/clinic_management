import { Form, Select, Space, Tag } from 'antd';
import { usePhongKhamOptions } from '../../../clinic/hook/usePhongKhamOptions';
import type { BacSiDto } from '../../../employee/docter/type/docter.type';

const { Option } = Select;

interface ExamInfoSectionProps {
  coSos: any[];
  khoas: any[];
  bacSis: BacSiDto[];
  loadingCoSo: boolean;
  loadingKhoa: boolean;
  loadingBacSi: boolean;
  onCoSoChange: (value: number) => void;
  onKhoaChange: (value: number) => void;
  form: any;
}

export const ExamInfoSection = ({
  coSos,
  khoas,
  bacSis,
  loadingCoSo,
  loadingKhoa,
  loadingBacSi,
  onCoSoChange,
  onKhoaChange,
  form,
}: ExamInfoSectionProps) => {
  const maKhoa = Form.useWatch('maKhoa', form);
  const { phongKhams, loading: loadingPhongKham } = usePhongKhamOptions(maKhoa);

  const handleBacSiChange = (bacSiId: number) => {
    const selectedDoctor = bacSis.find((bs) => bs.id === bacSiId);
    if (selectedDoctor && selectedDoctor.maPhongKhamMacDinh) {
      // Auto-fill phòng khám của bác sĩ đang trực
      form.setFieldsValue({ maPhongKham: selectedDoctor.maPhongKhamMacDinh });
    }
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Form.Item
        name="maCoSo"
        label="Cơ sở"
        rules={[{ required: true, message: 'Vui lòng chọn cơ sở' }]}
      >
        <Select
          placeholder="Chọn cơ sở"
          loading={loadingCoSo}
          onChange={onCoSoChange}
        >
          {coSos.map((cs) => (
            <Option key={cs.id} value={cs.id}>
              {cs.ten}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="maKhoa"
        label="Khoa"
        rules={[{ required: true, message: 'Vui lòng chọn khoa' }]}
      >
        <Select
          placeholder="Chọn khoa"
          loading={loadingKhoa}
          onChange={onKhoaChange}
          disabled={!form.getFieldValue('maCoSo')}
        >
          {khoas.map((k) => (
            <Option key={k.id} value={k.id}>
              {k.ten}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="maBacSi"
        label="Bác sĩ khám"
        rules={[{ required: true, message: 'Vui lòng chọn bác sĩ khám' }]}
      >
        <Select
          placeholder="Chọn bác sĩ khám"
          loading={loadingBacSi}
          disabled={!maKhoa}
          onChange={handleBacSiChange}
          showSearch
          optionFilterProp="label"
        >
          {bacSis.map((bs) => (
            <Option 
              key={bs.id} 
              value={bs.id}
              label={`${bs.hoTen} ${bs.chuyenKhoa || ''}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <strong>{bs.hoTen}</strong> {bs.chuyenKhoa ? `(${bs.chuyenKhoa})` : ''}
                </span>
                {bs.dangTruc ? (
                  <Tag color="success" style={{ marginLeft: 8, fontSize: '11px', borderRadius: '4px' }}>
                    ● Đang trực
                  </Tag>
                ) : (
                  <Tag color="default" style={{ marginLeft: 8, fontSize: '11px', color: '#64748b', borderRadius: '4px' }}>
                    Ngoài ca trực
                  </Tag>
                )}
              </div>
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="maPhongKham"
        label="Phòng khám"
        rules={[{ required: true, message: 'Vui lòng chọn phòng khám' }]}
      >
        <Select
          placeholder="Chọn phòng khám"
          loading={loadingPhongKham}
          disabled={!maKhoa}
        >
          {phongKhams.map((pk) => (
            <Option key={pk.id} value={pk.id}>
              {pk.ten} ({pk.ma})
            </Option>
          ))}
        </Select>
      </Form.Item>
    </Space>
  );
};