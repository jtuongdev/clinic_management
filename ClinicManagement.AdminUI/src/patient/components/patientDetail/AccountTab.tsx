import React from 'react';
import type { BenhNhanProfileDto } from '../../type/profile.patient.type';

const accountTabStyles = `
.account-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.account-tab .tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.account-tab .tab-header h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.account-tab .tab-header .edit-btn {
  padding: 6px 16px;
  border: 1px solid #2c7da0;
  background: #fff;
  color: #2c7da0;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.account-tab .tab-header .edit-btn:hover {
  background: #2c7da0;
  color: #fff;
}

.account-tab .card {
  background: #fefefe;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 0;
}

.account-tab .grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.account-tab .field label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-bottom: 2px;
}

.account-tab .field strong {
  font-size: 14px;
  font-weight: 600;
}

.account-tab .field .muted {
  color: #7f8c8d;
  font-size: 12px;
  margin-left: 4px;
}

.account-tab .tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.account-tab .tag-success {
  background: #d4efdf;
  color: #1e8449;
}

.account-tab .tag-danger {
  background: #fdedec;
  color: #c0392b;
}

.account-tab .tag-default {
  background: #f1f5f9;
  color: #475569;
}

.account-tab .section-title {
  font-weight: 600;
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.account-tab .table-wrap {
  overflow-x: auto;
}

.account-tab table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.account-tab th {
  text-align: left;
  padding: 8px 8px 8px 0;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 1px solid #e2e8f0;
}

.account-tab td {
  padding: 8px 8px 8px 0;
  border-bottom: 1px solid #f0f2f5;
}

.account-tab .small-btn {
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  background: #fff;
  cursor: pointer;
  transition: 0.2s;
}

.account-tab .small-btn:hover {
  background: #f1f5f9;
}
`;

interface AccountTabProps {
  profile: BenhNhanProfileDto;
}

const AccountTab: React.FC<AccountTabProps> = ({ profile }) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusTag = (isLocked: boolean) => {
    if (isLocked) {
      return <span className="tag tag-danger">Đã khóa</span>;
    }
    return <span className="tag tag-success">Đang hoạt động</span>;
  };

  return (
    <>
      <style>{accountTabStyles}</style>
      <div className="account-tab">
      <div className="tab-header">
        <h2>Thông tin tài khoản</h2>
        <button className="edit-btn" onClick={() => alert('Sửa tài khoản')}>
          <i className="fas fa-pen"></i> Sửa
        </button>
      </div>

      <div className="card">
        <div className="grid-2">
          <div className="field">
            <label>Tên đăng nhập</label>
            <strong>{profile.taiKhoan?.username || '--'}</strong>
          </div>
          <div className="field">
            <label>Email đăng nhập</label>
            <strong>{profile.email || '--'}</strong>
          </div>
          <div className="field">
            <label>Mật khẩu</label>
            <strong>••••••••</strong>
            <span className="muted">(đã mã hóa)</span>
          </div>
          <div className="field">
            <label>Vai trò</label>
            <strong>{profile.taiKhoan?.roles?.join(', ') || 'Bệnh nhân'}</strong>
          </div>
          <div className="field">
            <label>Quyền hạn</label>
            <strong>Xem hồ sơ</strong>
          </div>
          <div className="field">
            <label>Trạng thái</label>
            <strong>{getStatusTag(profile.taiKhoan?.isLocked || false)}</strong>
          </div>
          <div className="field">
            <label>Ngày tạo</label>
            <strong>{formatDate(profile.createdAt)}</strong>
          </div>
          <div className="field">
            <label>Lần đăng nhập gần nhất</label>
            <strong>{profile.taiKhoan?.lastLogin ? formatDate(profile.taiKhoan.lastLogin) : 'Chưa đăng nhập'}</strong>
          </div>
        </div>
      </div>

      {/* Lịch sử đăng nhập (mock) */}
      <div className="card">
        <div className="section-title"><i className="fas fa-history"></i> Lịch sử đăng nhập</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Thời gian</th><th>Địa chỉ IP</th><th>Trình duyệt</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>{formatDate(profile.taiKhoan?.lastLogin || '')}</td>
                <td>--</td>
                <td>--</td>
                <td><span className="tag tag-success">Thành công</span></td>
              </tr>
              <tr>
                <td>--</td>
                <td>--</td>
                <td>--</td>
                <td><span className="tag tag-default">Chưa có dữ liệu</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Đổi mật khẩu (mock) */}
      <div className="card">
        <div className="section-title"><i className="fas fa-key"></i> Đổi mật khẩu</div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568' }}>Mật khẩu cũ</label>
            <input
              type="password"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}
              placeholder="••••••••"
            />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568' }}>Mật khẩu mới</label>
            <input
              type="password"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}
              placeholder="••••••••"
            />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568' }}>Xác nhận mật khẩu</label>
            <input
              type="password"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}
              placeholder="••••••••"
            />
          </div>
          <button
            className="small-btn"
            style={{ background: '#2c7da0', color: '#fff', border: 'none', padding: '8px 20px' }}
            onClick={() => alert('Đổi mật khẩu')}
          >
            <i className="fas fa-save"></i> Cập nhật
          </button>
        </div>
      </div>
    </div>
  </>
);
};

export default AccountTab;