import dayjs from 'dayjs';
import type { ItemDto } from '../../types/inventory.types';

// Hàm sinh số lô tự động chuẩn y tế (L{YYMMDD}-{MÃ}{RANDOM})
export const generateLotNumber = (item?: ItemDto, _index?: number): string => {
  const dateStr = dayjs().format('YYMMDD');
  const rawCode = item?.code || item?.name || 'LOT';
  const codePart = rawCode.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() || 'LOT';
  const rand = Math.floor(100 + Math.random() * 900);
  return `L${dateStr}-${codePart}${rand}`;
};

// Định dạng tiền tệ VND
export const formatCurrency = (amount: number): string =>
  (amount ?? 0).toLocaleString('vi-VN') + ' ₫';

// Danh sách các mốc số lượng nhanh theo đơn vị và quy cách của từng item
export const getQuickQuantities = (item?: ItemDto, currentUnit?: string) => {
  if (!item) {
    return [
      { val: 1, label: '1' },
      { val: 5, label: '5' },
      { val: 10, label: '10' },
      { val: 50, label: '50' },
      { val: 100, label: '100' },
    ];
  }

  const unitLower = (currentUnit || item.baseUnit || '').toLowerCase();
  const isSmallUnit = [
    'viên',
    'vien',
    'ong',
    'ống',
    'tép',
    'tep',
    'gói',
    'goi',
    'miếng',
    'mieng',
    'ml',
    'gram',
    'g',
    'cái',
    'cai',
  ].some((u) => unitLower.includes(u));

  // Nếu đơn vị đang chọn là đơn vị cơ bản nhỏ (như Viên, Ống...)
  if (isSmallUnit && (!currentUnit || currentUnit === item.baseUnit)) {
    const conversion = item.conversions?.[0];
    if (conversion && conversion.factor > 1) {
      const f = conversion.factor;
      return [
        { val: 10, label: '10' },
        { val: f, label: `${f} (1 ${conversion.unit})` },
        { val: f * 2, label: `${f * 2} (2 ${conversion.unit})` },
        { val: f * 5, label: `${f * 5} (5 ${conversion.unit})` },
        { val: f * 10, label: `${f * 10} (10 ${conversion.unit})` },
      ];
    }
    return [
      { val: 10, label: '10' },
      { val: 20, label: '20' },
      { val: 50, label: '50' },
      { val: 100, label: '100' },
      { val: 200, label: '200' },
      { val: 500, label: '500' },
    ];
  }

  // Nếu là đơn vị đóng gói lớn (Hộp, Thùng, Vỉ, Chai, Lọ, Bình, Túi...)
  return [
    { val: 1, label: '1' },
    { val: 5, label: '5' },
    { val: 10, label: '10' },
    { val: 20, label: '20' },
    { val: 50, label: '50' },
    { val: 100, label: '100' },
  ];
};
