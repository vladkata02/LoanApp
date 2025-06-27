using LoanApp.Domain.Enums;

namespace LoanApp.Domain.Entities
{
    public class User
    {
        public User() { }

        public User(
            string email,
            string passwordHash,
            UserRole role)
        {
            this.Email = email;
            this.PasswordHash = passwordHash;
            this.Role = role;
        }

        public int UserId { get; set; }

        public string Email { get; set; } = null!;

        public string PasswordHash { get; set; } = null!;

        public UserRole Role { get; set; }
    }
}
