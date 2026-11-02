using ClinicManagement.Application.DTOs.LichLamViec;
using ClinicManagement.Domain.Identity;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Common.Enums;
using MediatR;

namespace ClinicManagement.Application.Features.LichLamViec
{
    public record GetLichLamViecCoDinhQuery(int? MaNhanVien = null, int? MaKhoa = null)
        : IRequest<IReadOnlyList<LichLamViecCoDinhDto>>;
    public record CreateLichLamViecCoDinhCommand(CreateLichLamViecCoDinhRequest Request)
        : IRequest<LichLamViecCoDinhDto>;
    public record DeleteLichLamViecCoDinhCommand(int Id, int DeletedBy) : IRequest;
    public record UpdateLichLamViecCoDinhCommand(int Id, UpdateLichLamViecCoDinhRequest Request)
        : IRequest<LichLamViecCoDinhDto>;
    public record GenerateLichLamViecCommand(DateTime TuNgay, DateTime DenNgay, int? MaKhoa = null)
        : IRequest<int>;
    public record PreviewGenerateLichLamViecCommand(DateTime TuNgay, DateTime DenNgay, int? MaKhoa = null)
        : IRequest<GenerateSchedulePreview>;
    public record BulkCreateLichLamViecCoDinhCommand(BulkFixedScheduleRequest Request)
        : IRequest<BulkFixedScheduleResult>;
    public record SetFixedScheduleCommand(int MaNhanVien, List<FixedShiftItemDto> Shifts)
        : IRequest<IReadOnlyList<LichLamViecCoDinhDto>>;
    public record GenerateMonthlyScheduleCommand(int Thang, int Nam, int? MaKhoa = null, int? MaNhanVien = null)
        : IRequest<GenerateMonthlyScheduleResult>;

    public class LichLamViecCoDinhHandler :
        IRequestHandler<GetLichLamViecCoDinhQuery, IReadOnlyList<LichLamViecCoDinhDto>>,
        IRequestHandler<CreateLichLamViecCoDinhCommand, LichLamViecCoDinhDto>,
        IRequestHandler<UpdateLichLamViecCoDinhCommand, LichLamViecCoDinhDto>,
        IRequestHandler<DeleteLichLamViecCoDinhCommand>,
        IRequestHandler<GenerateLichLamViecCommand, int>,
        IRequestHandler<PreviewGenerateLichLamViecCommand, GenerateSchedulePreview>,
        IRequestHandler<BulkCreateLichLamViecCoDinhCommand, BulkFixedScheduleResult>,
        IRequestHandler<SetFixedScheduleCommand, IReadOnlyList<LichLamViecCoDinhDto>>,
        IRequestHandler<GenerateMonthlyScheduleCommand, GenerateMonthlyScheduleResult>
    {
        private readonly ILichLamViecRepository repository;
        public LichLamViecCoDinhHandler(ILichLamViecRepository repository) => this.repository = repository;

        public async Task<IReadOnlyList<LichLamViecCoDinhDto>> Handle(GetLichLamViecCoDinhQuery query, CancellationToken cancellationToken)
            => (await repository.GetFixedSchedulesAsync(query.MaNhanVien, query.MaKhoa, cancellationToken)).Select(Map).ToList();

        public async Task<LichLamViecCoDinhDto> Handle(CreateLichLamViecCoDinhCommand command, CancellationToken cancellationToken)
        {
            var request = command.Request;
            ValidateRequest(request);
            if (!await repository.IsEmployeeAssignedToDepartmentAsync(request.MaNhanVien, request.MaKhoa, request.TuNgay, cancellationToken))
                throw new InvalidOperationException("Nhân viên không thuộc khoa tại ngày bắt đầu lịch cố định.");
            var entity = new LichLamViecCoDinh
            {
                MaNhanVien = request.MaNhanVien, MaKhoa = request.MaKhoa, MaCaTruc = request.MaCaTruc,
                MaPhongKham = request.MaPhongKham, ThuTrongTuan = request.ThuTrongTuan,
                TuNgay = request.TuNgay, DenNgay = request.DenNgay, GhiChu = request.GhiChu
            };
            entity.Normalize();
            if (await repository.HasFixedScheduleConflictAsync(entity.MaNhanVien, entity.ThuTrongTuan,
                entity.MaCaTruc, entity.TuNgay, entity.DenNgay, cancellationToken: cancellationToken))
                throw new InvalidOperationException("Lịch cố định bị trùng nhân viên, thứ, ca và khoảng hiệu lực.");
            await repository.AddFixedScheduleAsync(entity, cancellationToken);
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return Map(await repository.GetFixedScheduleByIdAsync(entity.Id, cancellationToken) ?? entity);
        }

        public async Task Handle(DeleteLichLamViecCoDinhCommand command, CancellationToken cancellationToken)
        {
            var entity = await repository.GetFixedScheduleByIdAsync(command.Id, cancellationToken)
                ?? throw new KeyNotFoundException("Không tìm thấy lịch làm việc cố định.");
            repository.SoftDeleteFixedSchedule(entity, command.DeletedBy);
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }

        public async Task<LichLamViecCoDinhDto> Handle(UpdateLichLamViecCoDinhCommand command, CancellationToken cancellationToken)
        {
            var entity = await repository.GetFixedScheduleByIdAsync(command.Id, cancellationToken)
                ?? throw new KeyNotFoundException("Không tìm thấy lịch làm việc cố định.");
            var request = command.Request;
            ValidateRequest(request);
            if (!await repository.IsEmployeeAssignedToDepartmentAsync(request.MaNhanVien, request.MaKhoa, request.TuNgay, cancellationToken))
                throw new InvalidOperationException("Nhân viên không thuộc khoa tại ngày bắt đầu lịch cố định.");
            entity.MaNhanVien = request.MaNhanVien;
            entity.MaKhoa = request.MaKhoa;
            entity.MaCaTruc = request.MaCaTruc;
            entity.MaPhongKham = request.MaPhongKham;
            entity.ThuTrongTuan = request.ThuTrongTuan;
            entity.IsActive = request.IsActive;
            entity.TuNgay = request.TuNgay;
            entity.DenNgay = request.DenNgay;
            entity.GhiChu = request.GhiChu;
            entity.Normalize();
            if (await repository.HasFixedScheduleConflictAsync(entity.MaNhanVien, entity.ThuTrongTuan,
                entity.MaCaTruc, entity.TuNgay, entity.DenNgay, entity.Id, cancellationToken))
                throw new InvalidOperationException("Lịch cố định bị trùng nhân viên, thứ, ca và khoảng hiệu lực.");
            repository.UpdateFixedSchedule(entity);
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return Map(await repository.GetFixedScheduleByIdAsync(entity.Id, cancellationToken) ?? entity);
        }

        public async Task<int> Handle(GenerateLichLamViecCommand command, CancellationToken cancellationToken)
        {
            if (command.DenNgay.Date < command.TuNgay.Date)
                throw new ArgumentException("Khoảng ngày sinh lịch không hợp lệ.");
            var fixedSchedules = await repository.GetFixedSchedulesAsync(null, command.MaKhoa, cancellationToken);
            var created = 0;
            var eligible = 0;
            for (var date = command.TuNgay.Date; date <= command.DenNgay.Date; date = date.AddDays(1))
            {
                foreach (var item in fixedSchedules.Where(item => item.ThuTrongTuan == date.DayOfWeek))
                {
                    if (item.TuNgay.Date > date || (item.DenNgay.HasValue && item.DenNgay.Value.Date < date))
                        continue;
                    eligible++;
                    if (await repository.EmployeeHasScheduleAsync(item.MaNhanVien, date, cancellationToken) ||
                        await repository.HasApprovedLeaveAsync(item.MaNhanVien, date, cancellationToken))
                        continue;
                    await repository.AddAsync(new Domain.Identity.LichLamViec
                    {
                        MaNhanVien = item.MaNhanVien, MaKhoa = item.MaKhoa, MaCaTruc = item.MaCaTruc,
                        MaPhongKham = item.MaPhongKham, MaLichLamViecCoDinh = item.Id,
                        NguonLich = NguonLich.TU_DONG_THEO_LICH_MAU, TrangThai = TrangThaiLichLamViec.LAM_VIEC, NgayLam = date, GhiChu = item.GhiChu
                    }, cancellationToken);
                    created++;
                }
            }
            if (eligible == 0)
                throw new InvalidOperationException("Không có lịch cố định còn hiệu lực trong khoảng ngày đã chọn.");
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
            return created;
        }

        public async Task<GenerateSchedulePreview> Handle(
            PreviewGenerateLichLamViecCommand command, CancellationToken cancellationToken)
        {
            ValidateDateRange(command.TuNgay, command.DenNgay);
            var fixedSchedules = await repository.GetFixedSchedulesAsync(null, command.MaKhoa, cancellationToken);
            var preview = new GenerateSchedulePreview();
            for (var date = command.TuNgay.Date; date <= command.DenNgay.Date; date = date.AddDays(1))
            {
                foreach (var item in fixedSchedules.Where(item => item.ThuTrongTuan == date.DayOfWeek))
                {
                    if (item.TuNgay.Date > date || (item.DenNgay.HasValue && item.DenNgay.Value.Date < date))
                    {
                        preview.OutsideEffectiveRangeCount++;
                        continue;
                    }
                    preview.ExpectedCount++;
                    if (!await repository.IsEmployeeAssignedToDepartmentAsync(item.MaNhanVien, item.MaKhoa, date, cancellationToken))
                    {
                        preview.UnassignedEmployeeCount++;
                    }
                    else if (await repository.EmployeeHasScheduleAsync(item.MaNhanVien, date, cancellationToken) ||
                        await repository.HasApprovedLeaveAsync(item.MaNhanVien, date, cancellationToken))
                    {
                        preview.ExistingCount++;
                    }
                    else if (await repository.HasConflictAsync(item.MaNhanVien, item.MaCaTruc, date, cancellationToken: cancellationToken))
                    {
                        preview.ConflictCount++;
                    }
                }
            }
            if (preview.ExpectedCount == 0)
                throw new InvalidOperationException("Không có lịch cố định còn hiệu lực trong khoảng ngày đã chọn.");
            return preview;
        }

        public async Task<BulkFixedScheduleResult> Handle(
            BulkCreateLichLamViecCoDinhCommand command, CancellationToken cancellationToken)
        {
            if (command.Request.Items is null || command.Request.Items.Count == 0)
                throw new ArgumentException("Danh sách lịch cố định không được rỗng.");
            foreach (var request in command.Request.Items) ValidateRequest(request);

            return await repository.ExecuteInTransactionAsync(async () =>
            {
                var result = new BulkFixedScheduleResult();
                var accepted = new List<LichLamViecCoDinh>();
                foreach (var request in command.Request.Items)
                {
                    var entity = new LichLamViecCoDinh
                    {
                        MaNhanVien = request.MaNhanVien, MaKhoa = request.MaKhoa,
                        MaCaTruc = request.MaCaTruc, MaPhongKham = request.MaPhongKham,
                        ThuTrongTuan = request.ThuTrongTuan, TuNgay = request.TuNgay,
                        DenNgay = request.DenNgay, GhiChu = request.GhiChu ?? string.Empty
                    };
                    entity.Normalize();
                    if (!await repository.IsEmployeeAssignedToDepartmentAsync(
                        entity.MaNhanVien, entity.MaKhoa, entity.TuNgay, cancellationToken))
                    {
                        result.UnassignedEmployeeCount++;
                        continue;
                    }
                    var duplicate = accepted.Any(item => item.MaNhanVien == entity.MaNhanVien &&
                        item.ThuTrongTuan == entity.ThuTrongTuan && item.MaCaTruc == entity.MaCaTruc &&
                        item.TuNgay <= (entity.DenNgay ?? DateTime.MaxValue) &&
                        (!item.DenNgay.HasValue || item.DenNgay.Value >= entity.TuNgay)) ||
                        await repository.HasFixedScheduleConflictAsync(entity.MaNhanVien, entity.ThuTrongTuan,
                            entity.MaCaTruc, entity.TuNgay, entity.DenNgay, cancellationToken: cancellationToken);
                    if (duplicate)
                    {
                        result.DuplicateCount++;
                        continue;
                    }
                    await repository.AddFixedScheduleAsync(entity, cancellationToken);
                    accepted.Add(entity);
                    result.CreatedCount++;
                }
                result.SkippedCount = result.DuplicateCount + result.UnassignedEmployeeCount;
                await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
                return result;
            }, cancellationToken);
        }

        private static void ValidateDateRange(DateTime fromDate, DateTime toDate)
        {
            if (toDate.Date < fromDate.Date)
                throw new ArgumentException("Khoảng ngày sinh lịch không hợp lệ.");
        }

        private async Task GenerateForFixedSchedule(
            LichLamViecCoDinh fixedSchedule,
            DateTime fromDate,
            DateTime toDate,
            CancellationToken cancellationToken)
        {
            for (var date = fromDate.Date; date <= toDate.Date; date = date.AddDays(1))
            {
                if (fixedSchedule.ThuTrongTuan != date.DayOfWeek ||
                    await repository.EmployeeHasScheduleAsync(fixedSchedule.MaNhanVien, date, cancellationToken) ||
                    await repository.HasApprovedLeaveAsync(fixedSchedule.MaNhanVien, date, cancellationToken))
                    continue;

                await repository.AddAsync(new Domain.Identity.LichLamViec
                {
                    MaNhanVien = fixedSchedule.MaNhanVien,
                    MaKhoa = fixedSchedule.MaKhoa,
                    MaCaTruc = fixedSchedule.MaCaTruc,
                    MaPhongKham = fixedSchedule.MaPhongKham,
                    MaLichLamViecCoDinh = fixedSchedule.Id,
                    NguonLich = NguonLich.TU_DONG_THEO_LICH_MAU,
                    TrangThai = TrangThaiLichLamViec.LAM_VIEC,
                    NgayLam = date,
                    GhiChu = fixedSchedule.GhiChu
                }, cancellationToken);
            }
            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);
        }

        public async Task<IReadOnlyList<LichLamViecCoDinhDto>> Handle(SetFixedScheduleCommand command, CancellationToken cancellationToken)
        {
            if (command.MaNhanVien <= 0)
                throw new ArgumentException("Mã nhân viên không hợp lệ.", nameof(command.MaNhanVien));

            var shifts = command.Shifts ?? new List<FixedShiftItemDto>();

            var hasDuplicates = shifts
                .GroupBy(s => new { s.ThuTrongTuan, s.MaCaTruc })
                .Any(g => g.Count() > 1);
            if (hasDuplicates)
                throw new ArgumentException("Không thể cấu hình trùng ca trực trong cùng một thứ.");

            var deptId = await repository.GetEmployeeDepartmentIdAsync(command.MaNhanVien, cancellationToken: cancellationToken) ?? 1;

            var currentTemplates = await repository.GetFixedSchedulesByEmployeeAsync(command.MaNhanVien, track: true, cancellationToken);

            // 1. Soft-delete templates no longer present in incoming list
            foreach (var existing in currentTemplates)
            {
                var matched = shifts.FirstOrDefault(s => s.ThuTrongTuan == existing.ThuTrongTuan && s.MaCaTruc == existing.MaCaTruc);
                if (matched == null)
                {
                    repository.SoftDeleteFixedSchedule(existing, 0);
                }
                else
                {
                    existing.UpdateInfo(matched.MaCaTruc, matched.MaPhongKham);
                    existing.Activate();
                    existing.Normalize();
                }
            }

            // 2. Add new templates that do not exist yet
            foreach (var shift in shifts)
            {
                var existing = currentTemplates.FirstOrDefault(e => e.ThuTrongTuan == shift.ThuTrongTuan && e.MaCaTruc == shift.MaCaTruc);
                if (existing == null)
                {
                    var newEntity = new LichLamViecCoDinh
                    {
                        MaNhanVien = command.MaNhanVien,
                        MaKhoa = deptId,
                        MaCaTruc = shift.MaCaTruc,
                        MaPhongKham = shift.MaPhongKham,
                        ThuTrongTuan = shift.ThuTrongTuan,
                        IsActive = true,
                        TuNgay = DateTime.Today,
                        GhiChu = "Cấu hình lịch mẫu cố định"
                    };
                    newEntity.Normalize();
                    await repository.AddFixedScheduleAsync(newEntity, cancellationToken);
                }
            }

            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);

            var updatedList = await repository.GetFixedSchedulesByEmployeeAsync(command.MaNhanVien, track: false, cancellationToken);
            return updatedList.Select(Map).ToList();
        }

        public async Task<GenerateMonthlyScheduleResult> Handle(GenerateMonthlyScheduleCommand command, CancellationToken cancellationToken)
        {
            if (command.Thang < 1 || command.Thang > 12)
                throw new ArgumentException("Tháng phải từ 1 đến 12.");
            if (command.Nam < 2000 || command.Nam > 2100)
                throw new ArgumentException("Năm không hợp lệ.");

            var startDate = new DateTime(command.Nam, command.Thang, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);
            var totalDays = endDate.Day;

            var activeTemplates = await repository.GetActiveFixedSchedulesAsync(command.MaNhanVien, command.MaKhoa, cancellationToken);
            if (!activeTemplates.Any())
                throw new InvalidOperationException("Không tìm thấy lịch làm việc cố định nào đang hoạt động.");

            int createdCount = 0;
            int skippedCount = 0;
            var scheduledEmployees = new HashSet<int>();

            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                var dayOfWeek = date.DayOfWeek;
                var matching = activeTemplates.Where(t => t.ThuTrongTuan == dayOfWeek).ToList();

                foreach (var template in matching)
                {
                    if (template.TuNgay.Date > date || (template.DenNgay.HasValue && template.DenNgay.Value.Date < date))
                        continue;

                    if (await repository.EmployeeHasScheduleAsync(template.MaNhanVien, date, cancellationToken) ||
                        await repository.HasApprovedLeaveAsync(template.MaNhanVien, date, cancellationToken))
                    {
                        skippedCount++;
                        continue;
                    }

                    var newSchedule = new Domain.Identity.LichLamViec
                    {
                        MaNhanVien = template.MaNhanVien,
                        MaKhoa = template.MaKhoa,
                        MaCaTruc = template.MaCaTruc,
                        MaPhongKham = template.MaPhongKham,
                        MaLichLamViecCoDinh = template.Id,
                        NgayLam = date,
                        NguonLich = NguonLich.TU_DONG_THEO_LICH_MAU,
                        TrangThai = TrangThaiLichLamViec.LAM_VIEC,
                        GhiChu = "Sinh tự động theo lịch mẫu"
                    };
                    newSchedule.Normalize();
                    await repository.AddAsync(newSchedule, cancellationToken);

                    createdCount++;
                    scheduledEmployees.Add(template.MaNhanVien);
                }
            }

            await repository.UnitOfWork.SaveChangesAsync(cancellationToken);

            return new GenerateMonthlyScheduleResult(
                command.Thang,
                command.Nam,
                totalDays,
                createdCount,
                skippedCount,
                scheduledEmployees.Count
            );
        }

        private static LichLamViecCoDinhDto Map(LichLamViecCoDinh item) => new()
        {
            Id = item.Id, MaNhanVien = item.MaNhanVien, TenNhanVien = item.NhanVien?.HoTen ?? string.Empty,
            MaKhoa = item.MaKhoa, TenKhoa = item.Khoa?.Ten ?? string.Empty, MaCaTruc = item.MaCaTruc,
            TenCa = item.CaTruc?.TenCa ?? string.Empty, MaPhongKham = item.MaPhongKham,
            TenPhongKham = item.PhongKham?.Ten ?? string.Empty, ThuTrongTuan = item.ThuTrongTuan,
            IsActive = item.IsActive,
            TuNgay = item.TuNgay, DenNgay = item.DenNgay, GhiChu = item.GhiChu
        };

        private static void ValidateRequest(CreateLichLamViecCoDinhRequest request)
        {
            if (request.MaNhanVien <= 0 || request.MaKhoa <= 0 || request.MaCaTruc <= 0)
                throw new ArgumentException("Nhân viên, khoa và ca trực không hợp lệ.");
            if (request.TuNgay == default)
                throw new ArgumentException("Ngày bắt đầu lịch cố định không hợp lệ.");
            if (request.MaPhongKham is <= 0)
                throw new ArgumentException("Phòng khám không hợp lệ.");
            if (request.GhiChu?.Length > 500)
                throw new ArgumentException("Ghi chú không được vượt quá 500 ký tự.");
        }
    }
}
