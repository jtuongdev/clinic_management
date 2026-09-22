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

const addPatientStyles = `
.add-patient-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.add-patient-card .ant-card-head {
  border-bottom: 1px solid #f1f5f9;
  padding: 12px 20px;
}
.add-patient-card .ant-card-head-title {
  font-weight: 600;
  font-size: 16px;
  color: #0f172a;
}
.add-patient-card .ant-form-item-label > label {
  font-weight: 500;
  color: #475569;
}
.add-patient-card .ant-input,
.add-patient-card .ant-select-selector,
.add-patient-card .ant-picker {
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}
.add-patient-card .ant-input:focus,
.add-patient-card .ant-input:hover,
.add-patient-card .ant-select-selector:focus,
.add-patient-card .ant-picker:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.add-patient-card .ant-btn-primary {
  background: #0f172a;
  border-color: #0f172a;
}
.add-patient-card .ant-btn-primary:hover {
  background: #1e293b;
  border-color: #1e293b;
}
.add-patient-card .ant-btn {
  border-radius: 6px;
  font-weight: 500;
}
@media (max-width: 640px) {
  .add-patient-card .ant-card-body {
    padding: 12px;
  }
}
`;

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

  // Hook lấy bác sĩ theo maKhoa và maCoSo
  const { bacSis, loading: loadingBacSi } = useBacSiOptions(selectedKhoa, selectedCoSo);

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
    form.setFieldsValue({ maKhoa: undefined, maBacSi: undefined, maPhongKham: undefined });
    setSelectedKhoa(undefined);
  };

  // Xử lý khi chọn khoa
  const handleKhoaChange = (value: number) => {
    setSelectedKhoa(value);
    form.setFieldsValue({ maBacSi: undefined, maPhongKham: undefined });
  };

  return (
    <>
      <style>{addPatientStyles}</style>
      <Card
        title="Thêm bệnh nhân mới"
        className="add-patient-card"
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
    </>
  );
};