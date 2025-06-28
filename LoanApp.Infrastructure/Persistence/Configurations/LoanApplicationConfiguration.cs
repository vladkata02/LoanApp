using LoanApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LoanApp.Infrastructure.Persistence.Configurations;

public class LoanApplicationConfiguration : IEntityTypeConfiguration<LoanApplication>
{
    public void Configure(EntityTypeBuilder<LoanApplication> builder)
    {
        builder.HasKey(l => l.LoanApplicationId);

        builder.Property(l => l.Amount)
               .HasColumnType("money")
               .IsRequired();

        builder.Property(l => l.TermMonths)
               .IsRequired();

        builder.Property(l => l.Purpose)
               .IsRequired();

        builder.Property(l => l.Status)
               .IsRequired();

        builder.Property(l => l.DateApplied)
               .IsRequired();

        builder.HasOne(l => l.User)
               .WithMany()
               .HasForeignKey(l => l.UserId)
               .IsRequired();

        builder.HasMany(l => l.Notes)
               .WithOne(n => n.LoanApplication)
               .HasForeignKey(n => n.LoanApplicationId);

        builder.ToTable("LoanApplications", t =>
        {
            t.HasCheckConstraint("CK_LoanApplication_Status", "[Status] IN (1, 2, 3, 4)");
        });
    }
}
