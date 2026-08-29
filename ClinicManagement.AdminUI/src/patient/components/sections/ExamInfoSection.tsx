import { Form, Select, Space } from 'antd';
import { usePhongKhamOptions } from '../../../clinic/hook/usePhongKhamOptions';

const { Option } = Select;

interface ExamInfoSectionProps {
  coSos: any[];
  khoas: any[];
  bacSis: any[];
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
        name="maPhongKham"
        label="Phòng khám"
        rules={[{ required: true, message: 'Vui lòng chọn phòng khám' }]}
      >
        <Select
          placeholder="Chọn phòng khám"
          loading={loadingPhongKham}
          disabled={!form.getFieldValue('maKhoa')}
        >
          {phongKhams.map((pk) => (
            <Option key={pk.id} value={pk.id}>
              {pk.ten} ({pk.ma})
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="maBacSi"
        label="Bác sĩ"
        rules={[{ required: true, message: 'Vui lòng chọn bác sĩ' }]}
      >
        <Select
          placeholder="Chọn bác sĩ"
          loading={loadingBacSi}
          disabled={!form.getFieldValue('maKhoa')}
        >
          {bacSis.map((bs) => (
            <Option key={bs.id} value={bs.id}>
              {bs.hoTen} ({bs.chuyenKhoa})
            </Option>
          ))}
        </Select>
      </Form.Item>
    </Space>
  );
};