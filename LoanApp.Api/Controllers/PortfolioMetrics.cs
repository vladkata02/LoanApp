using LoanApp.Application.Mapping.DTOs;
using LoanApp.Data.Repositories.LoanApplications;
using LoanApp.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoanApp.Web.Api.Controllers
{
    [ApiController]
    [Route("api/portfolio-metrics")]
    [Authorize(Roles = "Admin")]
    public class PortfolioMetricsController : ControllerBase
    {
        private readonly ILoanApplicationRepository loanApplicationRepository;

        public PortfolioMetricsController(ILoanApplicationRepository loanApplicationRepository)
        {
            this.loanApplicationRepository = loanApplicationRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetPortfolioMetrics(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate,
            CancellationToken ct = default)
        {
            if (startDate >= endDate)
            {
                return BadRequest("Start date must be before end date");
            }

            var applications = await this.loanApplicationRepository.GetLoanApplicationsBetweenDates(startDate, endDate);

            var submittedApplications = applications.Where(la => la.Status == LoanApplicationStatus.Submitted);
            var approvedApplications = applications.Where(la => la.Status == LoanApplicationStatus.Approved);
            var rejectedApplications = applications.Where(la => la.Status == LoanApplicationStatus.Rejected);

            var metrics = new PortfolioMetricsDto
            {
                Period = $"{startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}",
                TotalApplications = new MetricDataDto
                {
                    Count = applications.Count,
                    Amount = applications.Sum(la => la.Amount),
                },
                SubmittedApplications = new MetricDataDto
                {
                    Count = submittedApplications.Count(),
                    Amount = submittedApplications.Sum(la => la.Amount)
                },
                ApprovedApplications = new MetricDataDto
                {
                    Count = approvedApplications.Count(),
                    Amount = approvedApplications.Sum(la => la.Amount)
                },
                RejectedApplications = new MetricDataDto
                {
                    Count = rejectedApplications.Count(),
                    Amount = rejectedApplications.Sum(la => la.Amount)
                }
            };

            return Ok(metrics);
        }
    }
}
