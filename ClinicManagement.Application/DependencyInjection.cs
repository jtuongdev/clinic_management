using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using MediatR;
using ClinicManagement.Application.Services;
using ClinicManagement.Application.Services.Interfaces;
using ClinicManagement.Application.Features.BenhNhan.Commands;
using ClinicManagement.Application.Features.PatientAuth.Commands.DoiMatKhauBenhNhan;

namespace ClinicManagement.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            var currentAssembly = Assembly.GetExecutingAssembly();

            // MediatR: Tự động quét và đăng ký tất cả Command, Query, Handler trong tầng Application
            services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssembly(currentAssembly);
            });

            // Đăng ký trực tiếp các Handler đổi mật khẩu mới để đảm bảo DI luôn phân giải được
            services.AddTransient<IRequestHandler<AdminDoiMatKhauBenhNhanCommand, bool>, AdminDoiMatKhauBenhNhanCommandHandler>();
            services.AddTransient<IRequestHandler<GuiMaOtpDoiMatKhauCommand, string>, GuiMaOtpDoiMatKhauCommandHandler>();
            services.AddTransient<IRequestHandler<XacMinhOtpDoiMatKhauCommand, bool>, XacMinhOtpDoiMatKhauCommandHandler>();
            services.AddTransient<IRequestHandler<DoiMatKhauBangOtpCommand, bool>, DoiMatKhauBangOtpCommandHandler>();

            // FluentValidation: Tự động quét tất cả Validator trong tầng Application
            services.AddValidatorsFromAssembly(currentAssembly);
            
            // AutoMapper: Tự động quét tất cả Mapping Profile trong tầng Application
            services.AddAutoMapper(cfg =>
            {
                cfg.AddMaps(currentAssembly);
            });

            services.AddScoped<IClinicalGovernanceService, ClinicalGovernanceService>();

            return services;
        }
    }
}
