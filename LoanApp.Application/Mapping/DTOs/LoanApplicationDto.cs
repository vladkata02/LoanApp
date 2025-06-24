using LoanApp.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace LoanApp.Application.Mapping.DTOs
{
    public class LoanApplicationDto
    {
        public int LoanApplicationId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public int TermMonths { get; set; }

        public LoanApplicationStatus Status { get; set; }

        public DateTime DateApplied { get; set; }

        public UserDto User { get; set; } = null!;

        public ICollection<LoanApplicationNoteDto> Notes { get; set; } = new List<LoanApplicationNoteDto>();
    }
}
