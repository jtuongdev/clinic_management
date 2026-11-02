using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ClinicManagement.API.Hubs;

public interface IClinicalClient
{
    Task LabResultCompleted(int luotKhamId, int chiDinhId, string tenDichVu, string ketLuan);
    Task VisitStatusChanged(int luotKhamId, string newStatus);
}

[Authorize]
public class ClinicalHub : Hub<IClinicalClient>
{
    public async Task JoinDoctorQueue(int doctorId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Doctor_{doctorId}");
    }

    public async Task LeaveDoctorQueue(int doctorId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Doctor_{doctorId}");
    }

    public async Task JoinVisitRoom(int luotKhamId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Visit_{luotKhamId}");
    }

    public async Task LeaveVisitRoom(int luotKhamId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Visit_{luotKhamId}");
    }
}
