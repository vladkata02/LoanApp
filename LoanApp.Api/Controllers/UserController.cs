using AutoMapper;
using LoanApp.Application.Mapping.DTOs;
using LoanApp.Data.Generic;
using LoanApp.Data.Repositories.Users;
using LoanApp.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LoanApp.Data.Repositories.InviteCodes;
using Microsoft.AspNetCore.Identity.Data;

namespace LoanApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository userRepository;
        private readonly IInviteCodeRepository inviteCodeRepository;
        private readonly IUnitOfWork unitOfWork;
        private readonly IMapper mapper;

        public UsersController(
            IUserRepository userRepository,
            IInviteCodeRepository inviteCodeRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            this.userRepository = userRepository;
            this.inviteCodeRepository = inviteCodeRepository;
            this.unitOfWork = unitOfWork;
            this.mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers(CancellationToken ct)
        {
            var users = await this.userRepository.ListAsync(ct);

            var userDtos = this.mapper.Map<List<UserDto>>(users);

            return Ok(userDtos);
        }

        [HttpGet("{userId:int}")]
        public async Task<IActionResult> GetById(int userId, CancellationToken ct)
        {
            var user = await this.userRepository.GetByIdAsync(userId, ct);
            if (user is null)
            {
                return NotFound();
            }

            var userDto = this.mapper.Map<UserDto>(user);

            return Ok(userDto);
        }

        [HttpPost("invitation")]
        public async Task<IActionResult> CreateInvitationCode(string email)
        {
            var isEmailFree = this.userRepository.IsEmailFree(email);

            if (isEmailFree)
            {
                return Conflict();
            }

            var invitationCode = await this.inviteCodeRepository.CreateInviteCodeAsync(email);

            return Ok(invitationCode.Code);
        }

        [HttpPut("{userId:int}")]
        public async Task<IActionResult> Update(int userId, UserDto userDto, CancellationToken ct)
        {
            var existingUser = await this.userRepository.GetByIdAsync(userId, ct);
            if (existingUser is null)
            {
                return NotFound();
            }

            this.mapper.Map(userDto, existingUser);

            this.userRepository.Update(existingUser);

            await this.unitOfWork.SaveChangesAsync(ct);

            return NoContent();
        }
    }
}
