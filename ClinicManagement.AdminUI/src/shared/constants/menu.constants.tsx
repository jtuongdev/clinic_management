import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarCheck,
  FileText,
  Receipt,
  HandCoins,
  ArrowLeftRight,
  ChartLine,
  Package,
  Cog,
  UsersRound,
  BarChart3,
} from 'lucide-react';
import { MenuItem, SubMenuItem } from '../types/common.types';

export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export const menuGroups: MenuGroup[] = [
  {
    label: 'Tổng quan & Báo cáo',
    items: [
      {
        key: 'dashboard',
        icon: <LayoutDashboard size={18} />,
        label: 'Dashboard',
        path: '/dashboard',
      },
      {
        key: 'reports',
        icon: <BarChart3 size={18} />,
        label: 'Báo cáo Hệ thống',
        path: '/reports',
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
    ],
  },
  {
    label: 'Tài chính & Viện phí',
    items: [
      {
        key: 'cashbook',
        icon: <ArrowLeftRight size={18} />,
        label: 'Sổ quỹ dòng tiền',
        path: '/cashbook',
        badge: '3',
        badgeColor: 'red',
      },
      {
        key: 'debts',
        icon: <HandCoins size={18} />,
        label: 'Quản lý công nợ',
        path: '/debts',
        badge: '8',
        badgeColor: 'orange',
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
    label: 'Kho & Cấu hình',
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
        path: '/settings/role',
      },
    ],
  },
];

export const getSubMenuItems = (key: string): SubMenuItem[] => {
  const subMenus: Record<string, SubMenuItem[]> = {
    reports: [
      { key: 'report-overview', label: 'Tổng quan Điều hành', path: '/reports?tab=overview' },
      { key: 'report-clinical', label: 'Lâm sàng & ICD-10', path: '/reports?tab=clinical' },
      { key: 'report-finance', label: 'Doanh thu & Dòng tiền', path: '/reports?tab=finance' },
      { key: 'report-inventory', label: 'Dược & Kho vật tư', path: '/reports?tab=inventory' },
      { key: 'report-productivity', label: 'Hiệu suất Bác sĩ', path: '/reports?tab=productivity' },
    ],
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
      { key: 'appointment-list', label: 'Danh sách lịch hẹn', path: '/appointment' },
    ],
    cashbook: [
      { key: 'cashbook-main', label: 'Sổ quỹ dòng tiền', path: '/cashbook' },
      { key: 'cashbook-invoices', label: 'Hóa đơn viện phí', path: '/invoices' },
      { key: 'cashbook-receipts', label: 'Sổ thu & Chốt ca', path: '/receipts' },
    ],
    debts: [
      { key: 'debt-all', label: 'Tất cả công nợ', path: '/debts' },
      { key: 'debt-patient', label: 'Công nợ bệnh nhân', path: '/debts/patient' },
      { key: 'debt-supplier', label: 'Công nợ nhà cung cấp', path: '/debts/supplier' },
    ],
    'finance-reports': [
      { key: 'report-revenue', label: 'Doanh thu', path: '/finance-reports/revenue' },
      { key: 'report-debt', label: 'Công nợ tổng hợp', path: '/finance-reports/debt' },
      { key: 'report-income', label: 'Thu chi & Dòng tiền', path: '/finance-reports/income' },
    ],
    inventory: [
      { key: 'inventory-items',     label: 'Thuốc & Vật tư',       path: '/inventory' },
      { key: 'inventory-stock',     label: 'Tồn kho',              path: '/inventory/stock' },
      { key: 'inventory-import',    label: 'Nhập kho',             path: '/inventory/import' },
      { key: 'inventory-dispense',  label: 'Cấp phát lẻ',          path: '/inventory/dispense' },
      { key: 'inventory-dept',      label: 'Cấp phát khoa phòng',  path: '/inventory/dept-dispense' },
      { key: 'inventory-suppliers', label: 'Nhà cung cấp',         path: '/inventory/suppliers' },
      { key: 'inventory-stocktake', label: 'Kiểm kê',              path: '/inventory/stocktake' },
    ],

    settings: [
      { key: 'setting-role', label: 'Vai trò & Quyền', path: '/settings/role' },
      { key: 'setting-params', label: 'Cấu hình tích hợp', path: '/settings/params' },
      { key: 'setting-logs', label: 'Nhật ký kiểm toán', path: '/settings/logs' },
    ],
    employees: [
      { key: 'employee-list', label: 'Hồ sơ nhân viên', path: '/employees' },
      { key: 'employee-schedule', label: 'Lịch trực & Chấm công', path: '/schedules' },
    ],
  };
  return subMenus[key] || [];
};