using LoanApp.Application.Mapping.DTOs;
using LoanApp.Data.Generic;
using LoanApp.Domain.Entities;
using LoanApp.Domain.Enums;

namespace LoanApp.Data.Repositories.Users
{
    public interface IUserRepository : IAggregateRepository<User>
    {
        Task<User?> FindByEmailAsync(string email);

        Task<User> CreateUserAsync(UserDto userDto, UserRole role);

        Task<bool> IsEmailAvailable(string email);
    }
}
