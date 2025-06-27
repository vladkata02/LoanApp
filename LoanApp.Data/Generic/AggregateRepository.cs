using Microsoft.EntityFrameworkCore;

namespace LoanApp.Data.Generic
{
    public abstract class AggregateRepository<TEntity> : IAggregateRepository<TEntity>
        where TEntity : class
    {
        protected readonly IUnitOfWork unitOfWork;
        protected readonly DbSet<TEntity> dbSet;

        protected AggregateRepository(IUnitOfWork unitOfWork)
        {
            this.unitOfWork = unitOfWork;
            this.dbSet = unitOfWork.DbContext.Set<TEntity>();
        }

        public virtual async Task<TEntity?> GetByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await this.dbSet.FindAsync([id], cancellationToken);
        }

        public virtual async Task<IEnumerable<TEntity>> ListAsync(CancellationToken cancellationToken)
        {
            return await this.dbSet.AsNoTracking().ToListAsync(cancellationToken);
        }

        public virtual async Task AddAsync(TEntity entity)
        {
            await this.dbSet.AddAsync(entity);
        }

        public virtual async Task AddAsync(TEntity entity, CancellationToken cancellationToken)
        {
            await this.dbSet.AddAsync(entity, cancellationToken);
        }

        public virtual void Update(TEntity entity)
        {
            this.dbSet.Update(entity);
        }

        public virtual void Remove(TEntity entity)
        {
            this.dbSet.Remove(entity);
        }
    }
}
