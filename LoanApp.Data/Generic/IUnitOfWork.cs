using LoanApp.Infrastructure.Persistance;

namespace LoanApp.Data.Generic
{
    public interface IUnitOfWork
    {
        AppDbContext DbContext { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
