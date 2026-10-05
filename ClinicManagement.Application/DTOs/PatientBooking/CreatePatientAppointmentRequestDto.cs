using System;
using System.ComponentModel.DataAnnotations;

namespace ClinicManagement.Application.DTOs.PatientBooking
{
    public class CreatePatientAppointmentRequestDto
    {
        [Required(ErrorMessage = "Bác sĩ không được để trống")]
        public int MaBacSi { get; set; }

        [Required(ErrorMessage = "Cơ sở không được để trống")]
        public int MaCoSo { get; set; }

        public int? MaKhoa { get; set; }

        [Required(ErrorMessage = "Thời gian bắt đầu không được để trống")]
        public DateTime ThoiGianBatDau { get; set; }

        [Required(ErrorMessage = "Thời gian kết thúc không được để trống")]
        public DateTime ThoiGianKetThuc { get; set; }

        public string LyDo { get; set; } = string.Empty;
    }
}
