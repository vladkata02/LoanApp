namespace LoanApp.Application.Services.Grpc.Notification
{
    public interface INotificationGrpcClient
    {
        Task<bool> SendNotificationAsync(int loanApplicaitonId, int recipientId, string message);
    }
}