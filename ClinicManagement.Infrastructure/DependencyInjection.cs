using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ClinicManagement.Domain.Repositories;
using ClinicManagement.Domain.Common;
using ClinicManagement.Infrastructure.Persistence;
using ClinicManagement.Infrastructure.Persistence.Repositories;
using ClinicManagement.Application.Common.Interfaces;
using ClinicManagement.Infrastructure.Identity.Services;

namespace ClinicManagement.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // Đăng ký DbContext
            services.AddDbContext<ClinicDbContext>(options =>
                options.UseSqlServer(
                    configuration.GetConnectionString("DefaultConnection"),
                    b => b.MigrationsAssembly(typeof(ClinicDbContext).Assembly.FullName)));
            services.AddScoped<IUnitOfWork>(provider => provider.GetRequiredService<ClinicDbContext>());
            services.AddScoped<INhanVienRepository, NhanVienRepository>();
            services.AddScoped<IBenhNhanRepository, BenhNhanRepository>();
            
            services.AddScoped<ICoSoRepository, CoSoRepository>();
            services.AddScoped<IKhoaRepository, KhoaRepository>();
            services.AddScoped<IPhongKhamRepository, PhongKhamRepository>();

            services.AddScoped<ILuotKhamRepository, LuotKhamRepository>();
            services.AddScoped<ILichLamViecRepository, LichLamViecRepository>();
            services.AddScoped<IChamCongRepository, ChamCongRepository>();
            services.AddScoped<INghiPhepRepository, NghiPhepRepository>();
            services.AddScoped<IDanhMucDichVuRepository, DanhMucDichVuRepository>();

            services.AddScoped<IJwtService, JwtService>();
            services.AddScoped<IPasswordHasher, PasswordHasher>();

            return services;
        }
    }
}