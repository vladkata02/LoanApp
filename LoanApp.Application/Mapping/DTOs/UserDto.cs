using LoanApp.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace LoanApp.Application.Mapping.DTOs
{
    public class UserDto
    {
        public int UserId { get; set; }

        [Required]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = null!;

        [Required]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be 6-100 chars")]
        public string Password { get; set; } = string.Empty;

        [Required]
        public UserRole Role { get; set; }
    }
}
