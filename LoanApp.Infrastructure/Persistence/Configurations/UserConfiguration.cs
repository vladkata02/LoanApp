using LoanApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LoanApp.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.UserId);

        builder.Property(u => u.Email)
               .IsRequired();

        builder.Property(u => u.PasswordHash)
               .IsRequired();

        builder.Property(u => u.FirstName)
               .IsRequired()
               .HasMaxLength(50);

        builder.Property(u => u.MiddleName)
               .HasMaxLength(50);

        builder.Property(u => u.LastName)
               .IsRequired()
               .HasMaxLength(50);

        builder.Property(u => u.PhoneNumber)
               .IsRequired()
               .HasMaxLength(10);

        builder.Property(u => u.EGN)
               .IsRequired()
               .HasMaxLength(10);

        builder.Property(u => u.NetSalary)
               .HasColumnType("money")
               .IsRequired();

        builder.Property(u => u.HasPreviousLoans)
               .IsRequired();

        builder.ToTable("Users");
    }
}
