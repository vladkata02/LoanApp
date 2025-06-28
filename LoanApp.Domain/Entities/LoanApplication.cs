using LoanApp.Domain.Enums;

namespace LoanApp.Domain.Entities
{
    public class LoanApplication
    {
        public int LoanApplicationId { get; set; }

        public int UserId { get; set; }

        public decimal Amount { get; set; }

        public int TermMonths { get; set; }

        public required string Purpose { get; set; }

        public LoanApplicationStatus Status { get; set; }

        public DateTime DateApplied { get; set; }

        public User User { get; set; } = null!;

        public ICollection<LoanApplicationNote> Notes { get; set; } = new List<LoanApplicationNote>();
    }
}
