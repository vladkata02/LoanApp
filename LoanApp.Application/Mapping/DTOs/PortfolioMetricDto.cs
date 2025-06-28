namespace LoanApp.Application.Mapping.DTOs
{
    public class PortfolioMetricsDto
    {
        public string Period { get; set; } = string.Empty;

        public MetricDataDto TotalApplications { get; set; } = new();

        public MetricDataDto SubmittedApplications { get; set; } = new();

        public MetricDataDto ApprovedApplications { get; set; } = new();

        public MetricDataDto RejectedApplications { get; set; } = new();
    }
}
