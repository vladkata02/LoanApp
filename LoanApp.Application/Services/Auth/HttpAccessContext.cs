using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace LoanApp.Application.Services.Auth
{
    public class HttpAccessContext : IAccessContext
    {
        private readonly IHttpContextAccessor httpContextAccessor;

        public HttpAccessContext(IHttpContextAccessor httpContextAccessor)
        {
            this.httpContextAccessor = httpContextAccessor;
        }

        public int UserId =>
            int.Parse(this.httpContextAccessor.HttpContext?.User?
                .FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedAccessException("UserId not found in token."));

        public string Username =>
            this.httpContextAccessor.HttpContext?.User?
                .FindFirst(ClaimTypes.Email)?.Value
                ?? throw new UnauthorizedAccessException("Username not found in token.");

        public string Role =>
            this.httpContextAccessor.HttpContext?.User?
                .FindFirst(ClaimTypes.Role)?.Value
                ?? throw new UnauthorizedAccessException("Role not found in token.");
    }
}
