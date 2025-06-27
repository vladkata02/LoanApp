using LoanApp.Domain.Entities;

namespace LoanApp.Data.Repositories.InviteCodes
{
    public interface IInviteCodeRepository
    {
        Task<InviteCode?> FindByCodeAsync(Guid code);

        Task<InviteCode> CreateInviteCodeAsync(string email);
    }
}
