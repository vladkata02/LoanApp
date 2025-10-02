namespace LoanApp.Application.Configuration
{
    public class Application
    {
        public JwtSection JwtSection { get; set; } = null!;

        public GrpcApi GrpcApiSection { get; set; } = null!;
    }
}
