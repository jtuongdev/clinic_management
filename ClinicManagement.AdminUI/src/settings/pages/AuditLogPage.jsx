import React, { useState, useEffect } from 'react';
import { FileSearch, Filter, Download, ShieldAlert, Eye, User, Calendar, Activity, RefreshCw } from 'lucide-react';
import { settingsApi } from '../api/settings.api';

export const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterModule, setFilterModule] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Tích hợp API Backend: GET /api/admin/audit-logs
  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const params = {
        action: filterAction !== 'ALL' ? filterAction : undefined,
        module: filterModule !== 'ALL' ? filterModule : undefined,
      };
      const res = await settingsApi.getAuditLogs(params);
      setLogs(res.data?.success && Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [filterAction, filterModule]);

  // Tích hợp API Backend: GET /api/admin/audit-logs/export
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await settingsApi.exportAuditLogsCsv({
        action: filterAction !== 'ALL' ? filterAction : undefined,
        module: filterModule !== 'ALL' ? filterModule : undefined,
      });
      // Tải file blob về máy
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `emr_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Không thể xuất file CSV nhật ký kiểm toán. Vui lòng thử lại.');
    } finally {
      setExporting(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filterAction !== 'ALL' && log.action !== filterAction) return false;
    if (filterModule !== 'ALL' && log.module !== filterModule) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.userName?.toLowerCase().includes(q) ||
        log.patientName?.toLowerCase().includes(q) ||
        log.patientCode?.toLowerCase().includes(q) ||
        log.details?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ padding: '16px', background: '#f8fafc', minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSearch size={24} color="#0284c7" /> Nhật ký Kiểm toán Bệnh án (EMR Audit Trail)
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Truy vết bất biến các hành vi Xem, Sửa, Ký số, Xuất dữ liệu bệnh án theo Thông tư 46/2018/TT-BYT
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={fetchAuditLogs}
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
            onClick={handleExportCSV}
            disabled={exporting}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#0284c7', color: '#fff', border: 'none',
              padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500
            }}
          >
            <Download size={16} /> {exporting ? 'Đang xuất...' : 'Xuất CSV kiểm toán'}
          </button>
        </div>
      </div>

      {/* Bộ lọc */}
      <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Tìm theo Tên BS, Bệnh nhân, Mã BN, Nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
          />
        </div>
        <div>
          <select 
            value={filterModule} 
            onChange={(e) => setFilterModule(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
          >
            <option value="ALL">Tất cả Phân hệ</option>
            <option value="EMR">Bệnh án EMR</option>
            <option value="BILLING">Viện phí & Hóa đơn</option>
            <option value="INVENTORY">Kho Dược</option>
          </select>
        </div>
        <div>
          <select 
            value={filterAction} 
            onChange={(e) => setFilterAction(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
          >
            <option value="ALL">Tất cả Hành động</option>
            <option value="VIEW_RECORD">Xem bệnh án</option>
            <option value="LOCK_RECORD">Ký số & Khóa hồ sơ</option>
            <option value="CREATE_INVOICE">Lập hóa đơn</option>
            <option value="DISPENSE_DRUG">Cấp phát thuốc</option>
            <option value="EXPORT_RECORD">Xuất dữ liệu</option>
          </select>
        </div>
      </div>

      {/* Bảng nhật ký */}
      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#475569' }}>Thời gian</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#475569' }}>Người thực hiện</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#475569' }}>Bệnh nhân</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#475569' }}>Hành động</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#475569' }}>Nội dung chi tiết</th>
              <th style={{ textAlign: 'center', padding: '12px 16px', color: '#475569' }}>IP</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 16px', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {log.timestamp}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <strong>{log.userName}</strong>
                  <div style={{ fontSize: '11px', color: '#0284c7' }}>{log.userRole}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div>{log.patientName}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{log.patientCode}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ 
                    padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                    background: log.action === 'LOCK_RECORD' ? '#dcfce7' : log.action === 'EXPORT_RECORD' ? '#fef3c7' : '#f0f9ff',
                    color: log.action === 'LOCK_RECORD' ? '#166534' : log.action === 'EXPORT_RECORD' ? '#92400e' : '#0369a1'
                  }}>
                    {log.actionName || log.action}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#334155' }}>
                  {log.details}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                  <code>{log.ipAddress}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogPage;
