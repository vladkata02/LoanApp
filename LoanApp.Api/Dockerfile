# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files first for better layer caching
COPY LoanApp.Api/LoanApp.Web.Api.csproj LoanApp.Api/
COPY LoanApp.Application/LoanApp.Application.csproj LoanApp.Application/
COPY LoanApp.Data/LoanApp.Data.csproj LoanApp.Data/
COPY LoanApp.Domain/LoanApp.Domain.csproj LoanApp.Domain/
COPY LoanApp.Infrastructure/LoanApp.Infrastructure.csproj LoanApp.Infrastructure/

# Restore dependencies for the API project
RUN dotnet restore LoanApp.Api/LoanApp.Web.Api.csproj

# Copy the rest of the source code
COPY . .

# Build the application
RUN dotnet build LoanApp.Api/LoanApp.Web.Api.csproj -c Release --no-restore

# Run tests
#RUN dotnet test --no-build --verbosity normal --configuration Release

# Publish the application
RUN dotnet publish LoanApp.Api/LoanApp.Web.Api.csproj -c Release -o /app/publish --no-build

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Install curl for health checks
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copy published application
COPY --from=build /app/publish .

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "LoanApp.Web.Api.dll"]