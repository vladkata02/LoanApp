using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace LoanApp.Web.Api.Extensions
{
    public static class WebApplicationExtensions
    {
        public static WebApplicationBuilder AddLoanAppAuthentication(this WebApplicationBuilder builder)
        {
            Application.Configuration.Application authenticationSettings = new();
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
                });

            return builder;
        }
    }
}
