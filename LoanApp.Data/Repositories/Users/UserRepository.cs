using LoanApp.Application.Mapping.DTOs;
using LoanApp.Application.Services;
using LoanApp.Data.Generic;
using LoanApp.Domain.Entities;
using LoanApp.Domain.Enums;

namespace LoanApp.Data.Repositories.Users
{
    public class UserRepository : AggregateRepository<User>, IUserRepository
    {
        private readonly IAuthService authService;

        public UserRepository(IUnitOfWork unitOfWork, IAuthService authService) : base(unitOfWork)
        {
            this.authService = authService;
        }

        public async Task<User?> FindByEmailAsync(string email)
        {
            return this.unitOfWork.DbContext.Set<User>().FirstOrDefault(x => x.Email == email);
        }

        public async Task<User> CreateUserAsync(UserDto userDto, UserRole role)
        {
            var passwordHash = this.authService.HashPassword(userDto.Password);

            var user = new User(userDto.Email,
                passwordHash,
                role);

            await this.AddAsync(user);

            await this.unitOfWork.SaveChangesAsync();

            return user;
        }

        public bool IsEmailFree(string email)
        {
            return this.unitOfWork.DbContext.Set<User>().Any(x => x.Email == email);
        }
    }
}
