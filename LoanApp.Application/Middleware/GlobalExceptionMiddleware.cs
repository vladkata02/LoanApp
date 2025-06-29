using LoanApp.Application.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using System.Net;
using System.Text.Json;

namespace LoanApp.Application.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate next;
        private readonly IHostEnvironment environment;

        public GlobalExceptionMiddleware(
            RequestDelegate next,
            IHostEnvironment environment)
        {
            this.next = next;
            this.environment = environment;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await this.next(context);
            }
            catch (Exception ex)
            {

                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";

            var errorResponse = exception switch
            {
                UnauthorizedAccessException => CreateErrorResponse(
                    HttpStatusCode.Unauthorized,
                    "Unauthorized access",
                    "You are not authorized to access this resource"
                ),
                
                ArgumentException => CreateErrorResponse(
                    HttpStatusCode.BadRequest,
                    "Invalid argument",
                    exception.Message
                ),
                
                InvalidOperationException when exception.Message.Contains("JWT") => CreateErrorResponse(
                    HttpStatusCode.InternalServerError,
                    "Authentication configuration error",
                    "Authentication service is not properly configured"
                ),
                
                FormatException when exception.Message.Contains("UserId") => CreateErrorResponse(
                    HttpStatusCode.Unauthorized,
                    "Invalid authentication",
                    "Authentication token is invalid"
                ),
                
                KeyNotFoundException => CreateErrorResponse(
                    HttpStatusCode.NotFound,
                    "Resource not found",
                    "The requested resource was not found"
                ),
                
                TimeoutException => CreateErrorResponse(
                    HttpStatusCode.RequestTimeout,
                    "Request timeout",
                    "The request timed out. Please try again"
                ),
                
                _ => CreateErrorResponse(
                    HttpStatusCode.InternalServerError,
                    "Internal server error",
                    environment.IsDevelopment() 
                        ? exception.Message 
                        : "An error occurred while processing your request"
                )
            };

            context.Response.StatusCode = (int)errorResponse.StatusCode;

            var jsonResponse = JsonSerializer.Serialize(new
            {
                error = errorResponse.Title,
                message = errorResponse.Detail,
                statusCode = errorResponse.StatusCode,
                timestamp = DateTime.UtcNow,
                path = context.Request.Path.Value,
                method = context.Request.Method,
                stackTrace = environment.IsDevelopment() ? exception.StackTrace : null
            }, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await context.Response.WriteAsync(jsonResponse);
        }

        private static ErrorResponse CreateErrorResponse(HttpStatusCode statusCode, string title, string detail)
        {
            return new ErrorResponse
            {
                StatusCode = statusCode,
                Title = title,
                Detail = detail
            };
        }
    }
}
