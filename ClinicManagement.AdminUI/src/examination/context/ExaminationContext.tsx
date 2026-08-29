import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { examinationApi } from '../api/examination.api';
import { khoaApi } from '../../department/api/department.api';
import { BacSiApi } from '../../employee/docter/api/docter.api';
import {
  CoSoDto,
  KhoaDto,
  ThongKeLuotKhamDto,
  LuotKhamDangXuLyDto,
  BenhNhanListDto,
  ThongKeBenhNhanDto,
  LuotKhamItemDto,
  PagedResultLuotKham,
  ThongKeKhamBenhDto,
  ChiDinhDichVuListDto,
  ThongKeChiDinhDichVuDto,
} from '../type/examination.types';
import { DonThuocListDto, ThongKeDonThuocDto, } from '../type/prescription.examination.type';
import { KhoaOverviewDto } from '../../department/type/department.type';
import { BacSiTrucDto } from '../../employee/docter/type/docter.type';

interface ExaminationContextType {
  // State hiện có
  coSos: CoSoDto[];
  khoas: KhoaDto[];
  thongKe: ThongKeLuotKhamDto | null;
  khoaOverview: KhoaOverviewDto[];
  bacSiTruc: BacSiTrucDto[];
  luotKhamDangXuLy: LuotKhamDangXuLyDto[];
  loadingCoSo: boolean;
  loadingKhoa: boolean;
  loadingThongKe: boolean;
  loadingKhoaOverview: boolean;
  loadingBacSiTruc: boolean;
  loadingLuotKhamDangXuLy: boolean;
  error: string | null;
  filters: { maCoSo?: number; maKhoa?: number };

  // Bệnh nhân
  benhNhanList: BenhNhanListDto[];
  thongKeBenhNhan: ThongKeBenhNhanDto | null;
  benhNhanTotal: number;
  loadingBenhNhan: boolean;
  loadingThongKeBenhNhan: boolean;

  // Lượt khám và thống kê khám bệnh
  luotKhamList: LuotKhamItemDto[];
  luotKhamTotal: number;
  thongKeKhamBenh: ThongKeKhamBenhDto | null;
  loadingLuotKham: boolean;
  loadingThongKeKhamBenh: boolean;

  // CLS (Chỉ định dịch vụ)
  chiDinhDichVuList: ChiDinhDichVuListDto[];
  chiDinhDichVuTotal: number;
  thongKeChiDinhDichVu: ThongKeChiDinhDichVuDto | null;
  loadingChiDinhDichVu: boolean;
  loadingThongKeChiDinhDichVu: boolean;

  // DonThuoc
  // Đơn thuốc
  donThuocList: DonThuocListDto[];
  donThuocTotal: number;
  thongKeDonThuoc: ThongKeDonThuocDto | null;
  loadingDonThuoc: boolean;
  loadingThongKeDonThuoc: boolean;

  // Hàm hiện có
  fetchCoSos: () => Promise<void>;
  fetchKhoas: (maCoSo: number) => Promise<void>;
  fetchThongKe: () => Promise<void>;
  fetchKhoaOverview: () => Promise<void>;
  fetchBacSiTruc: () => Promise<void>;
  fetchLuotKhamDangXuLy: () => Promise<void>;
  setFilters: (filters: { maCoSo?: number; maKhoa?: number }) => void;

  // Hàm bệnh nhân
  fetchBenhNhanList: (params: {
    pageIndex?: number;
    pageSize?: number;
    keyword?: string;
    trangThai?: string;
    maKhoa?: number;
    maCoSo?: number;
  }) => Promise<void>;
  fetchThongKeBenhNhan: (params?: { maCoSo?: number; maKhoa?: number }) => Promise<void>;

  // Hàm lượt khám
  fetchLuotKhamList: (params: {
    pageIndex?: number;
    pageSize?: number;
    maBenhNhan?: number;
    maBacSi?: number;
    maKhoa?: number;
    trangThai?: string;
    fromDate?: string;
    toDate?: string;
  }) => Promise<void>;
  fetchThongKeKhamBenh: (params?: { maCoSo?: number; maKhoa?: number }) => Promise<void>;

  // Hàm CLS
  fetchChiDinhDichVuList: (params: {
    pageIndex?: number;
    pageSize?: number;
    maKhoa?: number;
    maBacSi?: number;
    maBenhNhan?: number;
    loaiDichVu?: string;
    trangThai?: string;
    fromDate?: string;
    toDate?: string;
  }) => Promise<void>;
  fetchThongKeChiDinhDichVu: (params?: { maKhoa?: number; maBacSi?: number }) => Promise<void>;

  //Đon Thuốc
    fetchDonThuocList: (params: {
    pageIndex?: number;
    pageSize?: number;
    maKhoa?: number;
    maBacSi?: number;
    maBenhNhan?: number;
    trangThai?: string;
    fromDate?: string;
    toDate?: string;
  }) => Promise<void>;
  fetchThongKeDonThuoc: (params?: { maCoSo?: number; maKhoa?: number }) => Promise<void>;

}
  
export const ExaminationContext = createContext<ExaminationContextType | undefined>(undefined);

export const ExaminationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // === States CoSo ===
  const [coSos, setCoSos] = useState<CoSoDto[]>([]);
  const [khoas, setKhoas] = useState<KhoaDto[]>([]);
  const [thongKe, setThongKe] = useState<ThongKeLuotKhamDto | null>(null);
  const [khoaOverview, setKhoaOverview] = useState<KhoaOverviewDto[]>([]);
  const [bacSiTruc, setBacSiTruc] = useState<BacSiTrucDto[]>([]);
  const [luotKhamDangXuLy, setLuotKhamDangXuLy] = useState<LuotKhamDangXuLyDto[]>([]);

  const [loadingCoSo, setLoadingCoSo] = useState(false);
  const [loadingKhoa, setLoadingKhoa] = useState(false);
  const [loadingThongKe, setLoadingThongKe] = useState(false);
  const [loadingKhoaOverview, setLoadingKhoaOverview] = useState(false);
  const [loadingBacSiTruc, setLoadingBacSiTruc] = useState(false);
  const [loadingLuotKhamDangXuLy, setLoadingLuotKhamDangXuLy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ maCoSo?: number; maKhoa?: number }>({});

  // === States bệnh nhân ===
  const [benhNhanList, setBenhNhanList] = useState<BenhNhanListDto[]>([]);
  const [thongKeBenhNhan, setThongKeBenhNhan] = useState<ThongKeBenhNhanDto | null>(null);
  const [benhNhanTotal, setBenhNhanTotal] = useState(0);
  const [loadingBenhNhan, setLoadingBenhNhan] = useState(false);
  const [loadingThongKeBenhNhan, setLoadingThongKeBenhNhan] = useState(false);

  // === States lượt khám ===
  const [luotKhamList, setLuotKhamList] = useState<LuotKhamItemDto[]>([]);
  const [luotKhamTotal, setLuotKhamTotal] = useState(0);
  const [thongKeKhamBenh, setThongKeKhamBenh] = useState<ThongKeKhamBenhDto | null>(null);
  const [loadingLuotKham, setLoadingLuotKham] = useState(false);
  const [loadingThongKeKhamBenh, setLoadingThongKeKhamBenh] = useState(false);

  // === States CLS ===
  const [chiDinhDichVuList, setChiDinhDichVuList] = useState<ChiDinhDichVuListDto[]>([]);
  const [chiDinhDichVuTotal, setChiDinhDichVuTotal] = useState(0);
  const [thongKeChiDinhDichVu, setThongKeChiDinhDichVu] = useState<ThongKeChiDinhDichVuDto | null>(null);
  const [loadingChiDinhDichVu, setLoadingChiDinhDichVu] = useState(false);
  const [loadingThongKeChiDinhDichVu, setLoadingThongKeChiDinhDichVu] = useState(false);

  // states Đơn Thuốc
  const [donThuocList, setDonThuocList] = useState<DonThuocListDto[]>([]);
  const [donThuocTotal, setDonThuocTotal] = useState(0);
  const [thongKeDonThuoc, setThongKeDonThuoc] = useState<ThongKeDonThuocDto | null>(null);
  const [loadingDonThuoc, setLoadingDonThuoc] = useState(false);
  const [loadingThongKeDonThuoc, setLoadingThongKeDonThuoc] = useState(false);


  // === Hàm hiện có (giữ nguyên) ===
  const fetchCoSos = useCallback(async () => {
    setLoadingCoSo(true);
    setError(null);
    try {
      const res = await examinationApi.getCoSos();
      setCoSos(res.data.data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách cơ sở');
    } finally {
      setLoadingCoSo(false);
    }
  }, []);

  const fetchKhoas = useCallback(async (maCoSo: number) => {
    if (!maCoSo) return;
    setLoadingKhoa(true);
    setError(null);
    try {
      const res = await examinationApi.getKhoas(maCoSo);
      setKhoas(res.data.data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách khoa');
    } finally {
      setLoadingKhoa(false);
    }
  }, []);

  const fetchThongKe = useCallback(async () => {
    setLoadingThongKe(true);
    setError(null);
    try {
      const params: any = {};
      if (filters.maCoSo) params.maCoSo = filters.maCoSo;
      if (filters.maKhoa) params.maKhoa = filters.maKhoa;
      const res = await examinationApi.getThongKe(params);
      setThongKe(res.data.data || null);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu thống kê');
    } finally {
      setLoadingThongKe(false);
    }
  }, [filters]);

  const fetchKhoaOverview = useCallback(async () => {
    setLoadingKhoaOverview(true);
    setError(null);
    try {
      const res = await khoaApi.getKhoaOverview(filters.maCoSo);
      setKhoaOverview(res.data.data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu khoa');
    } finally {
      setLoadingKhoaOverview(false);
    }
  }, [filters]);

  const fetchBacSiTruc = useCallback(async () => {
    setLoadingBacSiTruc(true);
    setError(null);
    try {
      const res = await BacSiApi.getBacSiTruc(filters);
      setBacSiTruc(res.data.data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách bác sĩ trực');
    } finally {
      setLoadingBacSiTruc(false);
    }
  }, [filters]);

  const fetchLuotKhamDangXuLy = useCallback(async () => {
    setLoadingLuotKhamDangXuLy(true);
    setError(null);
    try {
      const res = await examinationApi.getLuotKhamDangXuLy(filters);
      setLuotKhamDangXuLy(res.data.data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách lượt khám đang xử lý');
    } finally {
      setLoadingLuotKhamDangXuLy(false);
    }
  }, [filters]);

  // === Hàm bệnh nhân ===
  const fetchBenhNhanList = useCallback(async (params: {
    pageIndex?: number;
    pageSize?: number;
    keyword?: string;
    trangThai?: string;
    maKhoa?: number;
    maCoSo?: number;
  }) => {
    setLoadingBenhNhan(true);
    setError(null);
    try {
      const res = await examinationApi.getBenhNhanList(params);
      const result = res.data.data;
      setBenhNhanList(result?.items || []);
      setBenhNhanTotal(result?.totalCount || 0);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách bệnh nhân');
    } finally {
      setLoadingBenhNhan(false);
    }
  }, []);

  const fetchThongKeBenhNhan = useCallback(async (params?: { maCoSo?: number; maKhoa?: number }) => {
    setLoadingThongKeBenhNhan(true);
    setError(null);
    try {
      const res = await examinationApi.getThongKeBenhNhan(params);
      setThongKeBenhNhan(res.data.data || null);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thống kê bệnh nhân');
    } finally {
      setLoadingThongKeBenhNhan(false);
    }
  }, []);

  // === Hàm lượt khám ===
  const fetchLuotKhamList = useCallback(async (params: {
    pageIndex?: number;
    pageSize?: number;
    maBenhNhan?: number;
    maBacSi?: number;
    maKhoa?: number;
    trangThai?: string;
    fromDate?: string;
    toDate?: string;
  }) => {
    setLoadingLuotKham(true);
    setError(null);
    try {
      const res = await examinationApi.getLuotKhamList(params);
      const result = res.data.data as PagedResultLuotKham;
      setLuotKhamList(result?.items || []);
      setLuotKhamTotal(result?.totalCount || 0);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách lượt khám');
    } finally {
      setLoadingLuotKham(false);
    }
  }, []);

  const fetchThongKeKhamBenh = useCallback(async (params?: { maCoSo?: number; maKhoa?: number }) => {
    setLoadingThongKeKhamBenh(true);
    setError(null);
    try {
      const res = await examinationApi.getThongKeKhamBenh(params);
      setThongKeKhamBenh(res.data.data || null);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thống kê khám bệnh');
    } finally {
      setLoadingThongKeKhamBenh(false);
    }
  }, []);

  // === Hàm CLS ===
  const fetchChiDinhDichVuList = useCallback(async (params: {
    pageIndex?: number;
    pageSize?: number;
    maKhoa?: number;
    maBacSi?: number;
    maBenhNhan?: number;
    loaiDichVu?: string;
    trangThai?: string;
    fromDate?: string;
    toDate?: string;
  }) => {
    setLoadingChiDinhDichVu(true);
    setError(null);
    try {
      const res = await examinationApi.getChiDinhDichVuList(params);
      const result = res.data.data;
      setChiDinhDichVuList(result?.items || []);
      setChiDinhDichVuTotal(result?.totalCount || 0);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách chỉ định dịch vụ');
    } finally {
      setLoadingChiDinhDichVu(false);
    }
  }, []);

  const fetchThongKeChiDinhDichVu = useCallback(async (params?: { maKhoa?: number; maBacSi?: number }) => {
    setLoadingThongKeChiDinhDichVu(true);
    setError(null);
    try {
      const res = await examinationApi.getThongKeChiDinhDichVu(params);
      setThongKeChiDinhDichVu(res.data.data || null);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thống kê chỉ định dịch vụ');
    } finally {
      setLoadingThongKeChiDinhDichVu(false);
    }
  }, []);

  const fetchDonThuocList = useCallback(async (params: any) => {
    setLoadingDonThuoc(true);
    setError(null);
    try {
      const res = await examinationApi.getDonThuocList(params);
      const result = res.data.data;
      setDonThuocList(result?.items || []);
      setDonThuocTotal(result?.totalCount || 0);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đơn thuốc');
    } finally {
      setLoadingDonThuoc(false);
    }
  }, []);
  const fetchThongKeDonThuoc = useCallback(async (params?: { maCoSo?: number; maKhoa?: number }) => {
    setLoadingThongKeDonThuoc(true);
    setError(null);
    try {
      const res = await examinationApi.getThongKeDonThuoc(params);
      setThongKeDonThuoc(res.data.data || null);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thống kê đơn thuốc');
    } finally {
      setLoadingThongKeDonThuoc(false);
    }
  }, []);


  // === useEffect ===
  // 1. Load danh sách cơ sở khi component mount
  useEffect(() => {
    fetchCoSos();
  }, []);

  // Tự động chọn cơ sở đầu tiên nếu chưa có
  useEffect(() => {
    if (coSos.length > 0 && !filters.maCoSo) {
      setFilters({ maCoSo: coSos[0].id });
    }
  }, [coSos, filters.maCoSo]);

  // 2. Khi filters.maCoSo thay đổi, fetch dữ liệu
  useEffect(() => {
    if (filters.maCoSo) {
      fetchThongKe();
      fetchKhoaOverview();
      fetchBacSiTruc();
      fetchLuotKhamDangXuLy();
      fetchThongKeKhamBenh({ maCoSo: filters.maCoSo, maKhoa: filters.maKhoa });
    }
  }, [filters]);

  // === Value ===
  const value = {
    // Cũ
    coSos,
    khoas,
    thongKe,
    khoaOverview,
    bacSiTruc,
    luotKhamDangXuLy,
    loadingCoSo,
    loadingKhoa,
    loadingThongKe,
    loadingKhoaOverview,
    loadingBacSiTruc,
    loadingLuotKhamDangXuLy,
    error,
    filters,
    fetchCoSos,
    fetchKhoas,
    fetchThongKe,
    fetchKhoaOverview,
    fetchBacSiTruc,
    fetchLuotKhamDangXuLy,
    setFilters,
    // Bệnh nhân
    benhNhanList,
    thongKeBenhNhan,
    benhNhanTotal,
    loadingBenhNhan,
    loadingThongKeBenhNhan,
    fetchBenhNhanList,
    fetchThongKeBenhNhan,
    // Lượt khám
    luotKhamList,
    luotKhamTotal,
    thongKeKhamBenh,
    loadingLuotKham,
    loadingThongKeKhamBenh,
    fetchLuotKhamList,
    fetchThongKeKhamBenh,
    // CLS
    chiDinhDichVuList,
    chiDinhDichVuTotal,
    thongKeChiDinhDichVu,
    loadingChiDinhDichVu,
    loadingThongKeChiDinhDichVu,
    fetchChiDinhDichVuList,
    fetchThongKeChiDinhDichVu,
    // Don Thuoc
    donThuocList,
    donThuocTotal,
    thongKeDonThuoc,
    loadingDonThuoc,
    loadingThongKeDonThuoc,
    fetchDonThuocList,
    fetchThongKeDonThuoc,
  };

  return (
    <ExaminationContext.Provider value={value}>
      {children}
    </ExaminationContext.Provider>
  );
};

export const useExamination = () => {
  const context = useContext(ExaminationContext);
  if (!context) {
    throw new Error('useExamination must be used within ExaminationProvider');
  }
  return context;
};