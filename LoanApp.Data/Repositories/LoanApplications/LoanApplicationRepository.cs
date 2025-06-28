using LoanApp.Data.Generic;
using LoanApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LoanApp.Data.Repositories.LoanApplications
{
    public class LoanApplicationRepository : AggregateRepository<LoanApplication>, ILoanApplicationRepository
    {
        public LoanApplicationRepository(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
        }

        public async Task<IList<LoanApplication>> GetUserLoanApplications(int userId)
        {
            return await this.unitOfWork.DbContext.Set<LoanApplication>()
                .Where(la => la.UserId == userId)
                .Include(la => la.User)
                .Include(la => la.Notes)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IList<LoanApplication>> GetLoanApplicationsBetweenDates(DateTime startDate, DateTime endDate)
        {
            return await this.unitOfWork.DbContext.Set<LoanApplication>().Where(la => la.DateApplied >= startDate && la.DateApplied <= endDate)
                                                                         .ToListAsync();
        }
    }
}
