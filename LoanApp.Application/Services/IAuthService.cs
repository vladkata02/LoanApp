using LoanApp.Domain.Enums;
using System;
namespace LoanApp.Application.Services
{
    public interface IAuthService
    {
        string HashPassword(string password);

        bool IsPasswordValid(string password, string passwordHash);

        string GenerateJwtToken(int userId, string email, UserRole role);
    }
}
