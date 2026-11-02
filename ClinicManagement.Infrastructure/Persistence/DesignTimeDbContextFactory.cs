using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace ClinicManagement.Infrastructure.Persistence
{
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ClinicDbContext>
    {
        public ClinicDbContext CreateDbContext(string[] args)
        {
            // Đường dẫn đến thư mục chứa API project
            var apiPath = Path.Combine(Directory.GetCurrentDirectory(), "ClinicManagement.API");
            
            // Kiểm tra file tồn tại
            var configPath = Path.Combine(apiPath, "appsettings.json");
            if (!File.Exists(configPath))
            {
                // Fallback tìm trong thư mục hiện tại
                apiPath = Directory.GetCurrentDirectory();
            }

            var configuration = new ConfigurationBuilder()
                .SetBasePath(apiPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: false)
                .Build();

            var optionsBuilder = new DbContextOptionsBuilder<ClinicDbContext>();
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            
            if (string.IsNullOrEmpty(connectionString))
            {
                // Fallback cứng 
                connectionString = "Server=localhost,1433;Database=ClinicManagementDb;User Id=sa;Password=Password123!;TrustServerCertificate=true;";
            }

            optionsBuilder.UseSqlServer(connectionString);
            return new ClinicDbContext(optionsBuilder.Options);
        }
    }
}