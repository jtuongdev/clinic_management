using System.Linq.Expressions;
using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Repositories
{
    public interface IRepository<T> where T : BaseEntity, IAggregateRoot
    {
        Task<T?> GetByIdAsync(int id);
        
        Task<IReadOnlyList<T>> GetAllAsync();

        Task<IReadOnlyList<T>> GetPagedAsync(
            int pageIndex, 
            int pageSize, 
            Expression<Func<T, bool>>? predicate = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null);

        Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate);
        
        Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate);
        
        Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null);
        
        Task AddAsync(T entity);
        
        void Update(T entity);
        
        void Delete(T entity);

        IUnitOfWork UnitOfWork { get; }
        IQueryable<T> GetQueryable();
        Task<int> CountAsync(IQueryable<T> query);
        Task<IReadOnlyList<T>> GetPagedAsync(
            int pageIndex,
            int pageSize,
            IQueryable<T> query,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null
        );
    }
}
