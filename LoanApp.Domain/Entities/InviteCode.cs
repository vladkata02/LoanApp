namespace LoanApp.Domain.Entities
{
    public class InviteCode
    {
        public int InviteCodeId { get; set; }

        public Guid Code { get; set; } = Guid.NewGuid();

        public string Email { get; set; } = null!;

        public bool IsUsed { get; set; } = false;
    }
}
