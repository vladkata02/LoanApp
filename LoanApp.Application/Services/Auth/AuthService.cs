using LoanApp.Application.Configuration;
using LoanApp.Domain.Enums;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace LoanApp.Application.Services.Auth
{
    public class AuthService : IAuthService
    {
        private readonly JwtSection jwtSettings;
        private readonly IDistributedCache cache;

        public AuthService(IOptions<Configuration.Application> options, IDistributedCache cache)
        {
            jwtSettings = options.Value.JwtSection;
            this.cache = cache;
        }

        public string HashPassword(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
            {
                throw new ArgumentException("Password cannot be null or empty", nameof(password));
            }

            if (password.Length > 128)
            {
                throw new ArgumentException("Password too long", nameof(password));
            }

            return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
        }

        public bool IsPasswordValid(string password, string passwordHash)
        {
            if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(passwordHash))
            {
                return false;
            }

            try
            {
                return BCrypt.Net.BCrypt.Verify(password, passwordHash);
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<string> GenerateJwtTokenAsync(int userId, string email, UserRole role)
        {
            if (string.IsNullOrWhiteSpace(jwtSettings.Secret) || jwtSettings.Secret.Length < 32)
            {
                throw new InvalidOperationException("JWT Secret must be at least 32 characters long");
            }

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Role, role.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret));

            var token = new JwtSecurityToken(
                issuer: jwtSettings.Issuer,
                audience: jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(jwtSettings.ExpiryMinutes),
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

            await this.cache.SetStringAsync($"session:{Guid.NewGuid().ToString()}", userId.ToString(),
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1)
                });

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}