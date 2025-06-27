namespace LoanApp.Web.Api.Configurations;

public static class Extensions
{
    public static WebApplicationBuilder RegisterConfigurations(this WebApplicationBuilder builder)
    {
        builder.RegisterConfiguration<AppSettings>();
        builder.RegisterConfiguration<AppSettings, Application.Configuration.Application>();
        builder.RegisterConfiguration<AppSettings, Data.Configuration.Data>();

        return builder;
    }

    public static WebApplicationBuilder RegisterConfiguration<T>(this WebApplicationBuilder builder)
        where T : class
    {
        var type = typeof(T);

        var currentSection = builder.Configuration.GetSection(type.Name);
        builder.Services.Configure<T>(currentSection);

        return builder;
    }

    public static WebApplicationBuilder RegisterConfiguration<T1, T2>(this WebApplicationBuilder builder)
        where T1 : class
        where T2 : class
    {
        var type1 = typeof(T1);
        var type2 = typeof(T2);

        var currentSection = builder.Configuration.GetSection($"{type1.Name}:{type2.Name}");
        builder.Services.Configure<T2>(currentSection);

        return builder;
    }
}
