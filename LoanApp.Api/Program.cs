using LoanApp.Application;
using LoanApp.Application.Mapping;
using LoanApp.Data;
using LoanApp.Infrastructure.Persistance;
using Microsoft.EntityFrameworkCore;
using LoanApp.Web.Api.Configurations;
using LoanApp.Web.Api.Extensions;
using LoanApp.Data.Seeder;
using Microsoft.AspNetCore.Localization;
using System.Globalization;

var builder = WebApplication.CreateBuilder(args);

var config = builder.Configuration;
var services = builder.Services;
var allowedOrigins = config.GetSection("AllowedOrigins").Get<string[]>();

builder.RegisterConfigurations();
builder.AddLoanAppAuthentication();

services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(config.GetConnectionString("DefaultConnection")));


services.AddData();
services.AddApplicationServices();
services.AddControllers();
services.AddEndpointsApiExplorer();
services.AddSwaggerGen();
services.AddAutoMapper(typeof(MappingProfile));
services.AddLocalization(options => options.ResourcesPath = "Resources");

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins(allowedOrigins!)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});



var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<IDatabaseSeeder>();
    await seeder.SeedAdminAsync();
}

app.UseRequestLocalization(options =>
{
    var supportedCultures = new[] { new CultureInfo("en") };
    options.DefaultRequestCulture = new RequestCulture("en");
    options.SupportedCultures = supportedCultures;
    options.SupportedUICultures = supportedCultures;
});

app.UseCors("CorsPolicy");

app.UseHttpsRedirection();
app.UseExceptionHandler("/error");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
