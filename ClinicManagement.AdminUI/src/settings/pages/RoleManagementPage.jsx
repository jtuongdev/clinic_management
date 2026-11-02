import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield, Plus, Check, X, Edit, Trash2, Building, Layers, DoorOpen,
  RefreshCw, AlertTriangle, Search, Grid, Users, Stethoscope, Package,
  Receipt, BarChart3, Settings2, FileText
} from 'lucide-react';
import { settingsApi } from '../api/settings.api';

// Danh mục 10 Phân hệ chức năng chính của hệ thống y tế
const MODULES = [
  { id: 'patient', name: 'Quản lý Bệnh nhân', icon: Users, desc: 'Tiếp nhận, hồ sơ hành chính, mã BN, tiền sử bệnh' },
  { id: 'appointment', name: 'Lịch hẹn khám', icon: FileText, desc: 'Đặt lịch hẹn, phân luồng tiếp nhận và nhắc lịch' },
  { id: 'examination', name: 'Khám bệnh & EMR', icon: Stethoscope, desc: 'Khám lâm sàng, chẩn đoán ICD, bệnh án điện tử, kê đơn' },
  { id: 'cls', name: 'Cận lâm sàng (LIS/PACS)', icon: Layers, desc: 'Chỉ định và kết quả xét nghiệm, CĐHA' },
  { id: 'inventory', name: 'Kho Dược & Vật tư', icon: Package, desc: 'Nhập xuất tồn, cấp phát lẻ, cấp khoa phòng, kiểm kê' },
  { id: 'billing', name: 'Viện phí & Hóa đơn', icon: Receipt, desc: 'Lập hóa đơn, thanh toán, phiếu thu chi, sổ quỹ' },
  { id: 'finance', name: 'Báo cáo Tài chính', icon: BarChart3, desc: 'Doanh thu, công nợ, chi phí, dòng tiền thực thu' },
  { id: 'hr', name: 'Nhân sự & Lương', icon: Users, desc: 'Hồ sơ nhân viên, bảng lương, chấm công, ca trực' },
  { id: 'audit', name: 'Nhật ký kiểm toán', icon: Shield, desc: 'Lịch sử truy cập EMR, an toàn dữ liệu' },
  { id: 'settings', name: 'Cấu hình Hệ thống', icon: Settings2, desc: 'Quản trị vai trò, phân quyền, tích hợp hệ thống' },
];

const ACTIONS = [
  { id: 'XEM', name: 'Xem', short: 'X', color: '#0284c7', bg: '#e0f2fe' },
  { id: 'TAO', name: 'Tạo mới', short: 'T', color: '#16a34a', bg: '#dcfce7' },
  { id: 'SUA', name: 'Chỉnh sửa', short: 'S', color: '#d97706', bg: '#fef3c7' },
  { id: 'XOA', name: 'Xóa', short: 'Xóa', color: '#dc2626', bg: '#fee2e2' },
  { id: 'DUYET', name: 'Duyệt / Ký', short: 'D', color: '#7c3aed', bg: '#ede9fe' },
];

const DATA_SCOPES = [
  { key: 'TOAN_HE_THONG', label: 'Toàn viện / Tất cả Cơ sở', icon: Building },
  { key: 'CO_SO', label: 'Cơ sở trực thuộc', icon: Layers },
  { key: 'KHOA_PHONG', label: 'Khoa / Buồng phòng được phân công', icon: DoorOpen },
];

const EMPTY_ROLE = {
  id: 0,
  code: '',
  name: 'Chưa có dữ liệu vai trò',
  description: '',
  dataScope: 'TOAN_HE_THONG',
  permissions: {},
};

// Chuẩn hóa dữ liệu trả về từ backend API sang form UI
const normalizeRole = (r) => {
  if (!r) return EMPTY_ROLE;

  const rawPerms = r.phanQuyen || r.permissions || {};
  const normalizedPerms = {};

  const actionMap = {
    view: 'XEM',
    create: 'TAO',
    edit: 'SUA',
    delete: 'XOA',
    approve: 'DUYET',
  };

  Object.entries(rawPerms).forEach(([modKey, actionList]) => {
    let k = modKey.toLowerCase();
    if (k === 'employee') k = 'hr';
    if (Array.isArray(actionList)) {
      normalizedPerms[k] = actionList.map(a => {
        const str = String(a).trim();
        return actionMap[str.toLowerCase()] || str.toUpperCase();
      });
    }
  });

  let scope = r.phamViDuLieu || r.dataScope || 'CO_SO';
  if (scope === 'ALL_FACILITIES') scope = 'TOAN_HE_THONG';
  else if (scope === 'FACILITY_ONLY') scope = 'CO_SO';
  else if (scope === 'DEPARTMENT_ONLY') scope = 'KHOA_PHONG';

  return {
    id: r.id,
    code: r.maCode || r.code || '',
    name: r.ten || r.name || 'Vai trò',
    description: r.moTa || r.description || '',
    dataScope: scope,
    permissions: normalizedPerms,
  };
};

export const RoleManagementPage = () => {
  // ─── TAB ĐIỀU HƯỚNG CHÍNH: 'ROLE_BASED' | 'FEATURE_MATRIX' ───
  const [activeMainTab, setActiveMainTab] = useState('ROLE_BASED');

  // ─── DỮ LIỆU CHUNG TỪ SERVER ───
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // ─── STATE TAB 1: PHÂN QUYỀN THEO VAI TRÒ ───
  const [selectedRole, setSelectedRole] = useState(EMPTY_ROLE);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [currentRoleForm, setCurrentRoleForm] = useState(EMPTY_ROLE);
  const [savingRole, setSavingRole] = useState(false);

  // Modal tạo vai trò mới
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creatingRole, setCreatingRole] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({
    name: '',
    code: '',
    description: '',
    dataScope: 'CO_SO',
  });

  // ─── STATE TAB 2: MA TRẬN THEO CHỨC NĂNG ───
  const [matrixViewMode, setMatrixViewMode] = useState('INSPECTOR');
  const [selectedModuleId, setSelectedModuleId] = useState('examination');
  const [featureSearchQuery, setFeatureSearchQuery] = useState('');
  const [savingFeature, setSavingFeature] = useState(false);

  const [featureRolePerms, setFeatureRolePerms] = useState({});
  const [isEditingFeature, setIsEditingFeature] = useState(false);

  // Tải danh sách vai trò từ backend API
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await settingsApi.getRoles();
      const loadedRoles = res.data?.success && Array.isArray(res.data.data) ? res.data.data.map(normalizeRole) : [];
      setRoles(loadedRoles);
      
      setSelectedRole(prev => {
        const found = loadedRoles.find(r => r.id === prev.id);
        return found || loadedRoles[0] || EMPTY_ROLE;
      });
      setCurrentRoleForm(prev => {
        const found = loadedRoles.find(r => r.id === prev.id);
        return found || loadedRoles[0] || EMPTY_ROLE;
      });
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

  // Đồng bộ quyền của module đang chọn sang `featureRolePerms` khi đổi module hoặc roles
  useEffect(() => {
    const initialPerms = {};
    roles.forEach(role => {
      initialPerms[role.id] = [...(role.permissions[selectedModuleId] || [])];
    });
    setFeatureRolePerms(initialPerms);
    setIsEditingFeature(false);
  }, [selectedModuleId, roles]);

  // ─────────────────────────────────────────────────────────────
  // 1. CÁC HÀM XỬ LÝ CHO TAB 1: PHÂN QUYỀN THEO VAI TRÒ
  // ─────────────────────────────────────────────────────────────

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setCurrentRoleForm(role);
    setIsEditingRole(false);
  };

  const handleToggleRolePermission = (moduleId, actionId) => {
    if (!isEditingRole) return;

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

  const handleSaveRole = async () => {
    setSavingRole(true);
    try {
      const payload = {
        id: currentRoleForm.id,
        maCode: currentRoleForm.code,
        ten: currentRoleForm.name,
        moTa: currentRoleForm.description,
        phamViDuLieu: currentRoleForm.dataScope,
        phanQuyen: currentRoleForm.permissions,
      };
      await settingsApi.updateRole(payload);
      setRoles(prev => prev.map(r => r.id === currentRoleForm.id ? currentRoleForm : r));
      setSelectedRole(currentRoleForm);
      setIsEditingRole(false);
      alert('Đã cập nhật ma trận phân quyền và DataScope thành công lên máy chủ!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể cập nhật ma trận phân quyền trên máy chủ. Vui lòng thử lại.';
      alert(msg);
    } finally {
      setSavingRole(false);
    }
  };

  const handleOpenCreateModal = () => {
    setNewRoleForm({
      name: '',
      code: '',
      description: '',
      dataScope: 'CO_SO',
    });
    setIsCreateModalOpen(true);
  };

  const handleNameChange = (nameVal) => {
    const slug = nameVal
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_');

    setNewRoleForm(prev => ({
      ...prev,
      name: nameVal,
      code: prev.code === '' || prev.code === prev.name.toUpperCase().replace(/[^A-Z0-9]/g, '_') ? slug : prev.code
    }));
  };

  const handleCreateRoleSubmit = async (e) => {
    e.preventDefault();
    if (!newRoleForm.name.trim()) {
      alert('Vui lòng nhập tên vai trò.');
      return;
    }

    setCreatingRole(true);
    try {
      const payload = {
        ten: newRoleForm.name.trim(),
        maCode: newRoleForm.code.trim() || undefined,
        moTa: newRoleForm.description.trim(),
        phamViDuLieu: newRoleForm.dataScope,
        phanQuyen: {},
      };

      const res = await settingsApi.createRole(payload);
      if (res.data?.success && res.data.data) {
        const createdRole = normalizeRole(res.data.data);
        setRoles(prev => [...prev, createdRole]);
        setSelectedRole(createdRole);
        setCurrentRoleForm(createdRole);
        setIsCreateModalOpen(false);
        setIsEditingRole(true);
        alert(`Tạo vai trò "${createdRole.name}" thành công! Bây giờ bạn có thể tick chọn quyền trong ma trận bên dưới và bấm Lưu.`);
      } else {
        await fetchRoles();
        setIsCreateModalOpen(false);
        alert('Tạo vai trò thành công!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể tạo mới vai trò trên hệ thống. Vui lòng kiểm tra lại.';
      alert(msg);
    } finally {
      setCreatingRole(false);
    }
  };

  const handleDeleteRole = async (roleToDelete) => {
    if (!roleToDelete || !roleToDelete.id) return;

    const codeUpper = (roleToDelete.code || '').toUpperCase();
    if (codeUpper === 'ADMIN' || codeUpper.includes('ADMIN') || codeUpper === 'QUAN_TRI_VIEN') {
      alert('Không được phép xóa vai trò Quản trị viên hệ thống.');
      return;
    }

    const confirmMsg = `Bạn có chắc chắn muốn xóa hẳn vai trò "${roleToDelete.name}" (${roleToDelete.code}) khỏi hệ thống?\n\nLưu ý: Thao tác này sẽ xóa toàn bộ ma trận quyền của vai trò. Vai trò chỉ được phép xóa khi không còn nhân viên nào đang được gán.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await settingsApi.deleteRole(roleToDelete.id);
      if (res.data?.success) {
        alert(res.data?.message || `Đã xóa vai trò "${roleToDelete.name}" thành công!`);
        const remaining = roles.filter(r => r.id !== roleToDelete.id);
        setRoles(remaining);
        if (selectedRole.id === roleToDelete.id) {
          const nextSelected = remaining[0] || EMPTY_ROLE;
          setSelectedRole(nextSelected);
          setCurrentRoleForm(nextSelected);
          setIsEditingRole(false);
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra khi xóa vai trò. Vui lòng kiểm tra lại.';
      alert(errorMsg);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 2. CÁC HÀM XỬ LÝ CHO TAB 2: MA TRẬN THEO CHỨC NĂNG
  // ─────────────────────────────────────────────────────────────

  const handleToggleFeatureAction = (roleId, actionId) => {
    if (!isEditingFeature) return;

    setFeatureRolePerms(prev => {
      const currentActions = prev[roleId] || [];
      const hasAction = currentActions.includes(actionId);
      const updated = hasAction
        ? currentActions.filter(a => a !== actionId)
        : [...currentActions, actionId];
      return {
        ...prev,
        [roleId]: updated,
      };
    });
  };

  const handleGrantAllForRoleInFeature = (roleId) => {
    if (!isEditingFeature) return;
    setFeatureRolePerms(prev => ({
      ...prev,
      [roleId]: ACTIONS.map(a => a.id),
    }));
  };

  const handleRevokeAllForRoleInFeature = (roleId) => {
    if (!isEditingFeature) return;
    setFeatureRolePerms(prev => ({
      ...prev,
      [roleId]: [],
    }));
  };

  const handleReadOnlyForRoleInFeature = (roleId) => {
    if (!isEditingFeature) return;
    setFeatureRolePerms(prev => ({
      ...prev,
      [roleId]: ['XEM'],
    }));
  };

  const handleSaveCurrentFeaturePermissions = async () => {
    setSavingFeature(true);
    try {
      await settingsApi.updateFeaturePermissions({
        featureId: selectedModuleId,
        rolePermissions: featureRolePerms,
      });

      setRoles(prevRoles => {
        return prevRoles.map(r => {
          const newActions = featureRolePerms[r.id] || [];
          return {
            ...r,
            permissions: {
              ...r.permissions,
              [selectedModuleId]: newActions,
            },
          };
        });
      });

      setIsEditingFeature(false);
      alert(`Đã cập nhật phân quyền chức năng "${currentSelectedModule?.name}" thành công!`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu phân quyền chức năng.';
      alert(msg);
    } finally {
      setSavingFeature(false);
    }
  };

  const filteredModules = useMemo(() => {
    if (!featureSearchQuery.trim()) return MODULES;
    const q = featureSearchQuery.toLowerCase();
    return MODULES.filter(m => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q));
  }, [featureSearchQuery]);

  const currentSelectedModule = MODULES.find(m => m.id === selectedModuleId) || MODULES[0];

  const getScopeLabel = (scopeKey) => {
    const found = DATA_SCOPES.find(s => s.key === scopeKey);
    return found ? found.label : (scopeKey === 'ALL_FACILITIES' ? 'Toàn bộ cơ sở' : 'Tại cơ sở trực thuộc');
  };

  const isSelectedSystemRole = (selectedRole.code || '').toUpperCase() === 'ADMIN' || (selectedRole.code || '').toUpperCase().includes('ADMIN');

  return (
    <div style={{ padding: '16px', background: '#f8fafc', minHeight: '100%', boxSizing: 'border-box' }}>
      {/* ─── HEADER & CHUYỂN ĐỔI TAB CHÍNH ─── */}
      <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ minWidth: 0, flex: '1 1 300px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, wordBreak: 'break-word' }}>
              <Shield size={22} color="#0284c7" style={{ flexShrink: 0 }} /> Quản trị Phân quyền & Vai trò Hệ thống (Granular RBAC)
            </h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0', wordBreak: 'break-word' }}>
              Kiểm soát quyền truy cập 2 chiều: theo <strong>Vai trò nhân sự</strong> hoặc theo từng <strong>Chức năng nghiệp vụ</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button 
              onClick={fetchRoles}
              disabled={loading}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', 
                background: '#fff', color: '#475569', border: '1px solid #cbd5e1', 
                padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap'
              }}
            >
              <RefreshCw size={14} className={loading ? 'fa-spin' : ''} /> Làm mới
            </button>
            <button 
              onClick={handleOpenCreateModal}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '6px', 
                background: '#0284c7', color: '#fff', border: 'none', 
                padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap'
              }}
            >
              <Plus size={16} /> Thêm vai trò mới
            </button>
          </div>
        </div>

        {/* Tab Switcher 2 Chiều */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveMainTab('ROLE_BASED')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: activeMainTab === 'ROLE_BASED' ? '#0284c7' : '#f1f5f9',
              color: activeMainTab === 'ROLE_BASED' ? '#fff' : '#475569',
              fontWeight: 600, fontSize: '13px', cursor: 'pointer',
              transition: 'all 0.15s ease', whiteSpace: 'nowrap'
            }}
          >
            <Shield size={16} /> Phân quyền theo Vai trò (Role-Centric)
          </button>
          <button
            onClick={() => setActiveMainTab('FEATURE_MATRIX')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: activeMainTab === 'FEATURE_MATRIX' ? '#0284c7' : '#f1f5f9',
              color: activeMainTab === 'FEATURE_MATRIX' ? '#fff' : '#475569',
              fontWeight: 600, fontSize: '13px', cursor: 'pointer',
              transition: 'all 0.15s ease', whiteSpace: 'nowrap'
            }}
          >
            <Grid size={16} /> Ma trận theo Chức năng (Feature Matrix)
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: PHÂN QUYỀN THEO VAI TRÒ (ROLE-BASED) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeMainTab === 'ROLE_BASED' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>
          {/* Cột trái: Danh sách Vai trò */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px', minWidth: 0 }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#334155', marginBottom: '12px' }}>
              Danh sách Vai trò ({roles.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {roles.map(role => {
                const isSelected = selectedRole.id === role.id;
                const isSys = (role.code || '').toUpperCase() === 'ADMIN' || (role.code || '').toUpperCase().includes('ADMIN');

                return (
                  <div 
                    key={role.id}
                    onClick={() => handleSelectRole(role)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: `1px solid ${isSelected ? '#0284c7' : '#e2e8f0'}`,
                      background: isSelected ? '#f0f9ff' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      minWidth: 0,
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <strong style={{ fontSize: '14px', color: '#0f172a', wordBreak: 'break-word', flex: 1, minWidth: 0 }}>
                        {role.name}
                      </strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                        <span style={{ 
                          fontSize: '11px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', 
                          color: '#475569', whiteSpace: 'nowrap', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' 
                        }} title={role.code}>
                          {role.code}
                        </span>
                        {!isSys && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRole(role);
                            }}
                            title="Xóa vai trò này"
                            style={{
                              background: 'none', border: 'none', color: '#ef4444',
                              cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', flexShrink: 0
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p style={{ 
                      fontSize: '12px', color: '#64748b', marginTop: '6px', marginBottom: '8px',
                      wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                    }}>
                      {role.description || 'Không có mô tả'}
                    </p>
                    <div style={{ fontSize: '11px', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px', wordBreak: 'break-word' }}>
                      <Building size={12} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Phạm vi: {getScopeLabel(role.dataScope)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cột phải: Ma trận phân quyền của vai trò đang chọn */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px', minWidth: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ minWidth: 0, flex: '1 1 240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: 0, wordBreak: 'break-word' }}>
                    {isEditingRole ? `Chỉnh sửa: ${selectedRole.name}` : selectedRole.name}
                  </h2>
                  {isSelectedSystemRole && (
                    <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      Vai trò hệ thống
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', wordBreak: 'break-word' }}>
                  Mã hệ thống: <code style={{ wordBreak: 'break-all' }}>{selectedRole.code}</code>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {!isEditingRole ? (
                  <>
                    <button
                      onClick={() => setIsEditingRole(true)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1',
                        padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap'
                      }}
                    >
                      <Edit size={14} /> Chỉnh sửa quyền
                    </button>
                    {!isSelectedSystemRole && selectedRole.id > 0 && (
                      <button
                        onClick={() => handleDeleteRole(selectedRole)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                          padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap'
                        }}
                      >
                        <Trash2 size={14} /> Xóa vai trò
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setIsEditingRole(false); setCurrentRoleForm(selectedRole); }}
                      style={{
                        background: '#fff', color: '#64748b', border: '1px solid #cbd5e1',
                        padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap'
                      }}
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSaveRole}
                      disabled={savingRole}
                      style={{
                        background: '#16a34a', color: '#fff', border: 'none',
                        padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap'
                      }}
                    >
                      {savingRole ? 'Đang lưu...' : 'Lưu phân quyền'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Phạm vi truy cập */}
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                Phạm vi truy cập Dữ liệu Y tế (Granular Data Scope):
              </label>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                {DATA_SCOPES.map(scope => {
                  const Icon = scope.icon;
                  return (
                    <label key={scope.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: isEditingRole ? 'pointer' : 'default', whiteSpace: 'nowrap' }}>
                      <input 
                        type="radio" 
                        name="dataScope" 
                        disabled={!isEditingRole}
                        checked={currentRoleForm.dataScope === scope.key}
                        onChange={() => setCurrentRoleForm(p => ({ ...p, dataScope: scope.key }))}
                      />
                      <Icon size={14} color="#64748b" style={{ flexShrink: 0 }} />
                      <span>{scope.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Bảng phân quyền */}
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '460px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '10px 14px', color: '#475569', minWidth: '180px' }}>Phân hệ / Module</th>
                    {ACTIONS.map(act => (
                      <th key={act.id} style={{ textAlign: 'center', padding: '10px', color: '#475569', whiteSpace: 'nowrap' }}>
                        {act.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map(mod => {
                    const perms = (isEditingRole ? currentRoleForm.permissions : selectedRole.permissions)[mod.id] || [];
                    const Icon = mod.icon;
                    return (
                      <tr key={mod.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 500, color: '#1e293b' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Icon size={16} color="#0284c7" style={{ flexShrink: 0 }} />
                            <span style={{ wordBreak: 'break-word' }}>{mod.name}</span>
                          </div>
                        </td>
                        {ACTIONS.map(act => {
                          const isChecked = perms.includes(act.id);
                          return (
                            <td key={act.id} style={{ textAlign: 'center', padding: '10px' }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={!isEditingRole}
                                onChange={() => handleToggleRolePermission(mod.id, act.id)}
                                style={{ cursor: isEditingRole ? 'pointer' : 'default', width: '16px', height: '16px' }}
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
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: MA TRẬN THEO CHỨC NĂNG (FEATURE MATRIX) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeMainTab === 'FEATURE_MATRIX' && (
        <div>
          {/* Sub Header điều khiển của Tab Chức năng */}
          <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '14px 18px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>Chế độ hiển thị:</span>
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', flexWrap: 'wrap', gap: '4px' }}>
                <button
                  onClick={() => setMatrixViewMode('INSPECTOR')}
                  style={{
                    padding: '6px 14px', borderRadius: '6px', border: 'none',
                    background: matrixViewMode === 'INSPECTOR' ? '#fff' : 'transparent',
                    color: matrixViewMode === 'INSPECTOR' ? '#0284c7' : '#64748b',
                    fontWeight: 600, fontSize: '12px', cursor: 'pointer',
                    boxShadow: matrixViewMode === 'INSPECTOR' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Chi tiết từng Chức năng (Inspector)
                </button>
                <button
                  onClick={() => setMatrixViewMode('GLOBAL_GRID')}
                  style={{
                    padding: '6px 14px', borderRadius: '6px', border: 'none',
                    background: matrixViewMode === 'GLOBAL_GRID' ? '#fff' : 'transparent',
                    color: matrixViewMode === 'GLOBAL_GRID' ? '#0284c7' : '#64748b',
                    fontWeight: 600, fontSize: '12px', cursor: 'pointer',
                    boxShadow: matrixViewMode === 'GLOBAL_GRID' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Lưới Ma trận Toàn cảnh (Global Grid)
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Tìm chức năng..."
                  value={featureSearchQuery}
                  onChange={(e) => setFeatureSearchQuery(e.target.value)}
                  style={{
                    padding: '6px 12px 6px 30px', fontSize: '12px',
                    borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', width: '180px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* ─── CHẾ ĐỘ 1: INSPECTOR - CHI TIẾT TỪNG CHỨC NĂNG ─── */}
          {matrixViewMode === 'INSPECTOR' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 320px) minmax(0, 1fr)', gap: '20px', alignItems: 'start' }}>
              {/* Cột trái: Danh sách các Chức năng */}
              <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px', minWidth: 0 }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#334155', marginBottom: '12px' }}>
                  Danh sách Phân hệ ({filteredModules.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredModules.map(mod => {
                    const isSelected = selectedModuleId === mod.id;
                    const Icon = mod.icon;
                    const activeRoleCount = roles.filter(r => (r.permissions[mod.id] || []).length > 0).length;

                    return (
                      <div
                        key={mod.id}
                        onClick={() => setSelectedModuleId(mod.id)}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: `1px solid ${isSelected ? '#0284c7' : '#e2e8f0'}`,
                          background: isSelected ? '#f0f9ff' : '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          minWidth: 0,
                          overflow: 'hidden'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                            <Icon size={16} color={isSelected ? '#0284c7' : '#475569'} style={{ flexShrink: 0 }} />
                            <strong style={{ fontSize: '14px', color: '#0f172a', wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={mod.name}>
                              {mod.name}
                            </strong>
                          </div>
                          <span style={{
                            fontSize: '11px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
                            background: activeRoleCount > 0 ? '#e0f2fe' : '#f1f5f9',
                            color: activeRoleCount > 0 ? '#0369a1' : '#94a3b8',
                            flexShrink: 0, whiteSpace: 'nowrap'
                          }}>
                            {activeRoleCount}/{roles.length} vai trò
                          </span>
                        </div>
                        <p style={{ 
                          fontSize: '12px', color: '#64748b', margin: '4px 0 0 0',
                          wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis',
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
                        }}>
                          {mod.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cột phải: Bảng gán quyền cho TẤT CẢ VAI TRÒ đối với chức năng đang chọn */}
              <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px', minWidth: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
                  <div style={{ minWidth: 0, flex: '1 1 240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <currentSelectedModule.icon size={22} color="#0284c7" style={{ flexShrink: 0 }} />
                      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0, wordBreak: 'break-word' }}>
                        {currentSelectedModule.name}
                      </h2>
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0', wordBreak: 'break-word' }}>
                      {currentSelectedModule.desc}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    {!isEditingFeature ? (
                      <button
                        onClick={() => setIsEditingFeature(true)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1',
                          padding: '7px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap'
                        }}
                      >
                        <Edit size={14} /> Chỉnh sửa quyền chức năng
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            const resetPerms = {};
                            roles.forEach(r => { resetPerms[r.id] = [...(r.permissions[selectedModuleId] || [])]; });
                            setFeatureRolePerms(resetPerms);
                            setIsEditingFeature(false);
                          }}
                          style={{
                            background: '#fff', color: '#64748b', border: '1px solid #cbd5e1',
                            padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap'
                          }}
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleSaveCurrentFeaturePermissions}
                          disabled={savingFeature}
                          style={{
                            background: '#16a34a', color: '#fff', border: 'none',
                            padding: '7px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap'
                          }}
                        >
                          {savingFeature ? 'Đang lưu...' : 'Lưu phân quyền chức năng'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Bảng danh sách các vai trò và các quyền trong chức năng này */}
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '580px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ textAlign: 'left', padding: '10px 14px', color: '#475569', minWidth: '150px' }}>Vai trò (Role)</th>
                        <th style={{ textAlign: 'left', padding: '10px 14px', color: '#475569', minWidth: '110px' }}>Mã hệ thống</th>
                        {ACTIONS.map(act => (
                          <th key={act.id} style={{ textAlign: 'center', padding: '10px', color: '#475569', whiteSpace: 'nowrap' }}>
                            {act.name}
                          </th>
                        ))}
                        {isEditingFeature && (
                          <th style={{ textAlign: 'center', padding: '10px', color: '#475569', minWidth: '180px', whiteSpace: 'nowrap' }}>Thao tác nhanh</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map(role => {
                        const currentActions = featureRolePerms[role.id] || [];
                        const isSysAdmin = (role.code || '').toUpperCase() === 'ADMIN';

                        return (
                          <tr key={role.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a', wordBreak: 'break-word' }}>
                              {role.name}
                            </td>
                            <td style={{ padding: '12px 14px', color: '#64748b', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                              {role.code}
                            </td>
                            {ACTIONS.map(act => {
                              const isChecked = currentActions.includes(act.id);
                              return (
                                <td key={act.id} style={{ textAlign: 'center', padding: '10px' }}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={!isEditingFeature || isSysAdmin}
                                    onChange={() => handleToggleFeatureAction(role.id, act.id)}
                                    style={{ cursor: isEditingFeature && !isSysAdmin ? 'pointer' : 'default', width: '16px', height: '16px' }}
                                  />
                                </td>
                              );
                            })}
                            {isEditingFeature && (
                              <td style={{ textAlign: 'center', padding: '8px 10px', whiteSpace: 'nowrap' }}>
                                {!isSysAdmin ? (
                                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleGrantAllForRoleInFeature(role.id)}
                                      style={{
                                        fontSize: '11px', background: '#dcfce7', color: '#166534',
                                        border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap'
                                      }}
                                    >
                                      Toàn quyền
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleReadOnlyForRoleInFeature(role.id)}
                                      style={{
                                        fontSize: '11px', background: '#e0f2fe', color: '#0369a1',
                                        border: '1px solid #bae6fd', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap'
                                      }}
                                    >
                                      Chỉ xem
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRevokeAllForRoleInFeature(role.id)}
                                      style={{
                                        fontSize: '11px', background: '#fee2e2', color: '#991b1b',
                                        border: '1px solid #fecaca', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap'
                                      }}
                                    >
                                      Xóa hết
                                    </button>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Mặc định toàn quyền</span>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── CHẾ ĐỘ 2: GLOBAL GRID - LƯỚI MA TRẬN TOÀN CẢNH ─── */}
          {matrixViewMode === 'GLOBAL_GRID' && (
            <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px', minWidth: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ minWidth: 0, flex: '1 1 260px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0, wordBreak: 'break-word' }}>
                    Ma Trận Phân Quyền Toàn Cảnh (Global RBAC Grid)
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0', wordBreak: 'break-word' }}>
                    Xem bao quát tất cả <strong>{MODULES.length} Phân hệ</strong> và <strong>{roles.length} Vai trò</strong> trên cùng một màn hình
                  </p>
                </div>
                {/* Chú thích màu các hành động */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Ký hiệu quyền:</span>
                  {ACTIONS.map(act => (
                    <span 
                      key={act.id} 
                      style={{ 
                        fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                        background: act.bg, color: act.color, whiteSpace: 'nowrap'
                      }}
                    >
                      {act.short}: {act.name}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: '#475569', minWidth: '200px', position: 'sticky', left: 0, background: '#f8fafc', zIndex: 10, whiteSpace: 'nowrap' }}>
                        Phân hệ chức năng
                      </th>
                      {roles.map(role => (
                        <th key={role.id} style={{ textAlign: 'center', padding: '12px 10px', color: '#1e293b', minWidth: '120px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 700 }}>{role.name}</div>
                          <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>{role.code}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map((mod, modIdx) => {
                      const Icon = mod.icon;
                      return (
                        <tr key={mod.id} style={{ borderBottom: '1px solid #f1f5f9', background: modIdx % 2 === 0 ? '#fff' : '#fcfcfd' }}>
                          <td style={{ padding: '12px 16px', position: 'sticky', left: 0, background: modIdx % 2 === 0 ? '#fff' : '#fcfcfd', zIndex: 5, borderRight: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Icon size={16} color="#0284c7" style={{ flexShrink: 0 }} />
                              <strong style={{ color: '#0f172a' }}>{mod.name}</strong>
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                              {mod.id}
                            </div>
                          </td>

                          {roles.map(role => {
                            const grantedActions = role.permissions[mod.id] || [];

                            return (
                              <td key={role.id} style={{ textAlign: 'center', padding: '10px 8px', borderRight: '1px solid #f1f5f9' }}>
                                {grantedActions.length === 0 ? (
                                  <span style={{ color: '#cbd5e1', fontSize: '14px' }}>—</span>
                                ) : (
                                  <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    {ACTIONS.map(act => {
                                      const isGranted = grantedActions.includes(act.id);
                                      if (!isGranted) return null;
                                      return (
                                        <span
                                          key={act.id}
                                          title={`${role.name}: ${act.name} trong ${mod.name}`}
                                          style={{
                                            fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px',
                                            background: act.bg, color: act.color, display: 'inline-block', whiteSpace: 'nowrap'
                                          }}
                                        >
                                          {act.short}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
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
          )}
        </div>
      )}

      {/* ─── MODAL TẠO VAI TRÒ MỚI ─── */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px', boxSizing: 'border-box'
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden', boxSizing: 'border-box'
          }}>
            {/* Header Modal */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="#0284c7" />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Thêm Vai Trò Mới
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Modal */}
            <form onSubmit={handleCreateRoleSubmit} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Tên vai trò <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Kế toán viện phí, Dược sĩ kho lẻ..."
                  value={newRoleForm.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: '6px',
                    border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Mã hệ thống (Code)
                </label>
                <input
                  type="text"
                  placeholder="Tự động sinh từ tên (VD: KE_TOAN_VIEN_PHI)"
                  value={newRoleForm.code}
                  onChange={(e) => setNewRoleForm(p => ({ ...p, code: e.target.value.toUpperCase().replace(/\s+/g, '_') }))}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: '6px',
                    border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none',
                    fontFamily: 'monospace', boxSizing: 'border-box'
                  }}
                />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Được dùng làm định danh trong phân quyền và JWT token.
                </span>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Mô tả vai trò
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả nhiệm vụ, chức năng quyền hạn..."
                  value={newRoleForm.description}
                  onChange={(e) => setNewRoleForm(p => ({ ...p, description: e.target.value }))}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: '6px',
                    border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none',
                    resize: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                  Phạm vi dữ liệu mặc định (Data Scope)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {DATA_SCOPES.map(scope => {
                    const Icon = scope.icon;
                    return (
                      <label 
                        key={scope.key} 
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px',
                          padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0',
                          background: newRoleForm.dataScope === scope.key ? '#f0f9ff' : '#fff',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="radio"
                          name="newRoleDataScope"
                          checked={newRoleForm.dataScope === scope.key}
                          onChange={() => setNewRoleForm(p => ({ ...p, dataScope: scope.key }))}
                        />
                        <Icon size={14} color="#0284c7" style={{ flexShrink: 0 }} />
                        <span style={{ fontWeight: newRoleForm.dataScope === scope.key ? 600 : 400 }}>
                          {scope.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{
                    padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1',
                    background: '#fff', color: '#475569', fontSize: '13px', cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingRole}
                  style={{
                    padding: '8px 20px', borderRadius: '6px', border: 'none',
                    background: '#0284c7', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  {creatingRole ? 'Đang tạo...' : 'Tạo vai trò'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagementPage;
