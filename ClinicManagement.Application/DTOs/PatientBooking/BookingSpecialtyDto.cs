namespace ClinicManagement.Application.DTOs.PatientBooking
{
    public class BookingSpecialtyDto
    {
        public int Id { get; set; }
        public string Ma { get; set; } = string.Empty;
        public string Ten { get; set; } = string.Empty;
        public int MaCoSo { get; set; }
        public string? TenCoSo { get; set; }
        public string? IconUrl { get; set; }
        public string? MoTa { get; set; }
    }
}
