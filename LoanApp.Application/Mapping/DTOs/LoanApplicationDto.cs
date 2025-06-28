using LoanApp.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace LoanApp.Application.Mapping.DTOs
{
    public class LoanApplicationDto
    {
        public int LoanApplicationId { get; set; }

        public int UserId { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public int TermMonths { get; set; }

        [Required]
        public required string Purpose { get; set; }

        public LoanApplicationStatus Status { get; set; } = LoanApplicationStatus.Pending;

        public DateTime DateApplied { get; set; } = DateTime.Now;

        public UserDto? User { get; set; }

        public ICollection<LoanApplicationNoteDto> Notes { get; set; } = new List<LoanApplicationNoteDto>();
    }
}
