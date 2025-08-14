namespace LoanApp.Application.Configuration
{
    public class Application
    {
        public JwtSection JwtSection { get; set; } = null!;

        public Grpc Grpc { get; set; } = null!;
    }
}
