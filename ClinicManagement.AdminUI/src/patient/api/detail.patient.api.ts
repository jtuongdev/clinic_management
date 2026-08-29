import { api } from '../../shared/api/axios.api';
import { type ApiResponse } from '../../shared/types/common.types';
import { type BenhNhanProfileDto } from '../type/profile.patient.type';
import type { PagedResultVisits } from '../type/visit.patient.type';
import type { PagedResultInvoices } from '../type/invoice.patient.type';

export const detailpatientApi = {
  getProfile: (id: number) =>
    api.get<ApiResponse<BenhNhanProfileDto>>(`/BenhNhan/${id}/profile`),

  getVisits: (id: number, params?: {
    pageIndex?: number;
    pageSize?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }) => {
    return api.get<ApiResponse<PagedResultVisits>>(`/BenhNhan/${id}/visits`, { params });
  },

  getInvoices: (id: number, params?: {
    pageIndex?: number;
    pageSize?: number;
    status?: string;
  }) => {
    return api.get<ApiResponse<PagedResultInvoices>>(`/BenhNhan/${id}/invoices`, { params });
  },
};