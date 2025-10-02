namespace LoanApp.Application.Services.Auth
{
    public interface IAccessContext
    {
        int UserId { get; }

        string Username { get; }

        string Role { get; }
    }
}
