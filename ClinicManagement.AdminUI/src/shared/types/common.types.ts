export interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: string;
  badgeColor?: 'blue' | 'green' | 'orange' | 'red';
}

export interface SubMenuItem {
  key: string;
  icon?: React.ReactNode;
  label: string;
  path: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}