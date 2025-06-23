using LoanApp.Domain.Enums;

namespace LoanApp.Infrastructure.Entities
{
    public class Loan
    {
        public int Id { get; set; }

        public string UserId { get; set; }

        public decimal Amount { get; set; }

        public LoanStatus Status { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        //TODO: Change to entities
        public string AdminNotes { get; set; }

        public User User { get; set; }
    }
}
