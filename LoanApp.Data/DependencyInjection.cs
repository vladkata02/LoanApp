using LoanApp.Data.Generic;
using LoanApp.Data.Repositories.LoanApplications;
using LoanApp.Data.Repositories.Users;
using Microsoft.Extensions.DependencyInjection;

namespace LoanApp.Data
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddData(this IServiceCollection services)
        {
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<ILoanApplicationRepository, LoanApplicationRepository>();

            return services;
        }
    }
}
