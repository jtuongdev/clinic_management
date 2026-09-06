import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarCheck,
  Bed,
  FileText,
  Receipt,
  HandCoins,
  ArrowLeftRight,
  ChartLine,
  Package,
  Cog,
  BarChart,
  FlaskRound as Flask,
  Pill,
  DollarSign,
  UsersRound,
  Building2,
  ClipboardList,
} from 'lucide-react';
import { MenuItem, SubMenuItem } from '../types/common.types';

export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export const menuGroups: MenuGroup[] = [
  {
    label: 'Tổng quan',
    items: [
      {
        key: 'dashboard',
        icon: <LayoutDashboard size={18} />,
        label: 'Dashboard',
        path: '/dashboard',
      },
    ],
  },
  {
    label: 'Khám & Điều trị',
    items: [
      {
        key: 'patients',
        icon: <Users size={18} />,
        label: 'Bệnh nhân',
        path: '/patients',
        badge: '12',
        badgeColor: 'blue',
      },
      {
        key: 'examinations',
        icon: <Stethoscope size={18} />,
        label: 'Khám bệnh',
        path: '/examination/overview',
        badge: '5',
        badgeColor: 'red',
      },
      {
        key: 'appointments',
        icon: <CalendarCheck size={18} />,
        label: 'Lịch hẹn',
        path: '/appointment',
      },
      {
        key: 'inpatient',
        icon: <Bed size={18} />,
        label: 'Nội trú',
        path: '/inpatient',
        badge: '32',
        badgeColor: 'blue',
      },
    ],
  },
  {
    label: 'Tài chính & Công nợ',
    items: [
      {
        key: 'invoices',
        icon: <FileText size={18} />,
        label: 'Hóa đơn',
        path: '/invoices',
        badge: '3',
        badgeColor: 'red',
      },
      {
        key: 'receipts',
        icon: <Receipt size={18} />,
        label: 'Phiếu thu / Hoàn',
        path: '/receipts',
      },
      {
        key: 'debts',
        icon: <HandCoins size={18} />,
        label: 'Công nợ',
        path: '/debts',
        badge: '8',
        badgeColor: 'orange',
      },
      {
        key: 'transactions',
        icon: <ArrowLeftRight size={18} />,
        label: 'Giao dịch',
        path: '/transactions',
      },
      {
        key: 'finance-reports',
        icon: <ChartLine size={18} />,
        label: 'Báo cáo tài chính',
        path: '/finance-reports',
      },
    ],
  },
    {
    label: 'Nhân sự & Lịch làm việc',
    items: [
      {
        key: 'employees',
        icon: <UsersRound size={18} />,
        label: 'Nhân viên',
        path: '/employees',
      },
      {
        key: 'schedules',
        icon: <CalendarCheck size={18} />,
        label: 'Lịch trực & Chấm công',
        path: '/schedules',
      },
    ],
  },
  {
    label: 'Kho & Hệ thống',
    items: [
      {
        key: 'inventory',
        icon: <Package size={18} />,
        label: 'Kho / Dược',
        path: '/inventory',
      },
      {
        key: 'settings',
        icon: <Cog size={18} />,
        label: 'Cấu hình',
        path: '/settings',
      },
      {
        key: 'reports',
        icon: <BarChart size={18} />,
        label: 'Báo cáo',
        path: '/reports',
      },
    ],
  },
];

export const getSubMenuItems = (key: string): SubMenuItem[] => {
  const subMenus: Record<string, SubMenuItem[]> = {
    patients: [
      { key: 'patient-list', label: 'Danh sách', path: '/patients' },
      { key: 'patient-detail', label: 'Chi tiết bệnh nhân', path: '/patient/detail/:id' },
    ],
    
    examinations: [
      { key: 'exam-overview', label: 'Tổng quan', path: '/examination/overview' },
      { key: 'exam-department', label: 'Khoa', path: '/examination/department' },
      { key: 'exam-patients', label: 'Bệnh nhân', path: '/examination/patients' },
      { key: 'exam-list', label: 'Khám bệnh', path: '/examination/list' },
      { key: 'exam-cls', label: 'CLS', path: '/examination/cls' },
      { key: 'exam-pharmacy', label: 'Dược', path: '/examination/pharmacy' },
      { key: 'exam-finance', label: 'Tài chính', path: '/examination/finance' },
      { key: 'exam-hr', label: 'Nhân sự', path: '/examination/hr' },
      { key: 'exam-facility', label: 'Cơ sở & Phòng', path: '/examination/facility' },
      { key: 'exam-reports', label: 'Báo cáo', path: '/examination/reports' },
    ],
    
    appointments: [
      { key: 'appointment-list', label: 'Danh sách', path: '/appointments' },
      { key: 'appointment-add', label: 'Tạo lịch hẹn', path: '/appointments/add' },
      { key: 'appointment-doctor', label: 'Lịch bác sĩ', path: '/appointments/doctor' },
    ],
    inpatient: [
      { key: 'inpatient-rooms', label: 'Phòng giường', path: '/inpatient/rooms' },
      { key: 'inpatient-treatment', label: 'Điều trị', path: '/inpatient/treatment' },
      { key: 'inpatient-discharge', label: 'Xuất viện', path: '/inpatient/discharge' },
    ],
    invoices: [
      { key: 'invoice-list', label: 'Danh sách', path: '/invoices' },
      { key: 'invoice-add', label: 'Tạo hóa đơn', path: '/invoices/add' },
      { key: 'invoice-payment', label: 'Thanh toán', path: '/invoices/payment' },
    ],
    receipts: [
      { key: 'receipt-list', label: 'Phiếu thu', path: '/receipts' },
      { key: 'receipt-refund', label: 'Phiếu hoàn tiền', path: '/receipts/refund' },
    ],
    debts: [
      { key: 'debt-patient', label: 'Công nợ bệnh nhân', path: '/debts/patient' },
      { key: 'debt-supplier', label: 'Công nợ nhà cung cấp', path: '/debts/supplier' },
    ],
    transactions: [
      { key: 'transaction-list', label: 'Danh sách giao dịch', path: '/transactions' },
      { key: 'transaction-electronic', label: 'Giao dịch điện tử', path: '/transactions/electronic' },
    ],
    'finance-reports': [
      { key: 'report-revenue', label: 'Doanh thu', path: '/finance-reports/revenue' },
      { key: 'report-debt', label: 'Công nợ', path: '/finance-reports/debt' },
      { key: 'report-income', label: 'Thu chi', path: '/finance-reports/income' },
    ],
    inventory: [
      { key: 'inventory-items', label: 'Thuốc & Vật tư', path: '/inventory' },
      { key: 'inventory-import', label: 'Nhập kho', path: '/inventory/import' },
      { key: 'inventory-export', label: 'Xuất kho', path: '/inventory/export' },
      { key: 'inventory-stock', label: 'Tồn kho', path: '/inventory/stock' },
      { key: 'inventory-supplier', label: 'Nhà cung cấp', path: '/inventory/supplier' },
    ],
    settings: [
      { key: 'setting-facility', label: 'Cơ sở', path: '/settings/facility' },
      { key: 'setting-department', label: 'Khoa', path: '/settings/department' },
      { key: 'setting-role', label: 'Vai trò & Quyền', path: '/settings/role' },
      { key: 'setting-params', label: 'Tham số', path: '/settings/params' },
      { key: 'setting-logs', label: 'Nhật ký', path: '/settings/logs' },
    ],
    reports: [
      { key: 'report-medical', label: 'Báo cáo khám', path: '/reports/medical' },
      { key: 'report-finance', label: 'Báo cáo tài chính', path: '/reports/finance' },
      { key: 'report-inventory', label: 'Báo cáo tồn kho', path: '/reports/inventory' },
    ],
    employees: [
      { key: 'employee-list', label: 'Danh sách nhân viên', path: '/employees' },
      { key: 'employee-payroll', label: 'Quản lý tính lương', path: '/employees?tab=payroll' },
    ],
  };
  return subMenus[key] || [];
};