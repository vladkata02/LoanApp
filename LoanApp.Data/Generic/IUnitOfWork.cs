using LoanApp.Infrastructure.Persistence;

namespace LoanApp.Data.Generic
{
    public interface IUnitOfWork
    {
        AppDbContext DbContext { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
