import React, { useState } from 'react';
import '../../styles/components/CatalogPanel.css'

// Dữ liệu mock
const catalogData = {
  statistics: { totalCatalogItems: 2411, activeCatalogItems: 2309, usedToday: 86, lastUpdatedAt: '2026-08-27 08:20' },
  icd: {
    columns: ['Mã ICD', 'Tên chẩn đoán', 'Nhóm bệnh', 'Trạng thái'],
    items: [
      ['J06.9', 'Nhiễm trùng đường hô hấp cấp không đặc hiệu', 'Hô hấp', 'ACTIVE'],
      ['J18.9', 'Viêm phổi, không đặc hiệu', 'Hô hấp', 'ACTIVE'],
      ['R06.0', 'Khó thở', 'Triệu chứng', 'ACTIVE'],
      ['K29.7', 'Viêm dạ dày, không đặc hiệu', 'Tiêu hóa', 'ACTIVE'],
      ['I10', 'Tăng huyết áp vô căn', 'Tim mạch', 'ACTIVE'],
    ]
  },
  service: {
    columns: ['Mã dịch vụ', 'Tên dịch vụ', 'Loại dịch vụ', 'Đơn vị', 'Trạng thái'],
    items: [
      ['DV001', 'Xét nghiệm công thức máu', 'Xét nghiệm', 'Lần', 'ACTIVE'],
      ['DV002', 'Chụp X-quang ngực thẳng', 'Chẩn đoán hình ảnh', 'Lần', 'ACTIVE'],
      ['DV003', 'Siêu âm ổ bụng tổng quát', 'Chẩn đoán hình ảnh', 'Lần', 'ACTIVE'],
    ]
  },
  drug: {
    columns: ['Mã thuốc', 'Tên thuốc', 'Hoạt chất', 'Hàm lượng', 'Đơn vị', 'Trạng thái'],
    items: [
      ['TH001', 'Paracetamol 500mg', 'Paracetamol', '500mg', 'Viên', 'ACTIVE'],
      ['TH002', 'Amoxicillin 500mg', 'Amoxicillin', '500mg', 'Viên', 'ACTIVE'],
      ['TH003', 'Azithromycin 500mg', 'Azithromycin', '500mg', 'Viên', 'ACTIVE'],
    ]
  },
  supply: {
    columns: ['Mã vật tư', 'Tên vật tư', 'Đơn vị', 'Nhóm', 'Trạng thái'],
    items: [
      ['VT001', 'Bơm tiêm 5ml', 'Cái', 'Vật tư tiêu hao', 'ACTIVE'],
      ['VT002', 'Kim tiêm 23G', 'Cái', 'Vật tư tiêu hao', 'ACTIVE'],
    ]
  },
  allergy: {
    columns: ['Mã', 'Tên tác nhân', 'Nhóm', 'Ghi chú'],
    items: [
      ['DU001', 'Penicillin', 'Thuốc', 'Kháng sinh beta-lactam'],
      ['DU002', 'Amoxicillin', 'Thuốc', 'Kháng sinh'],
    ]
  },
  history: {
    columns: ['Mã', 'Tên bệnh', 'Nhóm bệnh', 'Phạm vi'],
    items: [
      ['TS001', 'Tăng huyết áp', 'Tim mạch', 'Cá nhân / gia đình'],
      ['TS002', 'Đái tháo đường', 'Nội tiết', 'Cá nhân / gia đình'],
    ]
  }
};

type CatalogType = 'icd' | 'service' | 'drug' | 'supply' | 'allergy' | 'history';

const CatalogPanel: React.FC = () => {
  const [activeCatalog, setActiveCatalog] = useState<CatalogType>('icd');
  const [search, setSearch] = useState('');

  const catalogs = [
    { key: 'icd', label: 'ICD', icon: 'fa-stethoscope' },
    { key: 'service', label: 'DVKT', icon: 'fa-flask' },
    { key: 'drug', label: 'Thuốc', icon: 'fa-pills' },
    { key: 'supply', label: 'Vật tư', icon: 'fa-box-open' },
    { key: 'allergy', label: 'Dị ứng', icon: 'fa-triangle-exclamation' },
    { key: 'history', label: 'Tiền sử', icon: 'fa-notes-medical' },
  ];

  const currentData = catalogData[activeCatalog];
  const filteredItems = currentData.items.filter(item =>
    item.some(field => field.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="panel-catalog active">
      <div className="workspace-bar">
        <div className="workspace-title"><i className="fa-solid fa-folder-tree"></i> Danh mục</div>
        <div className="workflow">
          <button className="active"><i className="fa-solid fa-book-open"></i><span>Tra cứu</span></button>
          <button><i className="fa-solid fa-plus"></i><span>Thêm mới</span></button>
        </div>
      </div>
      <div className="catalog-content">
        <div className="catalog-stats">
          <div className="stat-item"><i className="fa-solid fa-database"></i> Tổng: <span>{catalogData.statistics.totalCatalogItems}</span></div>
          <div className="stat-item"><i className="fa-solid fa-circle-check" style={{color: 'var(--success)'}}></i> Đang hoạt động: <span>{catalogData.statistics.activeCatalogItems}</span></div>
          <div className="stat-item"><i className="fa-solid fa-clock"></i> Cập nhật: <span>{catalogData.statistics.lastUpdatedAt}</span></div>
          <div className="stat-item"><i className="fa-solid fa-arrow-trend-up" style={{color: 'var(--info)'}}></i> Sử dụng hôm nay: <span>{catalogData.statistics.usedToday}</span></div>
        </div>

        <div className="catalog-tabs">
          {catalogs.map(cat => (
            <button
              key={cat.key}
              className={activeCatalog === cat.key ? 'active' : ''}
              onClick={() => setActiveCatalog(cat.key as CatalogType)}
            >
              <i className={`fa-solid ${cat.icon}`}></i> {cat.label}
            </button>
          ))}
        </div>

        <div className="catalog-toolbar">
          <div className="search">
            <input
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <i className="fa-solid fa-magnifying-glass"></i>
          </div>
          <div>
            <button className="btn"><i className="fa-solid fa-rotate"></i> Làm mới</button>
            <button className="btn primary"><i className="fa-solid fa-download"></i> Xuất</button>
          </div>
        </div>

        <div className="catalog-table-wrap">
          <table>
            <thead>
              <tr>
                {currentData.columns.map((col, i) => <th key={i}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr><td colSpan={currentData.columns.length} className="empty-catalog"><i className="fa-solid fa-database"></i> Không có dữ liệu</td></tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={idx}>
                    {item.map((value, i) => (
                      <td key={i}>
                        {currentData.columns[i] === 'Trạng thái' ? (
                          <span className={`status-badge ${value === 'ACTIVE' ? 'active' : 'inactive'}`}>
                            {value === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động'}
                          </span>
                        ) : value}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '10px', fontSize: '11px', color: 'var(--muted)'}}>
          <span>Trang 1 / 1</span>
        </div>
      </div>
    </div>
  );
};

export default CatalogPanel;