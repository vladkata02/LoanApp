using LoanApp.Data.Generic;
using LoanApp.Domain.Entities;

namespace LoanApp.Data.Repositories.LoanApplications
{
    public interface ILoanApplicationRepository : IAggregateRepository<LoanApplication>
    {
        Task<IList<LoanApplication>> GetUserLoanApplications(int userId);

        Task<IList<LoanApplication>> GetLoanApplicationsBetweenDates(DateTime startDate, DateTime endDate);
    }
}
