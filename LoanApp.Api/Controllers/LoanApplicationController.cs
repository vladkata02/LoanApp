using LoanApp.Data.Generic;
using LoanApp.Data.Repositories.LoanApplications;
using LoanApp.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using LoanApp.Application.Mapping.DTOs;

namespace LoanApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoanApplicationsController : ControllerBase
    {
        private readonly ILoanApplicationRepository loanApplicationRepository;
        private readonly IUnitOfWork unitOfWork;
        private readonly IMapper mapper;

        public LoanApplicationsController(
            ILoanApplicationRepository loanApplicationRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            this.loanApplicationRepository = loanApplicationRepository;
            this.unitOfWork = unitOfWork;
            this.mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            var loanApplications = await this.loanApplicationRepository.ListAsync(ct);

            var loanDtos = this.mapper.Map<List<LoanApplicationDto>>(loanApplications);

            return Ok(loanDtos);
        }

        [HttpGet("{loanApplicationId:int}")]
        public async Task<IActionResult> GetById(int loanApplicationId, CancellationToken ct)
        {
            var loanApplication = await this.loanApplicationRepository.GetByIdAsync(loanApplicationId, ct);
            if (loanApplication is null)
            {
                return NotFound();
            }

            var loanApplicationDto = this.mapper.Map<LoanApplicationDto>(loanApplication);

            return Ok(loanApplicationDto);
        }

        [HttpPost]
        public async Task<IActionResult> Create(LoanApplicationDto loanApplicationDto, CancellationToken ct)
        {
            var loanApplication = this.mapper.Map<LoanApplication>(loanApplicationDto);

            await this.loanApplicationRepository.AddAsync(loanApplication, ct);

            await this.unitOfWork.SaveChangesAsync(ct);

            return CreatedAtAction(nameof(GetById), new { loanApplicationId = loanApplicationDto.LoanApplicationId }, loanApplicationDto);
        }

        [HttpPut("{loanApplicationId:int}")]
        public async Task<IActionResult> Update(int loanApplicationId, LoanApplication LoanApplicationDto, CancellationToken ct)
        {
            var existingLoanApplication = await this.loanApplicationRepository.GetByIdAsync(loanApplicationId, ct);
            if (existingLoanApplication is null)
            {
                return NotFound();
            }

            existingLoanApplication.Amount = LoanApplicationDto.Amount;
            existingLoanApplication.TermMonths = LoanApplicationDto.TermMonths;
            existingLoanApplication.Status = LoanApplicationDto.Status;

            this.mapper.Map(LoanApplicationDto, existingLoanApplication);
            this.loanApplicationRepository.Update(existingLoanApplication);

            await this.unitOfWork.SaveChangesAsync(ct);

            return NoContent();
        }

        [HttpDelete("{loanApplicationId:int}")]
        public async Task<IActionResult> Delete(int loanApplicationId, CancellationToken ct)
        {
            var existingLoanApplication = await this.loanApplicationRepository.GetByIdAsync(loanApplicationId, ct);
            if (existingLoanApplication is null)
            {
                return NotFound();
            }

            this.loanApplicationRepository.Remove(existingLoanApplication);

            await this.unitOfWork.SaveChangesAsync(ct);

            return NoContent();
        }
    }
}
