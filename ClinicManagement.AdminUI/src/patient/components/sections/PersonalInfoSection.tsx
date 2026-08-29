import { Form, Input, DatePicker, Select, Row, Col } from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

export const PersonalInfoSection = () => {
  return (
    <Row gutter={[16, 0]}>
      <Col xs={24} md={12}>
        <Form.Item
          name="ho"
          label="Họ"
          rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Nhập họ" />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name="ten"
          label="Tên"
          rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Nhập tên" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="ngaySinh"
          label="Ngày sinh"
          rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            placeholder="Chọn ngày sinh"
            format="DD/MM/YYYY"
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name="gioiTinh"
          label="Giới tính"
          rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
        >
          <Select placeholder="Chọn giới tính">
            <Option value={1}>Nam</Option>
            <Option value={2}>Nữ</Option>
            <Option value={3}>Khác</Option>
          </Select>
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="dienThoai"
          label="Số điện thoại"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại' },
            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' },
          ]}
        >
          <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
        >
          <Input prefix={<MailOutlined />} placeholder="Nhập email (không bắt buộc)" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="soCCCD"
          label="Số CCCD"
          rules={[
            { pattern: /^[0-9]{9,12}$/, message: 'Số CCCD không hợp lệ' },
          ]}
        >
          <Input prefix={<IdcardOutlined />} placeholder="Nhập số CCCD (không bắt buộc)" />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item name="diaChi" label="Địa chỉ">
          <Input prefix={<HomeOutlined />} placeholder="Nhập địa chỉ (không bắt buộc)" />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item name="nguoiLienHeTen" label="Tên người liên hệ">
          <Input prefix={<UserOutlined />} placeholder="Tên người liên hệ (không bắt buộc)" />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name="nguoiLienHeDienThoai"
          label="SĐT người liên hệ"
          rules={[
            {
              pattern: /^[0-9]{10,11}$/,
              message: 'Số điện thoại không hợp lệ',
            },
          ]}
        >
          <Input prefix={<PhoneOutlined />} placeholder="SĐT liên hệ (không bắt buộc)" />
        </Form.Item>
      </Col>
    </Row>
  );
};