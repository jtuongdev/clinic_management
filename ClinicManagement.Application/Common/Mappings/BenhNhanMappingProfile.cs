using AutoMapper;
using ClinicManagement.Application.DTOs.BenhNhan;
using ClinicManagement.Domain.Patient;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ClinicManagement.Application.Common.Mappings
{
    public class BenhNhanMappingProfile : Profile
    {
        public BenhNhanMappingProfile()
        {
            // ========== 1. BenhNhan -> BenhNhanDto ==========
            CreateMap<BenhNhan, BenhNhanDto>()
                .ForMember(dest => dest.GioiTinh, opt => opt.MapFrom(src => src.GioiTinh.ToString()))
                .ForMember(dest => dest.MaBenhNhanNoiBo,
                    opt => opt.MapFrom(src => src.BenhNhanCoSo.FirstOrDefault() != null
                        ? src.BenhNhanCoSo.First().MaBenhNhanNoiBo
                        : string.Empty))
                .ForMember(dest => dest.MaCoSo,
                    opt => opt.MapFrom(src => src.BenhNhanCoSo.FirstOrDefault() != null
                        ? src.BenhNhanCoSo.First().MaCoSo
                        : 0))
                .ForMember(dest => dest.TenCoSo,
                    opt => opt.MapFrom(src => src.BenhNhanCoSo.FirstOrDefault() != null && src.BenhNhanCoSo.First().CoSo != null
                        ? src.BenhNhanCoSo.First().CoSo.Ten
                        : string.Empty))
                .ForMember(dest => dest.TenKhoa,
                    opt => opt.MapFrom(src => src.LuotKhams
                        .OrderByDescending(l => l.NgayKham)
                        .FirstOrDefault() != null && src.LuotKhams.OrderByDescending(l => l.NgayKham).First().Khoa != null
                        ? src.LuotKhams.OrderByDescending(l => l.NgayKham).First().Khoa.Ten
                        : string.Empty))
                .ForMember(dest => dest.TrangThaiLuotKham,
                    opt => opt.MapFrom(src => src.LuotKhams
                        .OrderByDescending(l => l.NgayKham)
                        .FirstOrDefault() != null
                        ? src.LuotKhams.OrderByDescending(l => l.NgayKham).First().TrangThai.ToString()
                        : string.Empty))
                .ForMember(dest => dest.TienSuBenhs, opt => opt.MapFrom(src => src.TienSuBenhs))
                .ForMember(dest => dest.BaoHiems, opt => opt.MapFrom(src => src.BaoHiems));

            
            // ========== 3. TienSuBenh -> TienSuBenhDto ==========
            CreateMap<TienSuBenh, TienSuBenhDto>()
                .ForMember(dest => dest.LoaiTienSu, opt => opt.MapFrom(src => src.LoaiTienSu.ToString()));

            // ========== 4. BaoHiem -> BaoHiemDto ==========
            CreateMap<BaoHiem, BaoHiemDto>()
                .ForMember(dest => dest.LoaiBaoHiem, opt => opt.MapFrom(src => src.LoaiBaoHiem.ToString()))
                .ForMember(dest => dest.IsValid, opt => opt.MapFrom(src => src.IsValid()));

        }
    }
}