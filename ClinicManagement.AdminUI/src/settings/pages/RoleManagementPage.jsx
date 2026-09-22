import React, { useState, useEffect } from 'react';
import { Shield, Plus, Check, X, Edit, Trash2, Building, Layers, DoorOpen, RefreshCw } from 'lucide-react';
import { settingsApi } from '../api/settings.api';

const MODULES = [
  { id: 'patient', name: 'Quản lý Bệnh nhân' },
  { id: 'examination', name: 'Khám bệnh & EMR' },
  { id: 'cls', name: 'Cận lâm sàng (LIS/PACS)' },
  { id: 'inventory', name: 'Kho Dược & Vật tư' },
  { id: 'billing', name: 'Viện phí & Hóa đơn' },
  { id: 'employee', name: 'Nhân sự & Lương' },
  { id: 'settings', name: 'Cấu hình Hệ thống' },
];

const ACTIONS = [
  { id: 'view', name: 'Xem' },
  { id: 'create', name: 'Tạo mới' },
  { id: 'edit', name: 'Chỉnh sửa' },
  { id: 'delete', name: 'Xóa' },
  { id: 'approve', name: 'Duyệt / Ký' },
];

const EMPTY_ROLE = {
  id: 0,
  code: '',
  name: 'Chưa có dữ liệu vai trò',
  description: '',
  dataScope: '',
  permissions: {},
};

export const RoleManagementPage = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(EMPTY_ROLE);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoleForm, setCurrentRoleForm] = useState(EMPTY_ROLE);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Tích hợp API Backend: GET /api/admin/roles
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await settingsApi.getRoles();
      const loadedRoles = res.data?.success && Array.isArray(res.data.data) ? res.data.data : [];
      setRoles(loadedRoles);
      setSelectedRole(loadedRoles[0] || EMPTY_ROLE);
      setCurrentRoleForm(loadedRoles[0] || EMPTY_ROLE);
    } catch {
      setRoles([]);
      setSelectedRole(EMPTY_ROLE);
      setCurrentRoleForm(EMPTY_ROLE);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setCurrentRoleForm(role);
    setIsEditing(false);
  };

  const handleTogglePermission = (moduleId, actionId) => {
    if (!isEditing) return;

    setCurrentRoleForm(prev => {
      const currentModulePerms = prev.permissions[moduleId] || [];
      const hasPerm = currentModulePerms.includes(actionId);
      const updatedModulePerms = hasPerm
        ? currentModulePerms.filter(a => a !== actionId)
        : [...currentModulePerms, actionId];

      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [moduleId]: updatedModulePerms,
        },
      };
    });
  };

  // Tích hợp API Backend: POST /api/admin/roles
  const handleSaveRole = async () => {
    setSaving(true);
    try {
      await settingsApi.updateRole(currentRoleForm);
      setRoles(prev => prev.map(r => r.id === currentRoleForm.id ? currentRoleForm : r));
      setSelectedRole(currentRoleForm);
      setIsEditing(false);
      alert('Đã cập nhật ma trận phân quyền và DataScope thành công lên máy chủ!');
    } catch {
      alert('Không thể cập nhật ma trận phân quyền trên máy chủ. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewRole = () => {
    const newId = Date.now();
    const newRole = {
      id: newId,
      code: `ROLE_${newId.toString().slice(-4)}`,
      name: 'Vai trò mới',
      description: 'Mô tả vai trò',
      dataScope: 'FACILITY_ONLY',
      permissions: {},
    };
    setRoles(prev => [...prev, newRole]);
    setSelectedRole(newRole);
    setCurrentRoleForm(newRole);
    setIsEditing(true);
  };

  return (
    <div style={{ padding: '16px', background: '#f8fafc', minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={24} color="#0284c7" /> Quản trị Vai trò & Phân quyền Dữ liệu (Granular RBAC)
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Kiểm soát quyền truy cập chi tiết theo chức năng và phạm vi dữ liệu (Toàn viện / Cơ sở / Khoa phòng)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={fetchRoles}
            disabled={loading}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '6px', 
              background: '#fff', color: '#475569', border: '1px solid #cbd5e1', 
              padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 
            }}
          >
            <RefreshCw size={14} className={loading ? 'fa-spin' : ''} /> Làm mới
          </button>
          <button 
            onClick={handleCreateNewRole}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '6px', 
              background: '#0284c7', color: '#fff', border: 'none', 
              padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 
            }}
          >
            <Plus size={16} /> Thêm vai trò mới
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
        {/* Danh sách vai trò bên trái */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#334155', marginBottom: '12px' }}>
            Danh sách Vai trò ({roles.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {roles.map(role => (
              <div 
                key={role.id}
                onClick={() => handleSelectRole(role)}
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  border: `1px solid ${selectedRole.id === role.id ? '#0284c7' : '#e2e8f0'}`,
                  background: selectedRole.id === role.id ? '#f0f9ff' : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '14px', color: '#0f172a' }}>{role.name}</strong>
                  <span style={{ fontSize: '11px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', color: '#475569' }}>
                    {role.code}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', marginBottom: '8px' }}>
                  {role.description}
                </p>
                <div style={{ fontSize: '11px', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Building size={12} />
                  Phạm vi: {role.dataScope === 'ALL_FACILITIES' ? 'Toàn bộ cơ sở' : role.dataScope === 'FACILITY_ONLY' ? 'Tại cơ sở trực thuộc' : 'Chỉ tại Khoa phòng'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ma trận phân quyền bên phải */}
        <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
                {isEditing ? 'Chỉnh sửa Phân quyền' : selectedRole.name}
              </h2>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Mã hệ thống: <code>{selectedRole.code}</code></span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1',
                    padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
                  }}
                >
                  <Edit size={14} /> Chỉnh sửa quyền
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { setIsEditing(false); setCurrentRoleForm(selectedRole); }}
                    style={{
                      background: '#fff', color: '#64748b', border: '1px solid #cbd5e1',
                      padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveRole}
                    disabled={saving}
                    style={{
                      background: '#16a34a', color: '#fff', border: 'none',
                      padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500
                    }}
                  >
                    {saving ? 'Đang lưu...' : 'Lưu phân quyền'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Cấu hình Phạm vi dữ liệu (Data Scope Selector) */}
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Phạm vi truy cập Dữ liệu Y tế (Granular Data Scope):
            </label>
            <div style={{ display: 'flex', gap: '20px' }}>
              {[
                { key: 'ALL_FACILITIES', label: 'Toàn viện / Tất cả Cơ sở', icon: Building },
                { key: 'FACILITY_ONLY', label: 'Cơ sở trực thuộc', icon: Layers },
                { key: 'DEPARTMENT_ONLY', label: 'Khoa / Buồng phòng được phân công', icon: DoorOpen },
              ].map(scope => {
                const Icon = scope.icon;
                return (
                  <label key={scope.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: isEditing ? 'pointer' : 'default' }}>
                    <input 
                      type="radio" 
                      name="dataScope" 
                      disabled={!isEditing}
                      checked={currentRoleForm.dataScope === scope.key}
                      onChange={() => setCurrentRoleForm(p => ({ ...p, dataScope: scope.key }))}
                    />
                    <Icon size={14} color="#64748b" />
                    <span>{scope.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Ma trận Checkbox */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '10px 14px', color: '#475569' }}>Phân hệ / Module</th>
                  {ACTIONS.map(act => (
                    <th key={act.id} style={{ textAlign: 'center', padding: '10px', color: '#475569' }}>
                      {act.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map(mod => {
                  const perms = (isEditing ? currentRoleForm.permissions : selectedRole.permissions)[mod.id] || [];
                  return (
                    <tr key={mod.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 500, color: '#1e293b' }}>
                        {mod.name}
                      </td>
                      {ACTIONS.map(act => {
                        const isChecked = perms.includes(act.id);
                        return (
                          <td key={act.id} style={{ textAlign: 'center', padding: '10px' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={!isEditing}
                              onChange={() => handleTogglePermission(mod.id, act.id)}
                              style={{ cursor: isEditing ? 'pointer' : 'default', width: '16px', height: '16px' }}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagementPage;
