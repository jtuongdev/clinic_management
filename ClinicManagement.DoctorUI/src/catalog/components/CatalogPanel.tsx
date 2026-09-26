import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { examinationApi } from '../../examination/api/examination.api';

type CatalogType = 'icd' | 'service' | 'drug' | 'history';

interface CatalogTabConfig {
  key: CatalogType;
  label: string;
  icon: string;
  badgeColor: string;
}

const CATALOG_TABS: CatalogTabConfig[] = [
  { key: 'icd', label: 'Danh Mục ICD-10', icon: 'fa-stethoscope', badgeColor: 'bg-blue-100 text-blue-800' },
  { key: 'service', label: 'Dịch Vụ Cận Lâm Sàng', icon: 'fa-flask-vial', badgeColor: 'bg-emerald-100 text-emerald-800' },
  { key: 'drug', label: 'Thuốc & Dược Phẩm', icon: 'fa-pills', badgeColor: 'bg-purple-100 text-purple-800' },
  { key: 'history', label: 'Tiền Sử & Dị Ứng', icon: 'fa-notes-medical', badgeColor: 'bg-amber-100 text-amber-800' },
];

const CatalogPanel: React.FC = () => {
  const [activeCatalog, setActiveCatalog] = useState<CatalogType>('icd');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);

  // Phân trang chuẩn bảng tính Excel
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  // Tải dữ liệu danh mục từ API
  const fetchCatalogData = useCallback(async (type: CatalogType, keyword: string) => {
    setIsLoading(true);
    setSelectedRowIndex(null);
    try {
      if (type === 'icd') {
        const res = await examinationApi.searchICD(keyword);
        const data = res.data?.data || [];
        setItems(data);
      } else if (type === 'service') {
        const res = await examinationApi.getServiceCatalog();
        let data = res.data?.data || [];
        if (keyword.trim()) {
          const kw = keyword.toLowerCase();
          data = data.filter(
            (s: any) =>
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
          data = data.filter(
            (h: any) =>
              h.label?.toLowerCase().includes(kw) ||
              h.description?.toLowerCase().includes(kw) ||
              h.value?.toLowerCase().includes(kw)
          );
        }
        setItems(data);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu danh mục:', err);
      toast.error('Không thể tải dữ liệu danh mục từ hệ thống.');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchCatalogData(activeCatalog, search);
    }, 250);
    return () => clearTimeout(timer);
  }, [activeCatalog, search, fetchCatalogData]);

  // Reset trang và tìm kiếm khi chuyển Tab
  const handleTabChange = (key: CatalogType) => {
    setActiveCatalog(key);
    setSearch('');
    setFilterCategory('ALL');
    setCurrentPage(1);
    setSelectedRowIndex(null);
  };

  // Trích xuất danh sách bộ lọc phân loại theo từng Tab
  const categoryOptions = useMemo(() => {
    if (activeCatalog === 'service') {
      const types = Array.from(new Set(items.map((i) => i.loaiDichVu).filter(Boolean)));
      return types;
    }
    if (activeCatalog === 'drug') {
      return ['Thuốc BHYT', 'Thuốc Ngoài BHYT', 'Còn tồn kho', 'Hết hàng'];
    }
    if (activeCatalog === 'icd') {
      const chapters = Array.from(
        new Set(items.map((i) => i.chuong || i.nhom || i.Chuong).filter(Boolean))
      );
      return chapters;
    }
    return [];
  }, [activeCatalog, items]);

  // Lọc dữ liệu sau bộ lọc phân loại
  const filteredItems = useMemo(() => {
    if (filterCategory === 'ALL') return items;

    if (activeCatalog === 'service') {
      return items.filter((i) => i.loaiDichVu === filterCategory);
    }
    if (activeCatalog === 'drug') {
      if (filterCategory === 'Thuốc BHYT') return items.filter((i) => i.laThuocBHYT);
      if (filterCategory === 'Thuốc Ngoài BHYT') return items.filter((i) => !i.laThuocBHYT);
      if (filterCategory === 'Còn tồn kho') return items.filter((i) => (i.soLuongKhaDung ?? i.tonKho ?? 0) > 0);
      if (filterCategory === 'Hết hàng') return items.filter((i) => (i.soLuongKhaDung ?? i.tonKho ?? 0) <= 0);
    }
    if (activeCatalog === 'icd') {
      return items.filter((i) => (i.chuong || i.nhom || i.Chuong) === filterCategory);
    }
    return items;
  }, [items, filterCategory, activeCatalog]);

  // Phân trang dữ liệu
  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Xuất file Excel / CSV chuẩn UTF-8
  const handleExportExcel = () => {
    if (filteredItems.length === 0) {
      toast('Không có dữ liệu để xuất file.');
      return;
    }

    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (activeCatalog === 'icd') {
      headers = ['STT', 'Mã ICD-10', 'Tên Bệnh / Chẩn Đoán', 'Chương Bệnh / Nhóm'];
      rows = filteredItems.map((item, idx) => {
        const code = item.maICD || item.maIcd || item.ma || item.code || item.MaICD || '';
        const name = item.tenICD || item.tenIcd || item.ten || item.name || item.TenICD || '';
        const chapter = item.chuong || item.nhom || item.Chuong || 'ICD-10';
        return [idx + 1, `"${code}"`, `"${name}"`, `"${chapter}"`];
      });
    } else if (activeCatalog === 'service') {
      headers = ['STT', 'Mã Dịch Vụ', 'Tên Dịch Vụ Kỹ Thuật / CLS', 'Loại Dịch Vụ', 'Đơn Giá (VNĐ)', 'ĐVT'];
      rows = filteredItems.map((item, idx) => [
        idx + 1,
        `"${item.ma || `DV-${item.id}`}"`,
        `"${item.ten || ''}"`,
        `"${item.loaiDichVu || ''}"`,
        item.gia || 0,
        `"${item.donViTinh || 'Lần'}"`,
      ]);
    } else if (activeCatalog === 'drug') {
      headers = ['STT', 'Mã Thuốc', 'Tên Thuốc Biệt Dược', 'Hoạt Chất', 'Hàm Lượng', 'Đường Dùng', 'ĐVT', 'Tồn Khả Dụng', 'Thuốc BHYT'];
      rows = filteredItems.map((item, idx) => [
        idx + 1,
        `"${item.maThuoc || `TH-${item.id}`}"`,
        `"${item.tenThuoc || ''}"`,
        `"${item.hoatChat || ''}"`,
        `"${item.hamLuong || ''}"`,
        `"${item.duongDung || 'Uống'}"`,
        `"${item.donViTinh || 'Viên'}"`,
        item.soLuongKhaDung ?? item.tonKho ?? 0,
        item.laThuocBHYT ? 'Có' : 'Không',
      ]);
    } else if (activeCatalog === 'history') {
      headers = ['STT', 'Mã Phân Loại', 'Tên Nhóm Tiền Sử', 'Mô Tả Chi Tiết'];
      rows = filteredItems.map((item, idx) => [
        idx + 1,
        `"${item.value || ''}"`,
        `"${item.label || ''}"`,
        `"${item.description || ''}"`,
      ]);
    }

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bang_Danh_Muc_${activeCatalog.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Đã xuất file bảng tính thành công!');
  };

  return (
    <div className="h-[calc(100vh-115px)] flex flex-col overflow-hidden bg-slate-100 font-sans text-slate-800">
      {/* ========================================================================= */}
      {/* 1. THANH TIÊU ĐỀ & CHUYỂN TAB DANH MỤC (Sub-Tabs Ribbon)                    */}
      {/* ========================================================================= */}
      <header className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
        {/* Nhóm Tabs danh mục */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800 mr-3 shrink-0">
            <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center text-xs shadow-xs">
              <i className="fa-solid fa-table-cells"></i>
            </div>
            <span>Tra Cứu Bảng Danh Mục</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {CATALOG_TABS.map((tab) => {
              const isActive = activeCatalog === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className={`h-8 px-3 rounded flex items-center gap-1.5 text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <i className={`fa-solid ${tab.icon} ${isActive ? 'text-blue-600' : 'text-slate-400'}`}></i>
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-600 text-white font-bold">
                      {totalItems}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nút hành động nhanh bên phải */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportExcel}
            title="Xuất bảng dữ liệu ra Excel (.CSV)"
            className="h-8 px-3 bg-white border border-slate-300 hover:border-emerald-600 hover:text-emerald-700 text-slate-700 text-xs font-semibold rounded flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <i className="fa-solid fa-file-excel text-emerald-600"></i>
            <span>Xuất Excel</span>
          </button>
          <button
            type="button"
            onClick={() => fetchCatalogData(activeCatalog, search)}
            title="Tải lại dữ liệu từ CSDL"
            className="h-8 px-2.5 bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-700 text-xs rounded flex items-center gap-1 transition-all shadow-xs cursor-pointer"
          >
            <i className={`fa-solid fa-arrows-rotate ${isLoading ? 'fa-spin text-blue-600' : ''}`}></i>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. THANH CÔNG CỤ TÌM KIẾM & BỘ LỌC (Toolbar / Filter Bar)                  */}
      {/* ========================================================================= */}
      <div className="h-11 bg-slate-50 border-b border-slate-200 px-4 flex items-center justify-between shrink-0 gap-3">
        {/* Khung tìm kiếm tức thì */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={`Tìm nhanh theo mã, tên ${
                activeCatalog === 'icd'
                  ? 'bệnh...'
                  : activeCatalog === 'service'
                  ? 'dịch vụ kỹ thuật...'
                  : activeCatalog === 'drug'
                  ? 'thuốc, hoạt chất...'
                  : 'tiền sử...'
              }`}
              className="w-full h-8 pl-8 pr-7 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
        </div>

        {/* Khung bộ lọc phân loại */}
        <div className="flex items-center gap-2">
          {categoryOptions.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-medium shrink-0">Phân loại:</span>
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8 px-2.5 text-xs bg-white border border-slate-300 rounded font-medium text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">-- Tất cả danh mục --</option>
                {categoryOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Chọn số dòng hiển thị mỗi trang */}
          <div className="flex items-center gap-1 text-xs text-slate-600 pl-2 border-l border-slate-200">
            <span className="text-[11px] text-slate-500">Dòng/trang:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-8 px-1.5 text-xs bg-white border border-slate-300 rounded font-mono font-semibold text-slate-700 cursor-pointer"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BẢNG DỮ LIỆU CHUẨN EXCEL (Excel-like Grid Table with Fixed STT Column) */}
      {/* ========================================================================= */}
      <main className="flex-1 min-h-0 bg-white overflow-auto relative border-b border-slate-200">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-slate-500">
            <i className="fa-solid fa-spinner fa-spin text-2xl text-blue-600 mb-2"></i>
            <span className="text-xs font-medium">Đang tải dữ liệu bảng tính từ máy chủ...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 text-lg mb-2">
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
            <p className="text-xs font-medium text-slate-500">Không tìm thấy mục dữ liệu nào phù hợp.</p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-2 text-xs text-blue-600 hover:underline cursor-pointer"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            )}
          </div>
        ) : (
          <table className="w-full border-collapse text-xs select-text">
            {/* Table Header kiểu Excel */}
            <thead className="sticky top-0 z-20 bg-slate-100 border-b border-slate-300 shadow-xs">
              {activeCatalog === 'icd' && (
                <tr className="divide-x divide-slate-300 text-slate-700 uppercase font-bold text-[11px] tracking-wider">
                  <th className="w-14 h-9 px-2 text-center font-mono font-bold bg-slate-200/90 text-slate-700 shrink-0">
                    STT
                  </th>
                  <th className="w-28 px-3 text-center">Mã ICD-10</th>
                  <th className="px-3 text-left">Tên Bệnh / Chẩn Đoán Y Khoa</th>
                  <th className="w-64 px-3 text-left">Chương Bệnh / Nhóm Bệnh</th>
                  <th className="w-28 px-3 text-center">Trạng Thái</th>
                </tr>
              )}

              {activeCatalog === 'service' && (
                <tr className="divide-x divide-slate-300 text-slate-700 uppercase font-bold text-[11px] tracking-wider">
                  <th className="w-14 h-9 px-2 text-center font-mono font-bold bg-slate-200/90 text-slate-700 shrink-0">
                    STT
                  </th>
                  <th className="w-32 px-3 text-center">Mã Dịch Vụ</th>
                  <th className="px-3 text-left">Tên Dịch Vụ Kỹ Thuật / CLS</th>
                  <th className="w-48 px-3 text-left">Loại Dịch Vụ</th>
                  <th className="w-36 px-3 text-right">Đơn Giá (VNĐ)</th>
                  <th className="w-24 px-3 text-center">ĐVT</th>
                  <th className="w-24 px-3 text-center">Áp Dụng</th>
                </tr>
              )}

              {activeCatalog === 'drug' && (
                <tr className="divide-x divide-slate-300 text-slate-700 uppercase font-bold text-[11px] tracking-wider">
                  <th className="w-14 h-9 px-2 text-center font-mono font-bold bg-slate-200/90 text-slate-700 shrink-0">
                    STT
                  </th>
                  <th className="w-32 px-3 text-center">Mã Thuốc</th>
                  <th className="w-64 px-3 text-left">Tên Thuốc Biệt Dược</th>
                  <th className="px-3 text-left">Hoạt Chất & Hàm Lượng</th>
                  <th className="w-28 px-3 text-center">Đường Dùng</th>
                  <th className="w-20 px-3 text-center">ĐVT</th>
                  <th className="w-32 px-3 text-right">Đơn Giá (VNĐ)</th>
                  <th className="w-28 px-3 text-right">Tồn Khả Dụng</th>
                  <th className="w-24 px-3 text-center">BHYT</th>
                </tr>
              )}

              {activeCatalog === 'history' && (
                <tr className="divide-x divide-slate-300 text-slate-700 uppercase font-bold text-[11px] tracking-wider">
                  <th className="w-14 h-9 px-2 text-center font-mono font-bold bg-slate-200/90 text-slate-700 shrink-0">
                    STT
                  </th>
                  <th className="w-40 px-3 text-center">Mã Phân Loại</th>
                  <th className="w-64 px-3 text-left">Tên Nhóm Tiền Sử / Dị Ứng</th>
                  <th className="px-3 text-left">Mô Tả Lâm Sàng Chi Tiết</th>
                  <th className="w-32 px-3 text-center">Phân Loại</th>
                </tr>
              )}
            </thead>

            {/* Table Body với đường viền ô lưới sắc nét như Excel */}
            <tbody className="divide-y divide-slate-200 bg-white">
              {currentItems.map((item, index) => {
                // Tính toán số thứ tự chính xác như dòng trong Excel
                const stt = startIndex + index + 1;
                const isSelected = selectedRowIndex === index;

                return (
                  <tr
                    key={item.id || item.maICD || item.maIcd || item.ma || item.maThuoc || item.value || index}
                    onClick={() => setSelectedRowIndex(index)}
                    className={`divide-x divide-slate-200 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/90 font-medium'
                        : index % 2 === 1
                        ? 'bg-slate-50/40 hover:bg-blue-50/50'
                        : 'bg-white hover:bg-blue-50/50'
                    }`}
                  >
                    {/* CỘT STT: Kiểu hàng số thứ tự Excel chuẩn */}
                    <td className="w-14 h-8 px-2 text-center font-mono text-[11px] font-semibold text-slate-500 bg-slate-100/70 select-none shrink-0 border-r border-slate-300">
                      {stt}
                    </td>

                    {/* DÒNG NỘI DUNG THEO TỪNG TAB */}
                    {activeCatalog === 'icd' && (
                      <>
                        <td className="w-28 px-3 py-1.5 text-center font-mono font-bold text-blue-700">
                          {item.maICD || item.maIcd || item.ma || item.code || item.MaICD}
                        </td>
                        <td className="px-3 py-1.5 text-slate-800 font-medium truncate max-w-md">
                          {item.tenICD || item.tenIcd || item.ten || item.name || item.TenICD}
                        </td>
                        <td className="w-64 px-3 py-1.5 text-slate-600 truncate">
                          <span className="px-1.5 py-0.5 rounded text-[11px] bg-slate-100 border border-slate-200 text-slate-700">
                            {item.chuong || item.nhom || item.Chuong || 'ICD-10 Quốc tế'}
                          </span>
                        </td>
                        <td className="w-28 px-3 py-1.5 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Sẵn sàng
                          </span>
                        </td>
                      </>
                    )}

                    {activeCatalog === 'service' && (
                      <>
                        <td className="w-32 px-3 py-1.5 text-center font-mono font-bold text-slate-700">
                          {item.ma || `DV-${item.id}`}
                        </td>
                        <td className="px-3 py-1.5 text-slate-900 font-medium truncate max-w-md">
                          {item.ten}
                        </td>
                        <td className="w-48 px-3 py-1.5 text-slate-600">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
                            {item.loaiDichVu || 'Khám & CLS'}
                          </span>
                        </td>
                        <td className="w-36 px-3 py-1.5 text-right font-mono font-bold text-slate-900">
                          {item.gia ? `${item.gia.toLocaleString('vi-VN')} đ` : 'Biểu giá chuẩn'}
                        </td>
                        <td className="w-24 px-3 py-1.5 text-center text-slate-600 font-mono">
                          {item.donViTinh || 'Lần'}
                        </td>
                        <td className="w-24 px-3 py-1.5 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Hoạt động
                          </span>
                        </td>
                      </>
                    )}

                    {activeCatalog === 'drug' && (
                      <>
                        <td className="w-32 px-3 py-1.5 text-center font-mono font-bold text-emerald-800">
                          {item.maThuoc || `TH-${item.id}`}
                        </td>
                        <td className="w-64 px-3 py-1.5 font-bold text-slate-900 truncate">
                          {item.tenThuoc}
                        </td>
                        <td className="px-3 py-1.5 text-slate-700 truncate max-w-xs">
                          <span>{item.hoatChat || '--'}</span>
                          {item.hamLuong && (
                            <span className="ml-1 text-slate-500 font-mono text-[11px]">
                              ({item.hamLuong})
                            </span>
                          )}
                        </td>
                        <td className="w-28 px-3 py-1.5 text-center text-slate-600">
                          {item.duongDung || 'Uống'}
                        </td>
                        <td className="w-20 px-3 py-1.5 text-center text-slate-600 font-mono">
                          {item.donViTinh || 'Viên'}
                        </td>
                        <td className="w-32 px-3 py-1.5 text-right font-mono font-medium text-slate-800">
                          {item.gia ? `${item.gia.toLocaleString('vi-VN')} đ` : '--'}
                        </td>
                        <td className="w-28 px-3 py-1.5 text-right font-mono font-bold">
                          {(item.soLuongKhaDung ?? item.tonKho ?? 0) > 0 ? (
                            <span className="text-emerald-700">
                              {(item.soLuongKhaDung ?? item.tonKho).toLocaleString('vi-VN')}
                            </span>
                          ) : (
                            <span className="text-rose-600 font-semibold">0 (Hết)</span>
                          )}
                        </td>
                        <td className="w-24 px-3 py-1.5 text-center">
                          {item.laThuocBHYT ? (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              BHYT
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>
                      </>
                    )}

                    {activeCatalog === 'history' && (
                      <>
                        <td className="w-40 px-3 py-1.5 text-center font-mono font-bold text-purple-700">
                          {item.value}
                        </td>
                        <td className="w-64 px-3 py-1.5 font-bold text-slate-900 truncate">
                          {item.label}
                        </td>
                        <td className="px-3 py-1.5 text-slate-600 truncate max-w-lg">
                          {item.description || 'Tiền sử bệnh án lâm sàng'}
                        </td>
                        <td className="w-32 px-3 py-1.5 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            Tiền sử y khoa
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 4. THANH ĐIỀU KHIỂN PHÂN TRANG EXCEL (Pagination Status Bar)                */}
      {/* ========================================================================= */}
      <footer className="h-10 bg-slate-50 border-t border-slate-300 px-4 flex items-center justify-between text-xs text-slate-600 shrink-0 select-none">
        {/* Số lượng dòng thống kê */}
        <div className="flex items-center gap-3">
          <div>
            Hiển thị <span className="font-mono font-bold text-slate-800">{totalItems > 0 ? startIndex + 1 : 0}</span> -{' '}
            <span className="font-mono font-bold text-slate-800">{endIndex}</span> trong tổng số{' '}
            <span className="font-mono font-bold text-blue-700">{totalItems}</span> dòng
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1 text-slate-500">
            <i className="fa-solid fa-server text-[11px]"></i>
            <span>Nguồn CSDL: Trung tâm Bệnh Viện</span>
          </div>
        </div>

        {/* Nút phân trang */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(1)}
            className="w-7 h-7 bg-white border border-slate-300 rounded flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Về trang đầu"
          >
            <i className="fa-solid fa-angles-left text-[10px]"></i>
          </button>
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="h-7 px-2 bg-white border border-slate-300 rounded flex items-center gap-1 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <i className="fa-solid fa-angle-left text-[10px]"></i>
            <span>Trước</span>
          </button>

          <span className="px-2 font-mono font-semibold text-slate-700">
            Trang {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="h-7 px-2 bg-white border border-slate-300 rounded flex items-center gap-1 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Tiếp</span>
            <i className="fa-solid fa-angle-right text-[10px]"></i>
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="w-7 h-7 bg-white border border-slate-300 rounded flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Đến trang cuối"
          >
            <i className="fa-solid fa-angles-right text-[10px]"></i>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default CatalogPanel;