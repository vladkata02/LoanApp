using System.Net;

namespace LoanApp.Application.Models
{
    internal class ErrorResponse
    {
        public HttpStatusCode StatusCode { get; set; }

        public string? Title { get; set; }

        public string? Detail { get; set; }
    }
}
