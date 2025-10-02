using AutoMapper;
using LoanApp.Application.Mapping.DTOs;
using LoanApp.Data.Generic;
using LoanApp.Data.Repositories.LoanApplications;
using LoanApp.Domain.Entities;
using LoanApp.Domain.Enums;
using LoanApp.Web.Api.Resources;
using LoanApp.Web.Api.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LoanApp.Application.Services.Grpc.Notification;
using LoanApp.Application.Services.Auth;

namespace LoanApp.Web.Api.Controllers
{
    [ApiController]
    [Route("api/loan-applications")]
    [Authorize]
    public class LoanApplicationsController : ControllerBase
    {
        private readonly ILoanApplicationRepository loanApplicationRepository;
        private readonly INotificationGrpcClient notificationGrpcClient;
        private readonly IAccessContext accessContext;
        private readonly IUnitOfWork unitOfWork;
        private readonly IMapper mapper;

        public LoanApplicationsController(
            ILoanApplicationRepository loanApplicationRepository,
            INotificationGrpcClient notificationGrpcClient,
            IAccessContext accessContext,
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            this.loanApplicationRepository = loanApplicationRepository;
            this.notificationGrpcClient = notificationGrpcClient;
            this.accessContext = accessContext;
            this.unitOfWork = unitOfWork;
            this.mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllLoanApplications(CancellationToken ct)
        {
            IList<LoanApplication> loanApplications;

            if (this.accessContext.Role == Roles.Admin)
            {
                loanApplications = await this.loanApplicationRepository.ListAsync(ct);
            }
            else
            {
                loanApplications = await this.loanApplicationRepository.GetUserLoanApplications(this.accessContext.UserId);
            }

            var loanDtos = this.mapper.Map<IList<LoanApplicationDto>>(loanApplications)
                                      .OrderByDescending(l => l.DateApplied);

            return Ok(loanDtos);
        }

        [HttpGet("{loanApplicationId:int}")]
        public async Task<IActionResult> GetLoanApplicationById(int loanApplicationId, CancellationToken ct)
        {
            var loanApplication = await this.loanApplicationRepository.FindByIdAsync(loanApplicationId, ct);
            if (loanApplication is null)
            {
                return NotFound();
            }

            if (this.accessContext.Role != Roles.Admin && loanApplication.UserId != this.accessContext.UserId)
            {
                return Forbid();
            }

            var loanApplicationDto = this.mapper.Map<LoanApplicationDto>(loanApplication);

            return Ok(loanApplicationDto);
        }

        [HttpPost]
        public async Task<IActionResult> CreateLoanApplication(LoanApplicationDto loanApplicationDto, CancellationToken ct)
        {
            loanApplicationDto.UserId = this.accessContext.UserId;
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
                if (loanApplication.UserId != this.accessContext.UserId)
                {
                    return Forbid();
                }

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
                if (loanApplication.UserId == this.accessContext.UserId)
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
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> ApproveLoanApplication(int loanApplicationId, CancellationToken ct)
        {
            var result = await this.ReviewLoanApplication(loanApplicationId, LoanApplicationStatus.Approved, ct);
            await this.notificationGrpcClient.SendNotificationAsync(loanApplicationId, this.accessContext.UserId, WebApiTexts.LoanApplication_Notification_Approved);

            return result;
        }

        [HttpPut("{loanApplicationId:int}/reject")]
        [Authorize(Roles = Roles.Admin)]
        public async Task<IActionResult> RejectLoanApplication(int loanApplicationId, CancellationToken ct)
        {
            return await this.ReviewLoanApplication(loanApplicationId, LoanApplicationStatus.Rejected, ct);
        }

        [HttpPost("{loanApplicationId:int}/notes")]
        public async Task<IActionResult> CreateLoanApplicationNote(int loanApplicationId, LoanApplicationNoteDto loanApplicationNoteDto, CancellationToken ct)
        {
            loanApplicationNoteDto.SenderId = this.accessContext.UserId;
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
