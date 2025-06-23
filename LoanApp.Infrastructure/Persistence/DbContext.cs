using LoanApp.Infrastructure.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;

namespace LoanApp.Infrastructure.Persistance
{
    public class DbContext : IdentityDbContext<User>
    {
        public DbContext(DbContextOptions<DbContext> options)
            : base(options)
        {
        }

        public DbSet<Loan> Loans { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Loan>(entity =>
            {
                entity.HasKey(x => x.Id);
                entity.HasOne(x => x.User)
                      .WithMany()
                      .HasForeignKey(x => x.UserId);
            });
        }
    }
}
