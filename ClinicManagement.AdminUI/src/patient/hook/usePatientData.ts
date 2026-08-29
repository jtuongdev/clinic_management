import { useState, useEffect, useCallback } from 'react';
import { patientApi } from '../api/patient.api';
import { Patient, BenhNhanDto, PatientStatus } from '../type/patient.types';

export const usePatientData = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      // Tách hẳn 2 trường hợp để TypeScript không bị lỗi
      if (keyword) {
        // TH1: Có tìm kiếm -> Gọi API Search (trả về mảng trực tiếp)
        const res = await patientApi.search(keyword);
        if (res.data.success) {
          const dtos = res.data.data; 
          
          const mappedPatients: Patient[] = dtos.map((item: BenhNhanDto) => ({
            id: item.id,
            maBN: item.maBenhNhanNoiBo,
            name: item.hoTen,
            gender: item.gioiTinh as 'M' | 'F',
            dob: item.ngaySinh,
            phone: item.dienThoai,
            dept: item.tenKhoa,
            status: item.trangThaiLuotKham as PatientStatus,
          }));

          setPatients(mappedPatients);
          setTotal(mappedPatients.length); 
        }
      } else {
        const res = await patientApi.getPaged({ pageIndex, pageSize });
        if (res.data.success) {
          const dtos = res.data.data.items;
          
          const mappedPatients: Patient[] = dtos.map((item: BenhNhanDto) => ({
            id: item.id,
            maBN: item.maBenhNhanNoiBo,
            name: item.hoTen,
            gender: item.gioiTinh as 'M' | 'F',
            dob: item.ngaySinh,
            phone: item.dienThoai,
            dept: item.tenKhoa,
            status: item.trangThaiLuotKham as PatientStatus,
          }));

          setPatients(mappedPatients);
          setTotal(res.data.data.totalCount); 
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bệnh nhân:", error);
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, keyword]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return {
    data: patients,
    loading,
    total,
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    keyword,
    setKeyword,
    refetch: fetchPatients
  };
};