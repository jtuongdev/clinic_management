import { useState } from 'react';
import { Form, Button, Card, Space, Divider, Row } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

import { useCoSoOptions } from '../../facility/hook/useCoSoOptions';
import { useKhoaOptions } from '../../department/hook/useKhoaOptions';
import { useBacSiOptions } from '../../employee/docter/hook/useBacSiOptions';
import { useInsuranceList } from '../hook/useInsuranceList';
import { useMedicalHistoryList } from '../hook/useMedicalHistoryList';
import { usePatientForm } from '../hook/usePatientForm';

import { PersonalInfoSection } from './sections/PersonalInfoSection';
import { ExamInfoSection } from './sections/ExamInfoSection';
import { InsuranceSection } from './sections/InsuranceSection';
import { MedicalHistorySection } from './sections/MedicalHistorySection';


interface AddPatientFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultCoSoId?: number;
}

export const AddPatientForm = ({
  onSuccess,
  onCancel,
  defaultCoSoId = 1,
}: AddPatientFormProps) => {
  // Hook lấy danh sách cơ sở
  const { coSos, loading: loadingCoSo } = useCoSoOptions(defaultCoSoId);

  // State chọn cơ sở (dùng để load khoa)
  const [selectedCoSo, setSelectedCoSo] = useState<number | undefined>(defaultCoSoId);

  // Hook lấy khoa theo maCoSo
  const { khoas, loading: loadingKhoa } = useKhoaOptions(selectedCoSo!);

  // State chọn khoa (dùng để load bác sĩ)
  const [selectedKhoa, setSelectedKhoa] = useState<number | undefined>(undefined);

  // Hook lấy bác sĩ theo maKhoa
  const { bacSis, loading: loadingBacSi } = useBacSiOptions(selectedKhoa!);

  // Hook quản lý danh sách bảo hiểm
  const { insuranceList, addInsurance, removeInsurance, resetInsuranceList } = useInsuranceList();

  // Hook quản lý danh sách tiền sử
  const { historyList, addHistory, removeHistory, resetHistoryList } = useMedicalHistoryList();

  // Hook form và submit
  const { form, loading, handleSubmit } = usePatientForm(defaultCoSoId, () => {
    resetInsuranceList();
    resetHistoryList();
    onSuccess?.();
  });

  // Xử lý khi chọn cơ sở
  const handleCoSoChange = (value: number) => {
    setSelectedCoSo(value);
    form.setFieldsValue({ maKhoa: undefined, maBacSi: undefined });
    setSelectedKhoa(undefined);
  };

  // Xử lý khi chọn khoa
  const handleKhoaChange = (value: number) => {
    setSelectedKhoa(value);
    form.setFieldsValue({ maBacSi: undefined });
  };

  return (
    <Card
      title="Thêm bệnh nhân mới"
      style={{
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        border: '1px solid #e2e8f0',
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          gioiTinh: 1,
          maCoSo: defaultCoSoId,
          maKhoa: undefined,
          maBacSi: undefined,
          baoHiem: insuranceList[0],
          tienSuList: historyList,
        }}
      >
        {/* Thông tin cá nhân */}
        <PersonalInfoSection />

        <Divider>Thông tin khám đầu tiên</Divider>

        {/* Chọn cơ sở, khoa, bác sĩ */}
        <ExamInfoSection
          coSos={coSos}
          khoas={khoas}
          bacSis={bacSis}
          loadingCoSo={loadingCoSo}
          loadingKhoa={loadingKhoa}
          loadingBacSi={loadingBacSi}
          onCoSoChange={handleCoSoChange}
          onKhoaChange={handleKhoaChange}
          form={form}
        />

        <Divider />

        {/* Bảo hiểm */}
        <InsuranceSection
          insuranceList={insuranceList}
          addInsurance={addInsurance}
          removeInsurance={removeInsurance}
        />

        <Divider />

        {/* Tiền sử */}
        <MedicalHistorySection
          historyList={historyList}
          addHistory={addHistory}
          removeHistory={removeHistory}
        />

        <Row justify="end" style={{ marginTop: 16 }}>   
        <Space>
            {onCancel && <Button onClick={onCancel}>Hủy</Button>}
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
              style={{
                background: '#0f172a',
                borderColor: '#0f172a',
              }}
            >
              Lưu bệnh nhân
            </Button>
          </Space>
        </Row>
      </Form>
    </Card>
  );
};