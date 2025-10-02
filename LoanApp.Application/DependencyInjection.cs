using LoanApp.Application.Services.Auth;
using LoanApp.Application.Services.Grpc.Notification;
using Microsoft.Extensions.DependencyInjection;

namespace LoanApp.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();

            services.AddScoped<IAccessContext, HttpAccessContext>();

            services.AddSingleton<INotificationGrpcClient, NotificationGrpcClient>();

            return services;
        }
    }
}
