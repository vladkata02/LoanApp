# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution file
COPY LoanApp.sln ./

# Copy project files
COPY LoanApp.Api/*.csproj ./LoanApp.Api/
COPY LoanApp.Application/*.csproj ./LoanApp.Application/
COPY LoanApp.Data/*.csproj ./LoanApp.Data/
COPY LoanApp.Domain/*.csproj ./LoanApp.Domain/
COPY LoanApp.Infrastructure/*.csproj ./LoanApp.Infrastructure/

# Restore dependencies
RUN dotnet restore

# Copy source code
COPY . .

# Build the application
RUN dotnet build -c Release --no-restore

# Run tests
#RUN dotnet test --no-build --verbosity normal --configuration Release

# Publish the application
RUN dotnet publish LoanApp.Api/LoanApp.Web.Api.csproj -c Release -o /app/publish --no-build

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

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

ENTRYPOINT ["dotnet", "LoanApp.Api.dll"]