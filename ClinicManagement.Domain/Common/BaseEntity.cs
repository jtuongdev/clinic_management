using System;


namespace ClinicManagement.Domain.Common
{
    public abstract class BaseEntity<TId>
    {
        public TId Id { get; protected set; } = default!;
        public DateTime CreatedAt { get; private set; }
        public int CreatedBy { get; private set; } 
        public DateTime? UpdatedAt { get; private set; }
        public int? UpdatedBy { get; private set; }

        public bool IsDeleted { get; private set; } 
        public DateTime? DeletedAt { get; private set; }
        public int? DeletedBy { get; private set; }

        protected BaseEntity()
        {
            CreatedAt = DateTime.UtcNow;
        }

        public void MarkAsUpdated(int updatedBy)
        {
            UpdatedAt = DateTime.UtcNow;
            UpdatedBy = updatedBy;
        }
        public void SoftDelete(int deletedBy)
        {
            if (IsDeleted) return; 
            IsDeleted = true;
            DeletedAt = DateTime.UtcNow;
            DeletedBy = deletedBy;
        }

        // Hàm khôi phục dữ liệu
        public void Restore()
        {
            if (!IsDeleted) return;
            IsDeleted = false;
            DeletedAt = null;
            DeletedBy = null;
        }
    }

    public abstract class BaseEntity : BaseEntity<int> { }


}
