using LoanApp.Data.Generic;
using LoanApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LoanApp.Data.Repositories.InviteCodes
{
    public class InviteCodeRepository : AggregateRepository<InviteCode>, IInviteCodeRepository
    {
        public InviteCodeRepository(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
        }

        public async Task<InviteCode?> FindByCodeAsync(Guid code)
        {
            return await this.dbSet.FirstOrDefaultAsync(i => i.Code == code);
        }

        public async Task<InviteCode> CreateInviteCodeAsync(string email)
        {
            var alreadyGeneratedCode = await this.dbSet.FirstOrDefaultAsync(i => i.Email == email);

            if (alreadyGeneratedCode is not null)
            {
                return alreadyGeneratedCode;
            }

            var inviteCode = await this.dbSet.AddAsync(new InviteCode { Email = email });

            this.unitOfWork.DbContext.SaveChanges();

            return inviteCode.Entity;
        }
    }
}
