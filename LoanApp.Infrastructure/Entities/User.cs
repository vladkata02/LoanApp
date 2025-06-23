using Microsoft.AspNetCore.Identity;

namespace LoanApp.Infrastructure.Entities
{
    public class User : IdentityUser
    {
        public bool IsAdmin { get; set; } = false;

        public ICollection<Loan> Loan{ get; set; }
    }
}
