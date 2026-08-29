using MediatR;
using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.Features.LuotKham.Queries
{
    public class GetTimelineQuery : IRequest<List<TimelineDto>>
    {
        public int Limit { get; set; } = 10;
    }

    public class TimelineDto
    {
        public string ThoiGian { get; set; } = string.Empty;
        public string NoiDung { get; set; } = string.Empty;
        public string Loai { get; set; } = string.Empty; // "exam", "cls", "payment"
        public string MauSac { get; set; } = string.Empty; // "green", "orange", "red", "blue"
    }
}