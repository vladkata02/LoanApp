using LoanApp.Data.Generic;
using LoanApp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LoanApp.Data.Repositories.LoanApplications
{
    public class LoanApplicationRepository : AggregateRepository<LoanApplication>, ILoanApplicationRepository
    {
        public LoanApplicationRepository(IUnitOfWork unitOfWork) : base(unitOfWork)
        {
        }
    }
}
