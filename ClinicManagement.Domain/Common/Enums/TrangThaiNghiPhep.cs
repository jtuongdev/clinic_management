using System.ComponentModel.DataAnnotations;
namespace ClinicManagement.Domain.Common.Enums;

public enum TrangThaiNghiPhep
{
    [Display(Name = "Chờ duyệt")]
    CHO_DUYET = 1,
    [Display(Name = "Đã duyệt")]
    DA_DUYET = 2,
    [Display(Name = "Từ chối")]
    TU_CHOI = 3,
    [Display(Name = "Đã hủy")]
    HUY = 4
}
