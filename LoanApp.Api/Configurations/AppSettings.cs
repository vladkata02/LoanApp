namespace LoanApp.Web.Api.Configurations;

public class AppSettings
{
    public required Application.Configuration.Application Application { get; set; }

    public required Data.Configuration.Data Data { get; set; }
}
