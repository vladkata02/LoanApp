namespace LoanApp.Data.Generic
{
    public interface IAggregateRepository<TEntity>
        where TEntity : class
    {
        Task<TEntity?> GetByIdAsync(int id, CancellationToken cancellationToken = default);

        Task<IEnumerable<TEntity>> ListAsync(CancellationToken cancellationToken = default);

        Task AddAsync(TEntity entity);

        Task AddAsync(TEntity entity, CancellationToken cancellationToken = default);

        void Update(TEntity entity);

        void Remove(TEntity entity);
    }
}
