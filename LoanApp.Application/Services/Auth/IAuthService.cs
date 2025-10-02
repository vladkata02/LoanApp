using LoanApp.Domain.Enums;
using System;
namespace LoanApp.Application.Services.Auth
{
    public interface IAuthService
    {
        string HashPassword(string password);

        bool IsPasswordValid(string password, string passwordHash);

        Task<string> GenerateJwtTokenAsync(int userId, string email, UserRole role);
    }
}
