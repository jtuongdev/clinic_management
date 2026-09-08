using ClinicManagement.Application.DTOs.Kho;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Inventory;
using ClinicManagement.Domain.Prescription;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;


namespace ClinicManagement.Application.Features.Kho;

// Điều phối các operation kho và giữ trạng thái dùng chung cho các partial file.
public sealed partial class KhoService(
    IKhoRepository db,
    IInventorySettings settings,
    ILogger<KhoService> logger) : IKhoService
{
    private int UserId { get; set; }
    private int DefaultWarehouseId => settings.DefaultWarehouseId;

    public void SetUserId(int userId) => UserId = userId;
}
