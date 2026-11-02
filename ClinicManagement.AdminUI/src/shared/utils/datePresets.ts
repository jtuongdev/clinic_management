import dayjs, { Dayjs } from 'dayjs';

export interface DateRangePresetItem {
  label: string;
  value: [Dayjs, Dayjs] | (() => [Dayjs, Dayjs]);
}

/**
 * Bộ chọn nhanh khoảng thời gian chuẩn tiếng Việt cho RangePicker
 * Dùng song song với 2 cuốn lịch hiển thị đồng thời
 */
export const dateRangePresets: DateRangePresetItem[] = [
  {
    label: 'Hôm nay',
    value: () => [dayjs().startOf('day'), dayjs().endOf('day')],
  },
  {
    label: 'Hôm qua',
    value: () => [
      dayjs().subtract(1, 'day').startOf('day'),
      dayjs().subtract(1, 'day').endOf('day'),
    ],
  },
  {
    label: '7 ngày qua',
    value: () => [
      dayjs().subtract(6, 'day').startOf('day'),
      dayjs().endOf('day'),
    ],
  },
  {
    label: '30 ngày qua',
    value: () => [
      dayjs().subtract(29, 'day').startOf('day'),
      dayjs().endOf('day'),
    ],
  },
  {
    label: 'Tháng này',
    value: () => [dayjs().startOf('month'), dayjs().endOf('month')],
  },
  {
    label: 'Tháng trước',
    value: () => [
      dayjs().subtract(1, 'month').startOf('month'),
      dayjs().subtract(1, 'month').endOf('month'),
    ],
  },
  {
    label: 'Quý này',
    value: () => {
      const qMonth = Math.floor(dayjs().month() / 3) * 3;
      return [
        dayjs().month(qMonth).startOf('month'),
        dayjs().month(qMonth + 2).endOf('month'),
      ];
    },
  },
];

export const singleDatePresets = [
  {
    label: 'Hôm nay',
    value: () => dayjs(),
  },
  {
    label: 'Hôm qua',
    value: () => dayjs().subtract(1, 'day'),
  },
  {
    label: 'Ngày mai',
    value: () => dayjs().add(1, 'day'),
  },
];
