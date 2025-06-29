using LoanApp.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace LoanApp.Application.Mapping.DTOs
{
    public class LoanApplicationNoteDto
    {
        public int LoanApplicationNoteId { get; set; }

        [Required]
        public int LoanApplicationId { get; set; }

        [Required]
        public int SenderId { get; set; }

        [Required]
        [StringLength(2000, MinimumLength = 1)]
        public string Content { get; set; } = null!;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        [Required]
        public bool IsFromAdmin { get; set; }
    }
}
