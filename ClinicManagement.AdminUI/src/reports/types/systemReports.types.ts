export interface SystemReportsOverviewDto {
  kpis: {
    totalVisits: number;
    completedVisits: number;
    pendingVisits: number;
    canceledVisits: number;
    completionRate: number;
    totalRevenue: number;
    collectedRevenue: number;
    insurancePaid: number;
    pendingDebt: number;
    totalMedicines: number;
    lowStockMedicines: number;
    expiringBatches: number;
    inventoryValue: number;
    staffCount: number;
    doctorsCount: number;
  };
  trends: Array<{
    date: string;
    visits: number;
    completed: number;
    revenue: number;
  }>;
  departmentRevenue: Array<{
    name: string;
    value: number;
  }>;
}

export interface SystemReportsClinicalDto {
  baseReport: {
    kpis: {
      revenue: number;
      completedVisits: number;
      activeDoctors: number;
      openDepartments: number;
      bhytReimbursementRate: number | null;
      patientSatisfactionRate?: number | null;
    };
    revenueByDepartment: Array<{
      name: string;
      value: number;
      percentage?: number;
    }>;
    doctorKpis: Array<{
      rank: number;
      name: string;
      department: string;
      count: number;
      rating?: string;
      revenue?: number;
    }>;
  };
  topDiagnoses: Array<{
    code: string;
    name: string;
    count: number;
  }>;
  clsBreakdown: Array<{
    type: string;
    count: number;
    totalAmount: number;
  }>;
}

export interface SystemReportsFinanceDto {
  revenue: {
    tongDoanhThu: number;
    daThanhToan: number;
    chuaThanhToan: number;
    baoHiemChiTra: number;
    soHoaDon: number;
    doanhThuTheoKy: Array<{
      thoiGian: string;
      doanhThu: number;
      daThu: number;
      conNo: number;
      soHoaDon: number;
    }>;
  };
  cashflow: {
    tongThu: number;
    tongChi: number;
    loiNhuanGop: number;
    soPhieuThu: number;
    soPhieuChi: number;
  };
  paymentMethods: Array<{
    method: string;
    amount: number;
    count: number;
  }>;
}

export interface SystemReportsInventoryDto {
  kpis: {
    totalSkus: number;
    totalStockValue: number;
    lowStockCount: number;
    expiringCount: number;
  };
  lowStockList: Array<{
    itemId: number;
    itemName: string;
    itemCode: string;
    currentStock: number;
    minStock: number;
    unit: string;
    warehouse: string;
  }>;
  expiringList: Array<{
    itemId: number;
    itemName: string;
    batchNumber: string;
    expiryDate: string;
    stock: number;
    warehouse: string;
  }>;
  topDispensed: Array<{
    id: number;
    name: string;
    unit: string;
    quantity: number;
    totalRevenue: number;
  }>;
}

export interface SystemReportsProductivityDto {
  doctorRankings: Array<{
    doctorId: number;
    doctorName: string;
    department: string;
    totalVisits: number;
    completedVisits: number;
    prescriptionsCount: number;
    clsOrdersCount: number;
    revenueGenerated: number;
  }>;
  roomUtilization: Array<{
    roomId: number;
    roomName: string;
    department: string;
    visitsCount: number;
  }>;
}
