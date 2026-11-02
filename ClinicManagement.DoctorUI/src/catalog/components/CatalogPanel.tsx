import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import '../../styles/components/CatalogPanel.css';
import { examinationApi } from '../../examination/api/examination.api';

type CatalogType = 'icd' | 'service' | 'drug' | 'history';

const CatalogPanel: React.FC = () => {
  const [activeCatalog, setActiveCatalog] = useState<CatalogType>('icd');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const catalogs = useMemo(() => [
    { key: 'icd' as const, label: 'ICD-10', icon: 'fa-stethoscope' },
    { key: 'service' as const, label: 'Dịch vụ CLS', icon: 'fa-flask' },
    { key: 'drug' as const, label: 'Thuốc & Dược', icon: 'fa-pills' },
    { key: 'history' as const, label: 'Tiền sử & Dị ứng', icon: 'fa-notes-medical' },
  ], []);

  const fetchCatalogData = useCallback(async (type: CatalogType, keyword: string) => {
    setIsLoading(true);
    try {
      if (type === 'icd') {
        const res = await examinationApi.searchICD(keyword);
        const rawData = res.data?.data || [];
        const data = rawData.map((item: any) => ({
          ...item,
          maICD: item.maICD || item.maIcd || item.ma || item.code || '',
          tenICD: item.tenICD || item.tenIcd || item.tenChanDoan || item.ten || item.name || '',
          chuong: item.chuong || item.nhom || 'ICD-10',
        }));
        setItems(data);
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
      } else if (type === 'drug') {
        const res = await examinationApi.searchDrugs(keyword);
        const data = res.data?.data || [];
        setItems(data);
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
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu danh mục:', err);
      toast.error('Không thể tải dữ liệu danh mục');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCatalogData(activeCatalog, search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeCatalog, search, fetchCatalogData]);

  const handleTabChange = (key: CatalogType) => {
    setActiveCatalog(key);
    setSearch('');
    setPage(1);
  };

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}: ${text}`, {
      duration: 1800,
      style: {
        fontSize: '12px',
        padding: '6px 12px',
        borderRadius: '4px',
      },
    });
  };

  // Tính toán dữ liệu hiển thị theo phân trang
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedItems = useMemo(() => {
    const startIdx = (page - 1) * pageSize;
    return items.slice(startIdx, startIdx + pageSize);
  }, [items, page, pageSize]);

  return (
    <div className="panel-catalog active">
      <Toaster position="top-right" />
      <div className="workspace-bar">
        <div className="workspace-title">
          <i className="fa-solid fa-folder-tree"></i> Tra cứu danh mục lâm sàng
        </div>
        <div className="workflow">
          <button className="active">
            <i className="fa-solid fa-book-open"></i>
            <span>Dữ liệu hệ thống</span>
          </button>
        </div>
      </div>

      <div className="catalog-content">
        {/* Metric Ribbon */}
        <div className="catalog-stats">
          <div className="stat-item">
            <i className="fa-solid fa-database"></i> Đang hiển thị: <span>{totalCount.toLocaleString('vi-VN')}</span>
          </div>
          <div className="stat-item">
            <i className="fa-solid fa-circle-check" style={{ color: 'var(--success)' }}></i> Nguồn dữ liệu: <span>CSDL Trung tâm</span>
          </div>
          <div className="stat-item">
            <i className="fa-solid fa-clock"></i> Đồng bộ: <span>Thời gian thực</span>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="catalog-tabs">
          {catalogs.map(cat => (
            <button
              key={cat.key}
              className={activeCatalog === cat.key ? 'active' : ''}
              onClick={() => handleTabChange(cat.key)}
            >
              <i className={`fa-solid ${cat.icon}`}></i> {cat.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="catalog-toolbar">
          <div className="search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              placeholder={`Tìm kiếm trong ${catalogs.find(c => c.key === activeCatalog)?.label}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <button
              type="button"
              className="catalog-action-btn"
              onClick={() => fetchCatalogData(activeCatalog, search)}
              title="Tải lại danh mục"
            >
              <i className={`fa-solid fa-rotate-right ${isLoading ? 'fa-spin' : ''}`}></i> Làm mới
            </button>
          </div>
        </div>

        {/* High-Density Excel Data Grid Container */}
        <div className="catalog-table-wrap w-full overflow-x-auto border border-slate-300 rounded-none bg-white">
          <table className="table-fixed w-full border-collapse">
            {/* Colgroup locks precise pixel widths to prevent column distortion */}
            {activeCatalog === 'icd' && (
              <colgroup>
                <col className="w-12 min-w-[48px] max-w-[48px]" style={{ width: 48 }} />
                <col className="w-28 min-w-[112px] max-w-[112px]" style={{ width: 112 }} />
                <col />
                <col className="w-36 min-w-[144px] max-w-[144px]" style={{ width: 144 }} />
                <col className="w-28 min-w-[112px] max-w-[112px]" style={{ width: 112 }} />
                <col className="w-24 min-w-[96px] max-w-[96px]" style={{ width: 96 }} />
              </colgroup>
            )}

            {activeCatalog === 'service' && (
              <colgroup>
                <col className="w-12 min-w-[48px] max-w-[48px]" style={{ width: 48 }} />
                <col className="w-28 min-w-[112px] max-w-[112px]" style={{ width: 112 }} />
                <col />
                <col className="w-28 min-w-[112px] max-w-[112px]" style={{ width: 112 }} />
                <col className="w-24 min-w-[96px] max-w-[96px]" style={{ width: 96 }} />
                <col className="w-32 min-w-[128px] max-w-[128px]" style={{ width: 128 }} />
                <col className="w-28 min-w-[112px] max-w-[112px]" style={{ width: 112 }} />
                <col className="w-24 min-w-[96px] max-w-[96px]" style={{ width: 96 }} />
              </colgroup>
            )}

            {activeCatalog === 'drug' && (
              <colgroup>
                <col className="w-12 min-w-[48px] max-w-[48px]" style={{ width: 48 }} />
                <col className="w-28 min-w-[112px] max-w-[112px]" style={{ width: 112 }} />
                <col className="w-56 min-w-[180px] max-w-[240px]" style={{ width: 220 }} />
                <col />
                <col className="w-24 min-w-[96px] max-w-[96px]" style={{ width: 96 }} />
                <col className="w-24 min-w-[96px] max-w-[96px]" style={{ width: 96 }} />
                <col className="w-28 min-w-[112px] max-w-[112px]" style={{ width: 112 }} />
                <col className="w-24 min-w-[96px] max-w-[96px]" style={{ width: 96 }} />
              </colgroup>
            )}

            {activeCatalog === 'history' && (
              <colgroup>
                <col className="w-12 min-w-[48px] max-w-[48px]" style={{ width: 48 }} />
                <col className="w-28 min-w-[112px] max-w-[112px]" style={{ width: 112 }} />
                <col className="w-56 min-w-[180px] max-w-[240px]" style={{ width: 220 }} />
                <col />
                <col className="w-28 min-w-[112px] max-w-[112px]" style={{ width: 112 }} />
                <col className="w-24 min-w-[96px] max-w-[96px]" style={{ width: 96 }} />
              </colgroup>
            )}

            {/* Table Header */}
            <thead>
              {activeCatalog === 'icd' && (
                <tr>
                  <th className="w-12 min-w-[48px] max-w-[48px] text-center bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    STT
                  </th>
                  <th className="w-28 min-w-[112px] max-w-[112px] text-left bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Mã ICD
                  </th>
                  <th className="text-left bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Tên bệnh / Chẩn đoán
                  </th>
                  <th className="w-36 min-w-[144px] max-w-[144px] text-left bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Chương / Nhóm
                  </th>
                  <th className="w-28 min-w-[112px] max-w-[112px] text-center bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Trạng thái
                  </th>
                  <th className="w-24 min-w-[96px] max-w-[96px] text-center bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Thao tác
                  </th>
                </tr>
              )}

              {activeCatalog === 'service' && (
                <tr>
                  <th className="w-12 min-w-[48px] max-w-[48px] text-center bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    STT
                  </th>
                  <th className="w-28 min-w-[112px] max-w-[112px] text-left bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Mã dịch vụ
                  </th>
                  <th className="text-left bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Tên dịch vụ cận lâm sàng
                  </th>
                  <th className="w-28 min-w-[112px] max-w-[112px] text-center bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Loại dịch vụ
                  </th>
                  <th className="w-24 min-w-[96px] max-w-[96px] text-center bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Đơn vị
                  </th>
                  <th className="w-32 min-w-[128px] max-w-[128px] text-right bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Đơn giá
                  </th>
                  <th className="w-28 min-w-[112px] max-w-[112px] text-center bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Trạng thái
                  </th>
                  <th className="w-24 min-w-[96px] max-w-[96px] text-center bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Thao tác
                  </th>
                </tr>
              )}

              {activeCatalog === 'drug' && (
                <tr>
                  <th className="w-12 min-w-[48px] max-w-[48px] text-center bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    STT
                  </th>
                  <th className="w-28 min-w-[112px] max-w-[112px] text-left bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Mã thuốc
                  </th>
                  <th className="w-56 min-w-[180px] max-w-[240px] text-left bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Tên thuốc biệt dược
                  </th>
                  <th className="text-left bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Hoạt chất / Hàm lượng
                  </th>
                  <th className="w-24 min-w-[96px] max-w-[96px] text-center bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Đơn vị
                  </th>
                  <th className="w-24 min-w-[96px] max-w-[96px] text-right bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Tồn kho
                  </th>
                  <th className="w-28 min-w-[112px] max-w-[112px] text-center bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Trạng thái
                  </th>
                  <th className="w-24 min-w-[96px] max-w-[96px] text-center bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Thao tác
                  </th>
                </tr>
              )}

              {activeCatalog === 'history' && (
                <tr>
                  <th className="w-12 min-w-[48px] max-w-[48px] text-center bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    STT
                  </th>
                  <th className="w-28 min-w-[112px] max-w-[112px] text-left bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Mã mục
                  </th>
                  <th className="w-56 min-w-[180px] max-w-[240px] text-left bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Tên danh mục tiền sử
                  </th>
                  <th className="text-left bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Mô tả chi tiết / Hướng dẫn
                  </th>
                  <th className="w-28 min-w-[112px] max-w-[112px] text-center bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Trạng thái
                  </th>
                  <th className="w-24 min-w-[96px] max-w-[96px] text-center bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle h-9 px-2 py-1.5 border border-slate-300">
                    Thao tác
                  </th>
                </tr>
              )}
            </thead>

            {/* Table Body */}
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={activeCatalog === 'service' || activeCatalog === 'drug' ? 8 : 6} className="text-center align-middle h-24 py-8 border border-slate-300 text-slate-500">
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i> Đang tải dữ liệu từ máy chủ...
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={activeCatalog === 'service' || activeCatalog === 'drug' ? 8 : 6} className="text-center align-middle h-24 py-8 border border-slate-300 text-slate-400">
                    Không tìm thấy mục danh mục nào phù hợp với từ khóa tìm kiếm.
                  </td>
                </tr>
              ) : (
                <>
                  {activeCatalog === 'icd' && paginatedItems.map((item, idx) => {
                    const stt = (page - 1) * pageSize + idx + 1;
                    const code = item.maICD || item.maIcd || item.ma || item.code || '';
                    const name = item.tenICD || item.tenIcd || item.tenChanDoan || item.ten || item.name || '';
                    const group = item.chuong || item.nhom || 'ICD-10';

                    return (
                      <tr key={item.id || code || idx} className="even:bg-slate-50/50 hover:bg-sky-50/60 transition-colors">
                        <td className="w-12 min-w-[48px] max-w-[48px] text-center align-middle h-9 px-2 py-1.5 border border-slate-300 font-mono text-xs text-slate-500">
                          {stt}
                        </td>
                        <td className="w-28 min-w-[112px] max-w-[112px] text-left align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <div className="min-w-0 truncate font-mono font-semibold text-sky-800" title={code}>
                            {code}
                          </div>
                        </td>
                        <td className="text-left align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <div className="min-w-0 truncate text-slate-800" title={name}>
                            {name}
                          </div>
                        </td>
                        <td className="w-36 min-w-[144px] max-w-[144px] text-left align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <div className="min-w-0 truncate text-slate-600 text-xs" title={group}>
                            {group}
                          </div>
                        </td>
                        <td className="w-28 min-w-[112px] max-w-[112px] text-center align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <span className="badge green" title="Sẵn sàng áp dụng trong hồ sơ bệnh án">
                            Sẵn sàng
                          </span>
                        </td>
                        <td className="w-24 min-w-[96px] max-w-[96px] text-center align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <button
                            type="button"
                            className="catalog-action-btn"
                            title={`Sao chép mã ${code}`}
                            onClick={() => copyToClipboard(code, 'mã ICD')}
                          >
                            <i className="fa-regular fa-copy"></i> Sao chép
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {activeCatalog === 'service' && paginatedItems.map((item, idx) => {
                    const stt = (page - 1) * pageSize + idx + 1;
                    const code = item.ma || `DV-${item.id}`;
                    const name = item.ten || '';
                    const serviceType = item.loaiDichVu || 'Cận lâm sàng';
                    const unit = item.donViTinh || 'Lần';
                    const priceFormatted = item.gia != null ? `${Number(item.gia).toLocaleString('vi-VN')} đ` : 'Theo biểu giá';

                    return (
                      <tr key={item.id || code || idx} className="even:bg-slate-50/50 hover:bg-sky-50/60 transition-colors">
                        <td className="w-12 min-w-[48px] max-w-[48px] text-center align-middle h-9 px-2 py-1.5 border border-slate-300 font-mono text-xs text-slate-500">
                          {stt}
                        </td>
                        <td className="w-28 min-w-[112px] max-w-[112px] text-left align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <div className="min-w-0 truncate font-mono font-semibold text-sky-800" title={code}>
                            {code}
                          </div>
                        </td>
                        <td className="text-left align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <div className="min-w-0 truncate text-slate-800 font-medium" title={name}>
                            {name}
                          </div>
                        </td>
                        <td className="w-28 min-w-[112px] max-w-[112px] text-center align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <div className="min-w-0 truncate text-slate-600 text-xs" title={serviceType}>
                            {serviceType}
                          </div>
                        </td>
                        <td className="w-24 min-w-[96px] max-w-[96px] text-center align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <div className="min-w-0 truncate text-slate-700" title={unit}>
                            {unit}
                          </div>
                        </td>
                        <td className="w-32 min-w-[128px] max-w-[128px] text-right align-middle h-9 px-2 py-1.5 border border-slate-300 font-mono font-semibold text-slate-900">
                          <div className="min-w-0 truncate" title={priceFormatted}>
                            {priceFormatted}
                          </div>
                        </td>
                        <td className="w-28 min-w-[112px] max-w-[112px] text-center align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <span className="badge green" title="Dịch vụ đang hoạt động">
                            Hoạt động
                          </span>
                        </td>
                        <td className="w-24 min-w-[96px] max-w-[96px] text-center align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <button
                            type="button"
                            className="catalog-action-btn"
                            title={`Sao chép mã ${code}`}
                            onClick={() => copyToClipboard(code, 'mã dịch vụ')}
                          >
                            <i className="fa-regular fa-copy"></i> Sao chép
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {activeCatalog === 'drug' && paginatedItems.map((item, idx) => {
                    const stt = (page - 1) * pageSize + idx + 1;
                    const code = item.maThuoc || `TH-${item.id}`;
                    const name = item.tenThuoc || '';
                    const activeIngredient = `${item.hoatChat || ''} ${item.hamLuong ? `(${item.hamLuong})` : ''}`.trim() || '—';
                    const unit = item.donViTinh || 'Viên';
                    const stock = item.soLuongTon ?? 0;
                    const inStock = (item.soLuongTon ?? 10) > 0;

                    return (
                      <tr key={item.id || code || idx} className="even:bg-slate-50/50 hover:bg-sky-50/60 transition-colors">
                        <td className="w-12 min-w-[48px] max-w-[48px] text-center align-middle h-9 px-2 py-1.5 border border-slate-300 font-mono text-xs text-slate-500">
                          {stt}
                        </td>
                        <td className="w-28 min-w-[112px] max-w-[112px] text-left align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <div className="min-w-0 truncate font-mono font-semibold text-sky-800" title={code}>
                            {code}
                          </div>
                        </td>
                        <td className="w-56 min-w-[180px] max-w-[240px] text-left align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <div className="min-w-0 truncate font-semibold text-slate-800" title={name}>
                            {name}
                          </div>
                        </td>
                        <td className="text-left align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <div className="min-w-0 truncate text-slate-600 text-xs" title={activeIngredient}>
                            {activeIngredient}
                          </div>
                        </td>
                        <td className="w-24 min-w-[96px] max-w-[96px] text-center align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <div className="min-w-0 truncate text-slate-700" title={unit}>
                            {unit}
                          </div>
                        </td>
                        <td className="w-24 min-w-[96px] max-w-[96px] text-right align-middle h-9 px-2 py-1.5 border border-slate-300 font-mono font-semibold text-slate-900">
                          <div className="min-w-0 truncate" title={`${stock.toLocaleString('vi-VN')} ${unit}`}>
                            {stock.toLocaleString('vi-VN')}
                          </div>
                        </td>
                        <td className="w-28 min-w-[112px] max-w-[112px] text-center align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <span className={`badge ${inStock ? 'green' : 'red'}`} title={inStock ? `Còn ${stock} ${unit}` : 'Tồn kho đã hết'}>
                            {inStock ? 'Còn hàng' : 'Hết hàng'}
                          </span>
                        </td>
                        <td className="w-24 min-w-[96px] max-w-[96px] text-center align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <button
                            type="button"
                            className="catalog-action-btn"
                            title={`Sao chép mã ${code}`}
                            onClick={() => copyToClipboard(code, 'mã thuốc')}
                          >
                            <i className="fa-regular fa-copy"></i> Sao chép
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {activeCatalog === 'history' && paginatedItems.map((item, idx) => {
                    const stt = (page - 1) * pageSize + idx + 1;
                    const code = item.value || '';
                    const label = item.label || '';
                    const description = item.description || 'Tiền sử bệnh lý lâm sàng';

                    return (
                      <tr key={code || idx} className="even:bg-slate-50/50 hover:bg-sky-50/60 transition-colors">
                        <td className="w-12 min-w-[48px] max-w-[48px] text-center align-middle h-9 px-2 py-1.5 border border-slate-300 font-mono text-xs text-slate-500">
                          {stt}
                        </td>
                        <td className="w-28 min-w-[112px] max-w-[112px] text-left align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <div className="min-w-0 truncate font-mono font-semibold text-sky-800" title={code}>
                            {code}
                          </div>
                        </td>
                        <td className="w-56 min-w-[180px] max-w-[240px] text-left align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <div className="min-w-0 truncate font-semibold text-slate-800" title={label}>
                            {label}
                          </div>
                        </td>
                        <td className="text-left align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <div className="min-w-0 truncate text-slate-600 text-xs" title={description}>
                            {description}
                          </div>
                        </td>
                        <td className="w-28 min-w-[112px] max-w-[112px] text-center align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <span className="badge blue" title="Phân loại tiền sử chuẩn hóa">
                            Chuẩn hóa
                          </span>
                        </td>
                        <td className="w-24 min-w-[96px] max-w-[96px] text-center align-middle h-9 px-2 py-1.5 border border-slate-300">
                          <button
                            type="button"
                            className="catalog-action-btn"
                            title={`Sao chép mã ${code}`}
                            onClick={() => copyToClipboard(code, 'mã phân loại')}
                          >
                            <i className="fa-regular fa-copy"></i> Sao chép
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Excel Status Bar & Pagination Footer */}
        <div className="catalog-pagination">
          <div className="pagination-info">
            <span>Hiển thị</span>
            <strong>{totalCount === 0 ? 0 : (page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalCount)}</strong>
            <span>trên tổng số</span>
            <strong>{totalCount.toLocaleString('vi-VN')}</strong>
            <span>bản ghi</span>
          </div>

          <div className="pagination-controls">
            <div className="page-size-selector">
              <span>Dòng/trang:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="page-buttons">
              <button
                type="button"
                className="page-nav-btn"
                disabled={page <= 1}
                onClick={() => setPage(1)}
                title="Về trang đầu"
              >
                <i className="fa-solid fa-angles-left"></i>
              </button>
              <button
                type="button"
                className="page-nav-btn"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                title="Trang trước"
              >
                <i className="fa-solid fa-angle-left"></i>
              </button>

              <span className="page-current">
                Trang <strong>{page}</strong> / {totalPages}
              </span>

              <button
                type="button"
                className="page-nav-btn"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                title="Trang sau"
              >
                <i className="fa-solid fa-angle-right"></i>
              </button>
              <button
                type="button"
                className="page-nav-btn"
                disabled={page >= totalPages}
                onClick={() => setPage(totalPages)}
                title="Đến trang cuối"
              >
                <i className="fa-solid fa-angles-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogPanel;