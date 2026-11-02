using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Inventory;

public class IdempotencyRecord : BaseEntity
{
    public string Key { get; set; } = string.Empty;
    public string Operation { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public string ResponseJson { get; set; } = string.Empty;
}
