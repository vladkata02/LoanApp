using Grpc.Core;
using LoanApp.Protos;

namespace LoanApp.Grpc.Api.Services
{
    public class NotificationGrpcService : NotificationService.NotificationServiceBase
    {
        public override Task<NotificationReply> SendNotification(
            NotificationRequest request,
            ServerCallContext context)
        {
            Console.WriteLine($"To client with id: {request.RecipientId} | Message: {request.Message}");

            return Task.FromResult(new NotificationReply
            {
                Success = true
            });
        }
    }
}
