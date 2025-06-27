using LoanApp.Infrastructure.Persistance;

namespace LoanApp.Data.Generic
{
    public class UnitOfWork : IUnitOfWork
    {
        private AppDbContext context;

        public UnitOfWork(AppDbContext context)
        {
            this.context = context;
        }

        public AppDbContext DbContext => this.context;

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken)
        {
            return this.context.SaveChangesAsync(cancellationToken);
        }
    }
}
