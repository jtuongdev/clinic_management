using System;
using ClinicManagement.Application.Common.Interfaces;

namespace ClinicManagement.Infrastructure.Identity.Services
{
    public class PasswordHasher : IPasswordHasher
    {
        public string HashPassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
            {
                throw new ArgumentException("Password cannot be empty.", nameof(password));
            }

            return BCrypt.Net.BCrypt.EnhancedHashPassword(password, workFactor: 11);
        }

        public bool VerifyPassword(string password, string hash)
        {
            if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(hash))
            {
                return false;
            }

            try
            {
                if (BCrypt.Net.BCrypt.EnhancedVerify(password, hash))
                {
                    return true;
                }
            }
            catch
            {
                // Fallback to standard verify below
            }

            try
            {
                return BCrypt.Net.BCrypt.Verify(password, hash);
            }
            catch
            {
                return false;
            }
        }
    }
}
