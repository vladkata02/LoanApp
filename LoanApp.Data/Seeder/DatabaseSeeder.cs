using LoanApp.Application.Services.Auth;
using LoanApp.Data.Configuration;
using LoanApp.Data.Generic;
using LoanApp.Data.Repositories.Users;
using LoanApp.Domain.Entities;
using Microsoft.Extensions.Options;

namespace LoanApp.Data.Seeder
{
    public class DatabaseSeeder : IDatabaseSeeder
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly IAuthService authService;
        private readonly IUserRepository userRepository;
        private readonly AdminAccountSettings adminAccountSettings;

        public DatabaseSeeder(
            IUnitOfWork unitOfWork,
            IUserRepository userRepository,
            IAuthService authService,
            IOptions<Configuration.Data> adminOptions)
        {
            this.unitOfWork = unitOfWork;
            this.adminAccountSettings = adminOptions.Value.AdminAccountSettings;
            this.userRepository = userRepository;
            this.authService = authService;
        }

        public async Task SeedAdminAsync()
        {
            if (!this.unitOfWork.DbContext.Set<User>().Any(u => u.Email == this.adminAccountSettings.Email))
            {
                var admin = new User
                {
                    Email = this.adminAccountSettings.Email,
                    PasswordHash = this.authService.HashPassword(this.adminAccountSettings.Password),
                    Role = Domain.Enums.UserRole.Admin,
                };

                await this.userRepository.AddAsync(admin);

                await this.unitOfWork.SaveChangesAsync();
            }
        }
    }
}
