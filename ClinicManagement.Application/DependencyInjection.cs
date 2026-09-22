using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using ClinicManagement.Application.Services;
using ClinicManagement.Application.Services.Interfaces;

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
