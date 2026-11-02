using System;

namespace ClinicManagement.Application.DTOs.Khoa;

public class KhoaDropdownDto
{
    public int Id { get; set; }
    public string Ma { get; set; } = string.Empty;
    public string Ten { get; set; } = string.Empty;
    public int MaCoSo { get; set; }
}