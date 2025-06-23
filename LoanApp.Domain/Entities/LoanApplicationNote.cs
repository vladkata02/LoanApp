namespace LoanApp.Domain.Entities;

public class LoanApplicationNote
{
    public int LoanApplicationNoteId { get; set; }

    public int LoanApplicationId { get; set; }

    public int SenderId { get; set; }

    public string Content { get; set; } = null!;

    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    public bool IsFromAdmin { get; set; }

    public LoanApplication LoanApplication { get; set; } = null!;
}
