using LoanApp.Data.Generic;
using LoanApp.Data.Repositories.LoanApplications;
using LoanApp.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using AutoMapper;
using LoanApp.Application.Mapping.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using LoanApp.Web.Api.Resources;
using LoanApp.Domain.Enums;

namespace LoanApp.Api.Controllers
{
    [ApiController]
    [Route("api/loan-applications")]
    [Authorize]
    public class LoanApplicationsController : ControllerBase
    {
        private readonly ILoanApplicationRepository loanApplicationRepository;
        private readonly IUnitOfWork unitOfWork;
        private readonly IMapper mapper;

        private int CurrentUserId => int.Parse(this.User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        private string CurrentUserRole => this.User.FindFirst(ClaimTypes.Role)!.Value;

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
        public async Task<IActionResult> GetAllLoanApplications(CancellationToken ct)
        {
            IList<LoanApplication> loanApplications;

            if (this.CurrentUserRole == UserRole.Admin.ToString())
            {
                loanApplications = await this.loanApplicationRepository.ListAsync(ct);
            }
            else
            {
                loanApplications = await this.loanApplicationRepository.GetUserLoanApplications(this.CurrentUserId);
            }

            var loanDtos = this.mapper.Map<IList<LoanApplicationDto>>(loanApplications)
                                      .OrderByDescending(l => l.DateApplied);

            return Ok(loanDtos);
        }

        [HttpGet("{loanApplicationId:int}")]
        public async Task<IActionResult> GetLoanApplicationById(int loanApplicationId, CancellationToken ct)
        {
            var loanApplication = await this.loanApplicationRepository.FindByIdAsync(loanApplicationId, ct);
            if (loanApplication is null || loanApplication.UserId != this.CurrentUserId)
            {
                return NotFound();
            }

            var loanApplicationDto = this.mapper.Map<LoanApplicationDto>(loanApplication);

            return Ok(loanApplicationDto);
        }

        [HttpPost]
        public async Task<IActionResult> CreateLoanApplication(LoanApplicationDto loanApplicationDto, CancellationToken ct)
        {
            loanApplicationDto.UserId = this.CurrentUserId;
            var loanApplication = this.mapper.Map<LoanApplication>(loanApplicationDto);

            await this.loanApplicationRepository.AddAsync(loanApplication, ct);

            await this.unitOfWork.SaveChangesAsync(ct);

            return Ok();
        }

        [HttpPut("{loanApplicationId:int}")]
        public async Task<IActionResult> UpdateLoanApplication(int loanApplicationId, [FromBody] LoanApplicationDto LoanApplicationDto, CancellationToken ct)
        {
            var loanApplication = await this.loanApplicationRepository.FindByIdAsync(loanApplicationId, ct);

            if (loanApplication is not null)
            {
                if (loanApplication.Status is LoanApplicationStatus.Pending)
                {
                    loanApplication.Amount = LoanApplicationDto.Amount;
                    loanApplication.TermMonths = LoanApplicationDto.TermMonths;
                    loanApplication.Purpose = LoanApplicationDto.Purpose;

                    this.loanApplicationRepository.Update(loanApplication);

                    await this.unitOfWork.SaveChangesAsync(ct);

                    return NoContent();
                }

                return BadRequest(WebApiTexts.LoanApplication_Wrong_Status);
            }

            return NotFound();
        }

        [HttpPut("{loanApplicationId:int}/submit")]
        public async Task<IActionResult> SubmitLoanApplication(int loanApplicationId, CancellationToken ct)
        {
            var loanApplication = await this.loanApplicationRepository.FindByIdAsync(loanApplicationId, ct);

            if (loanApplication is not null)
            {
                if (loanApplication.UserId == this.CurrentUserId)
                {
                    if (loanApplication.Status is LoanApplicationStatus.Pending)
                    {
                        loanApplication.Status = LoanApplicationStatus.Submitted;

                        this.loanApplicationRepository.Update(loanApplication);

                        await this.unitOfWork.SaveChangesAsync(ct);

                        return NoContent();
                    }

                    return BadRequest(string.Format(WebApiTexts.LoanApplication_Wrong_Status, LoanApplicationStatus.Pending.ToString()));
                }

                return BadRequest(WebApiTexts.LoanApplication_Wrong_User);
            }

            return NotFound();
        }

        [HttpPut("{loanApplicationId:int}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveLoanApplication(int loanApplicationId, CancellationToken ct)
        {
            return await this.ReviewLoanApplication(loanApplicationId, LoanApplicationStatus.Approved, ct);
        }

        [HttpPut("{loanApplicationId:int}/reject")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RejectLoanApplication(int loanApplicationId, CancellationToken ct)
        {
            return await this.ReviewLoanApplication(loanApplicationId, LoanApplicationStatus.Rejected, ct);
        }

        [HttpPost("{loanApplicationId:int}/notes")]
        public async Task<IActionResult> CreateLoanApplicationNote(int loanApplicationId, LoanApplicationNoteDto loanApplicationNoteDto, CancellationToken ct)
        {
            loanApplicationNoteDto.SenderId = this.CurrentUserId;
            loanApplicationNoteDto.LoanApplicationId = loanApplicationId;

            var loanApplicationNote = this.mapper.Map<LoanApplicationNote>(loanApplicationNoteDto);

            await this.loanApplicationRepository.AddNoteAsync(loanApplicationNote, ct);

            await this.unitOfWork.SaveChangesAsync(ct);

            return Ok();
        }

        private async Task<IActionResult> ReviewLoanApplication(int loanApplicationId, LoanApplicationStatus adminDecisionStatus, CancellationToken ct)
        {
            var loanApplication = await this.loanApplicationRepository.FindByIdAsync(loanApplicationId, ct);

            if (loanApplication is not null)
            {
                if (loanApplication.Status is LoanApplicationStatus.Submitted)
                {
                    loanApplication.Status = adminDecisionStatus;

                    this.loanApplicationRepository.Update(loanApplication);

                    await this.unitOfWork.SaveChangesAsync(ct);

                    return NoContent();
                }

                return BadRequest(string.Format(WebApiTexts.LoanApplication_Wrong_Status, LoanApplicationStatus.Submitted.ToString()));
            }

            return NotFound();
        }
    }
}
