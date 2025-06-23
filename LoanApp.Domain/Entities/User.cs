namespace LoanApp.Domain.Entities
{
    public class User
    {
        public int UserId { get; set; }

        public string Email { get; set; } = null!;

        public string PasswordHash { get; set; } = string.Empty;

        public string FirstName { get; set; } = null!;

        public string MiddleName { get; set; } = null!;

        public string LastName { get; set; } = null!;

        public string EGN { get; set; } = null!;

        public string PhoneNumber { get; set; } = null!;

        public decimal NetSalary { get; set; }

        public bool HasPreviousLoans { get; set; }
    }
}
