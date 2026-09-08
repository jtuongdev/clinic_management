import React, { useState, useEffect, useCallback } from 'react';
import { App, Table, Card, Button, Input, Space, Tag, Modal, Form, Select } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, RetweetOutlined } from '@ant-design/icons';
import { inventoryApi } from '../api/inventory.api';
import { SupplierDto, SupplierRequest } from '../types/inventory.types';
import type { ColumnsType } from 'antd/es/table';

export const SupplierPage: React.FC = () => {
  const { message } = App.useApp();
  const [data, setData] = useState<SupplierDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<1 | 2 | undefined>(undefined);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<SupplierDto | null>(null);
  const [form] = Form.useForm<SupplierRequest>();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await inventoryApi.getSuppliers({
        keyword: keyword || undefined,
        status,
        pageIndex: pagination.current,
        pageSize: pagination.pageSize,
      });
      if (res.data?.success && res.data.data) {
        setData(res.data.data.items ?? []);
        setTotal(res.data.data.total ?? 0);
      }
    } catch (error) {
      message.error('Lỗi khi tải danh sách nhà cung cấp');
    } finally {
      setLoading(false);
    }
  }, [keyword, status, pagination.current, pagination.pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTableChange = (newPagination: { current?: number; pageSize?: number }) => {
    setPagination({
      current: newPagination.current ?? 1,
      pageSize: newPagination.pageSize ?? 20,
    });
  };

  const showModal = (item?: SupplierDto) => {
    setEditingItem(item || null);
    if (item) {
      form.setFieldsValue({
        ma: item.ma,
        ten: item.ten,
        diaChi: item.diaChi,
        dienThoai: item.dienThoai,
        email: item.email,
        maSoThue: item.maSoThue,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await inventoryApi.updateSupplier(editingItem.id, values);
        message.success('Cập nhật nhà cung cấp thành công');
      } else {
        await inventoryApi.createSupplier(values);
        message.success('Thêm nhà cung cấp thành công');
      }
      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      console.error(error);
      message.error('Có lỗi xảy ra khi lưu nhà cung cấp');
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await inventoryApi.toggleSupplierStatus(id);
      message.success('Đã thay đổi trạng thái nhà cung cấp');
      fetchData();
    } catch (error) {
      message.error('Có lỗi xảy ra');
    }
  };

  const columns: ColumnsType<SupplierDto> = [
    { title: 'Mã', dataIndex: 'ma', key: 'ma' },
    { title: 'Tên nhà cung cấp', dataIndex: 'ten', key: 'ten' },
    { title: 'Điện thoại', dataIndex: 'dienThoai', key: 'dienThoai' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'MST', dataIndex: 'maSoThue', key: 'maSoThue' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'trangThai', 
      key: 'trangThai',
      render: (val) => val === 1 || val === 'HoatDong'
        ? <Tag color="green">Hoạt động</Tag>
        : <Tag color="red">Ngừng hợp tác</Tag>
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space separator={null}>
          <Button type="text" icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Button type="text" icon={<RetweetOutlined />} onClick={() => handleToggleStatus(record.id)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="supplier-page h-full flex flex-col">
      <Card
        title="Danh sách nhà cung cấp"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>Thêm mới</Button>}
        className="flex-1 shadow-sm rounded-lg"
      >
        <Space className="mb-4" separator={null}>
          <Input 
            placeholder="Tìm theo mã, tên..." 
            prefix={<SearchOutlined />} 
            allowClear 
            onPressEnter={(e) => {
              setPagination((current) => ({ ...current, current: 1 }));
              setKeyword(e.currentTarget.value);
            }}
            style={{ width: 300 }}
          />
          <Select 
            placeholder="Trạng thái"
            allowClear
            onChange={setStatus}
            style={{ width: 150 }}
            options={[
              { value: 1, label: 'Hoạt động' },
              { value: 2, label: 'Ngừng hợp tác' },
            ]}
          />
          <Button type="primary" onClick={() => {
            setPagination((current) => ({ ...current, current: 1 }));
            void fetchData();
          }}>Tìm kiếm</Button>
        </Space>

        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id" 
          loading={loading}
          pagination={{ ...pagination, total, showSizeChanger: true }}
          onChange={handleTableChange}
          scroll={{ y: 500 }}
        />
      </Card>

      <Modal
        title={editingItem ? 'Sửa nhà cung cấp' : 'Thêm mới nhà cung cấp'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="ma" label="Mã NCC" rules={[{ required: true, message: 'Vui lòng nhập mã' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="ten" label="Tên NCC" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="dienThoai" label="Điện thoại">
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input type="email" />
            </Form.Item>
            <Form.Item name="maSoThue" label="Mã số thuế">
              <Input />
            </Form.Item>
            <Form.Item name="diaChi" label="Địa chỉ" className="col-span-2">
              <Input.TextArea rows={2} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
