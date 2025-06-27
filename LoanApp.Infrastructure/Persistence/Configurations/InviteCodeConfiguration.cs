using LoanApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LoanApp.Infrastructure.Persistence.Configurations
{
    public class InviteCodeConfiguration : IEntityTypeConfiguration<InviteCode>
    {
        public void Configure(EntityTypeBuilder<InviteCode> builder)
        {
            builder.HasKey(l => l.InviteCodeId);

            builder.Property(l => l.Code)
                   .IsRequired();

            builder.Property(l => l.Email)
                   .IsRequired();

            builder.Property(l => l.IsUsed)
                   .IsRequired();

            builder.HasIndex(u => u.Email)
                   .IsUnique();

            builder.ToTable("InviteCodes");
        }
    }
}
