using Grpc.Net.Client;
using Microsoft.Extensions.Configuration;
using LoanApp.Protos;
using Microsoft.Extensions.Options;

namespace LoanApp.Application.Services.Grpc.Notification
{
    public class NotificationGrpcClient : INotificationGrpcClient
    {
        private readonly NotificationService.NotificationServiceClient client;

        public NotificationGrpcClient(IOptions<Configuration.Application> options)
        {
            var channel = GrpcChannel.ForAddress(options.Value.Grpc.NotificationServiceUrl);
            this.client = new NotificationService.NotificationServiceClient(channel);
        }

        public async Task<bool> SendNotificationAsync(int loanApplicaitonId, int recipientId, string message)
        {
            var request = new NotificationRequest
            {
                LoanApplicationId = loanApplicaitonId,
                RecipientId = recipientId,
                Message = message
            };

            var response = await this.client.SendNotificationAsync(request);
            return response.Success;
        }
    }
}