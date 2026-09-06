using System.ComponentModel.DataAnnotations;
namespace ClinicManagement.Domain.Common.Enums;

public enum TrangThaiLichLamViec
{
    [Display(Name = "Làm việc")]
    LAM_VIEC = 1,
    [Display(Name = "Nghỉ trong ngày")]
    NGHI = 2,
    [Display(Name = "Đã hủy")]
    HUY = 3
}
