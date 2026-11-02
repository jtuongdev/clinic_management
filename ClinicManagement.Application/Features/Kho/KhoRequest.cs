using ClinicManagement.Application.Common.Interfaces;
using MediatR;

namespace ClinicManagement.Application.Features.Kho.Lenh;

/// <summary>
/// Base record cho tất cả Kho Commands và Queries.
/// Mang UserId từ controller xuống Handler để xử lý trực tiếp.
/// </summary>
public abstract record KhoRequest(int UserId) : IRequest<InventoryResult>;
