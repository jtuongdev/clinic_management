import React from 'react';
import { BenhNhanProfileDto } from '../../type/profile.patient.type';

interface PersonalTabProps {
  patient: BenhNhanProfileDto;
}

const PersonalTab: React.FC<PersonalTabProps> = ({ patient }) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  };

  const genderMap: Record<string, string> = {
    'M': 'Nam',
    'F': 'Nữ',
    'O': 'Khác',
  };

  return (
    <>
      <div className="tab-header">
        <h2>Thông tin cá nhân</h2>
        <button className="edit-btn" onClick={() => alert('Sửa thông tin cá nhân')}>
          <i className="fas fa-pen"></i> Sửa
        </button>
      </div>
      <div className="card">
        <div className="grid-4">
          <div className="field">
            <label>Họ và tên</label>
            <strong>{patient.hoTen}</strong>
          </div>
          <div className="field">
            <label>Ngày sinh</label>
            <strong>{formatDate(patient.ngaySinh)}</strong>
          </div>
          <div className="field">
            <label>Giới tính</label>
            <strong>{genderMap[patient.gioiTinh] || patient.gioiTinh}</strong>
          </div>
          <div className="field">
            <label>CCCD</label>
            <strong>{patient.soCCCD || 'Chưa cập nhật'}</strong>
          </div>
          <div className="field">
            <label>Điện thoại</label>
            <strong>{patient.dienThoai}</strong>
          </div>
          <div className="field">
            <label>Email</label>
            <strong>{patient.email || 'Chưa cập nhật'}</strong>
          </div>
          <div className="field">
            <label>Địa chỉ</label>
            <strong>{patient.diaChi || 'Chưa cập nhật'}</strong>
          </div>
          <div className="field">
            <label>Người liên hệ</label>
            <strong>{patient.nguoiLienHeTen || 'Chưa cập nhật'}</strong>
          </div>
          <div className="field">
            <label>SĐT liên hệ</label>
            <strong>{patient.nguoiLienHeDienThoai || 'Chưa cập nhật'}</strong>
          </div>
          <div className="field">
            <label>Mã BN nội bộ</label>
            <strong>{patient.maBenhNhanNoiBo}</strong>
          </div>
          <div className="field">
            <label>Cơ sở đăng ký</label>
            <strong>{patient.tenCoSo}</strong>
          </div>
          <div className="field">
            <label>Ngày đăng ký</label>
            <strong>{formatDate(patient.ngayDangKy)}</strong>
          </div>
        </div>
      </div>
    </>
  );
};

export default PersonalTab;