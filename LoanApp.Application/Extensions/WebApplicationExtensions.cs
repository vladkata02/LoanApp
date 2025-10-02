using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace LoanApp.Application.Extensions
{
    public static class WebApplicationExtensions
    {
        public static WebApplicationBuilder AddLoanAppAuthentication(this WebApplicationBuilder builder)
        {
            Configuration.Application authenticationSettings = new();
            builder.Configuration.GetSection("AppSettings:Application").Bind(authenticationSettings);
            var keyString = System.Text.Encoding.UTF8.GetBytes(authenticationSettings.JwtSection.Secret);

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,

                        ValidIssuer = authenticationSettings.JwtSection.Issuer,
                        ValidAudience = authenticationSettings.JwtSection.Audience,
                        IssuerSigningKey = new SymmetricSecurityKey(keyString)
                    };
                    options.Events = new JwtBearerEvents
                    {
                        OnTokenValidated = async context =>
                        {
                            var jti = context.Principal?.FindFirst("jti")?.Value;
                            var cache = context.HttpContext.RequestServices.GetRequiredService<IDistributedCache>();
                            var session = await cache.GetStringAsync($"session:{jti}");
                            if (session == null)
                            {
                                context.Fail("Session not found or revoked.");
                            }
                        }
                    };
                });

            return builder;
        }
    }
}
