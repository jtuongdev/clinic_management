using Microsoft.EntityFrameworkCore;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Repositories;
using System.Linq.Expressions;

namespace ClinicManagement.Infrastructure.Persistence.Repositories
{
    public class Repository<T> : IRepository<T> where T : BaseEntity, IAggregateRoot
    {
        protected readonly ClinicDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public Repository(ClinicDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _dbSet = context.Set<T>();
        }

        public IUnitOfWork UnitOfWork => _context;

        public async Task<T?> GetByIdAsync(int id)
            => await _dbSet.FindAsync(id);

        public async Task<IReadOnlyList<T>> GetAllAsync()
            => await _dbSet.AsNoTracking().ToListAsync();

        public async Task<IReadOnlyList<T>> GetPagedAsync(
            int pageIndex, 
            int pageSize, 
            Expression<Func<T, bool>>? predicate = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null)
        {
            IQueryable<T> query = _dbSet.AsNoTracking();

            if (predicate != null)
            {
                query = query.Where(predicate);
            }

            if (orderBy != null)
            {
                query = orderBy(query);
            }

            return await query
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate)
            => await _dbSet.AsNoTracking().Where(predicate).ToListAsync();

        public async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate)
            => await _dbSet.AnyAsync(predicate);

        public async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null)
        {
            if (predicate == null)
            {
                return await _dbSet.CountAsync();
            }
            return await _dbSet.CountAsync(predicate);
        }

        public async Task AddAsync(T entity)
            => await _dbSet.AddAsync(entity);

        public void Update(T entity)
            => _dbSet.Update(entity);

        public void Delete(T entity)
            => _dbSet.Remove(entity);

        public IQueryable<T> GetQueryable()
        {
            return _dbSet.AsQueryable();
        }

        public async Task<int> CountAsync(IQueryable<T> query)
        {
            return await query.CountAsync();
        }

        public async Task<IReadOnlyList<T>> GetPagedAsync(
            int pageIndex,
            int pageSize,
            IQueryable<T> query,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null)
        {
            if (orderBy != null)
            {
                query = orderBy(query);
            }
            else
            {
                query = query.OrderByDescending(e => e.CreatedAt);
            }

            return await query
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }
    }
}
