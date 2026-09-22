import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/components/CatalogPanel.css';
import { examinationApi } from '../../examination/api/examination.api';

type CatalogType = 'icd' | 'service' | 'drug' | 'history';

const CatalogPanel: React.FC = () => {
  const [activeCatalog, setActiveCatalog] = useState<CatalogType>('icd');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const catalogs = [
    { key: 'icd', label: 'ICD-10', icon: 'fa-stethoscope' },
    { key: 'service', label: 'Dịch vụ CLS', icon: 'fa-flask' },
    { key: 'drug', label: 'Thuốc & Dược', icon: 'fa-pills' },
    { key: 'history', label: 'Tiền sử & Dị ứng', icon: 'fa-notes-medical' },
  ];

  const fetchCatalogData = useCallback(async (type: CatalogType, keyword: string) => {
    setIsLoading(true);
    try {
      if (type === 'icd') {
        const res = await examinationApi.searchICD(keyword);
        const data = res.data?.data || [];
        setItems(data);
        setTotalCount(data.length);
      } else if (type === 'service') {
        const res = await examinationApi.getServiceCatalog();
        let data = res.data?.data || [];
        if (keyword.trim()) {
          const kw = keyword.toLowerCase();
          data = data.filter((s: any) => 
            s.ten?.toLowerCase().includes(kw) || 
            s.ma?.toLowerCase().includes(kw) ||
            s.loaiDichVu?.toLowerCase().includes(kw)
          );
        }
        setItems(data);
        setTotalCount(data.length);
      } else if (type === 'drug') {
        const res = await examinationApi.searchDrugs(keyword);
        const data = res.data?.data || [];
        setItems(data);
        setTotalCount(data.length);
      } else if (type === 'history') {
        const res = await examinationApi.getLoaiTienSuOptions();
        let data = res.data?.data || [];
        if (keyword.trim()) {
          const kw = keyword.toLowerCase();
          data = data.filter((h: any) => 
            h.label?.toLowerCase().includes(kw) || 
            h.description?.toLowerCase().includes(kw)
          );
        }
        setItems(data);
        setTotalCount(data.length);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu danh mục:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCatalogData(activeCatalog, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeCatalog, search, fetchCatalogData]);

  const handleTabChange = (key: CatalogType) => {
    setActiveCatalog(key);
    setSearch('');
  };

  return (
    <div className="panel-catalog active">
      <div className="workspace-bar">
        <div className="workspace-title"><i className="fa-solid fa-folder-tree"></i> Tra cứu danh mục lâm sàng</div>
        <div className="workflow">
          <button className="active"><i className="fa-solid fa-book-open"></i><span>Dữ liệu hệ thống</span></button>
        </div>
      </div>
      <div className="catalog-content">
        <div className="catalog-stats">
          <div className="stat-item">
            <i className="fa-solid fa-database"></i> Đang hiển thị: <span>{totalCount}</span>
          </div>
          <div className="stat-item">
            <i className="fa-solid fa-circle-check" style={{color: 'var(--success)'}}></i> Nguồn dữ liệu: <span>CSDL Trung tâm</span>
          </div>
          <div className="stat-item">
            <i className="fa-solid fa-clock"></i> Đồng bộ: <span>Thời gian thực</span>
          </div>
        </div>

        <div className="catalog-tabs">
          {catalogs.map(cat => (
            <button
              key={cat.key}
              className={activeCatalog === cat.key ? 'active' : ''}
              onClick={() => handleTabChange(cat.key as CatalogType)}
            >
              <i className={`fa-solid ${cat.icon}`}></i> {cat.label}
            </button>
          ))}
        </div>

        <div className="catalog-search-bar">
          <div className="search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              placeholder={`Tìm kiếm trong ${catalogs.find(c => c.key === activeCatalog)?.label}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="catalog-table-wrapper">
          {isLoading ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
              <i className="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu từ máy chủ...
            </div>
          ) : items.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
              Không tìm thấy mục danh mục nào phù hợp với từ khóa.
            </div>
          ) : (
            <table className="catalog-table">
              <thead>
                {activeCatalog === 'icd' && (
                  <tr>
                    <th style={{ width: '120px' }}>Mã ICD</th>
                    <th>Tên bệnh / Chẩn đoán</th>
                    <th>Chương bệnh</th>
                    <th style={{ width: '100px' }}>Trạng thái</th>
                  </tr>
                )}
                {activeCatalog === 'service' && (
                  <tr>
                    <th style={{ width: '120px' }}>Mã dịch vụ</th>
                    <th>Tên dịch vụ cận lâm sàng</th>
                    <th>Loại dịch vụ</th>
                    <th style={{ width: '120px' }}>Đơn giá</th>
                    <th style={{ width: '100px' }}>Đơn vị</th>
                  </tr>
                )}
                {activeCatalog === 'drug' && (
                  <tr>
                    <th style={{ width: '120px' }}>Mã thuốc</th>
                    <th>Tên thuốc biệt dược</th>
                    <th>Hoạt chất / Hàm lượng</th>
                    <th style={{ width: '100px' }}>Đơn vị</th>
                    <th style={{ width: '120px' }}>Tồn kho</th>
                  </tr>
                )}
                {activeCatalog === 'history' && (
                  <tr>
                    <th style={{ width: '160px' }}>Mã phân loại</th>
                    <th>Tên danh mục tiền sử</th>
                    <th>Mô tả chi tiết</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {activeCatalog === 'icd' && items.map((item, idx) => (
                  <tr key={item.id || item.ma || idx}>
                    <td><strong><code>{item.ma || item.code}</code></strong></td>
                    <td>{item.ten || item.name}</td>
                    <td><span className="badge blue">{item.chuong || item.nhom || 'ICD-10'}</span></td>
                    <td><span className="badge green">Sẵn sàng</span></td>
                  </tr>
                ))}
                {activeCatalog === 'service' && items.map((item, idx) => (
                  <tr key={item.id || item.ma || idx}>
                    <td><strong><code>{item.ma || `DV-${item.id}`}</code></strong></td>
                    <td>{item.ten}</td>
                    <td><span className="badge blue">{item.loaiDichVu}</span></td>
                    <td>{item.gia ? `${item.gia.toLocaleString('vi-VN')} đ` : 'Theo biểu giá'}</td>
                    <td>{item.donViTinh || 'Lần'}</td>
                  </tr>
                ))}
                {activeCatalog === 'drug' && items.map((item, idx) => (
                  <tr key={item.id || item.maThuoc || idx}>
                    <td><strong><code>{item.maThuoc || `TH-${item.id}`}</code></strong></td>
                    <td><strong>{item.tenThuoc}</strong></td>
                    <td>{item.hoatChat} {item.hamLuong ? `(${item.hamLuong})` : ''}</td>
                    <td>{item.donViTinh || 'Viên'}</td>
                    <td>
                      <span className={`badge ${(item.soLuongTon ?? 10) > 0 ? 'green' : 'red'}`}>
                        {(item.soLuongTon ?? 0) > 0 ? `Còn ${item.soLuongTon}` : 'Hết hàng'}
                      </span>
                    </td>
                  </tr>
                ))}
                {activeCatalog === 'history' && items.map((item, idx) => (
                  <tr key={item.value || idx}>
                    <td><strong><code>{item.value}</code></strong></td>
                    <td><strong>{item.label}</strong></td>
                    <td>{item.description || 'Tiền sử lâm sàng'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogPanel;