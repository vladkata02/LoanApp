using LoanApp.Data.Generic;
using LoanApp.Domain.Entities;

namespace LoanApp.Data.Repositories.Users
{
    public interface IUserRepository : IAggregateRepository<User>
    {
    }
}
