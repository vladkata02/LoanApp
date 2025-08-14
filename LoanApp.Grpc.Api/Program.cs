using LoanApp.Grpc.Api.Services;

namespace LoanApp.Grpc.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddGrpc();

            var app = builder.Build();

            app.MapGrpcService<NotificationGrpcService>();

            app.Run();
        }
    }
}
