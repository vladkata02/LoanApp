using LoanApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LoanApp.Infrastructure.Persistence.Configurations;

public class LoanApplicationNoteConfiguration : IEntityTypeConfiguration<LoanApplicationNote>
{
    public void Configure(EntityTypeBuilder<LoanApplicationNote> builder)
    {
        builder.HasKey(n => n.LoanApplicationNoteId);

        builder.Property(n => n.SenderId)
               .IsRequired();

        builder.Property(n => n.Content)
               .IsRequired()
               .HasMaxLength(2000);

        builder.Property(n => n.SentAt)
               .IsRequired();

        builder.Property(n => n.IsFromAdmin)
               .IsRequired();

        builder.HasOne(n => n.LoanApplication)
               .WithMany(l => l.Notes)
               .HasForeignKey(n => n.LoanApplicationId)
               .IsRequired()
               .OnDelete(DeleteBehavior.Cascade);

        builder.ToTable("LoanApplicationNotes");
    }
}
