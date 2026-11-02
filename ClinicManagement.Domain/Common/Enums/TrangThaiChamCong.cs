using System.ComponentModel.DataAnnotations;
namespace ClinicManagement.Domain.Common.Enums;

public enum TrangThaiChamCong
{
    [Display(Name = "Chưa chấm công")]
    CHUA_CHAM_CONG = 1,
    [Display(Name = "Đúng giờ")]
    DI_DUNG_GIO = 2,
    [Display(Name = "Đi muộn")]
    DI_MUON = 3,
    [Display(Name = "Về sớm")]
    VE_SOM = 4,
    [Display(Name = "Đi muộn và về sớm")]
    DI_MUON_VE_SOM = 5,
    [Display(Name = "Nghỉ phép")]
    NGHI_PHEP = 6,
    [Display(Name = "Vắng mặt")]
    VANG_MAT = 7,
    [Display(Name = "Thiếu check-out")]
    THIEU_CHECK_OUT = 8,
    [Display(Name = "Chờ xác nhận")]
    CHO_XAC_NHAN = 9
}
