using LoanApp.Application.Middleware;
using Microsoft.AspNetCore.Builder;

namespace LoanApp.Application.Extensions
{
    public static class ExceptionMiddlewareExtensions
    {
        public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder app)
        {
            return app.UseMiddleware<GlobalExceptionMiddleware>();
        }
    }
}
