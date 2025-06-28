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

        public virtual async Task<TEntity?> FindByIdAsync(int id, CancellationToken cancellationToken)
        {
            return await this.dbSet.FindAsync([id], cancellationToken);
        }

        public virtual async Task<IList<TEntity>> ListAsync(CancellationToken cancellationToken)
        {
            IQueryable<TEntity> query = this.dbSet.AsNoTracking();

            var navigations = this.unitOfWork.DbContext.Model.FindEntityType(typeof(TEntity))!
                                                             .GetNavigations();

            foreach (var navigation in navigations)
            {
                query = query.Include(navigation.Name);
            }

            return await query.ToListAsync(cancellationToken);
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
