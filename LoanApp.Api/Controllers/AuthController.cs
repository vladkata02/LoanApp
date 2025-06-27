using LoanApp.Application.Mapping.DTOs;
using LoanApp.Application.Services;
using LoanApp.Data.Generic;
using LoanApp.Data.Repositories.InviteCodes;
using LoanApp.Data.Repositories.Users;
using LoanApp.Web.Api.Resources;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;

namespace LoanApp.Web.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly IAuthService authService;
        private readonly IUserRepository userRepository;
        private readonly IInviteCodeRepository inviteCodeRepository;

        public AuthController(
            IUnitOfWork unitOfWork,
            IAuthService authService,
            IUserRepository userRepository,
            IInviteCodeRepository inviteCodeRepository)
        {
            this.unitOfWork = unitOfWork;
            this.authService = authService;
            this.userRepository = userRepository;
            this.inviteCodeRepository = inviteCodeRepository;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            var user = await this.userRepository.FindByEmailAsync(loginRequest.Email);

            if (user is null)
            {
                return NotFound();
            }

            var isPasswordValid = this.authService.IsPasswordValid(loginRequest.Password, user.PasswordHash);

            if (isPasswordValid)
            {
                var token = this.authService.GenerateJwtToken(user.UserId, user.Email, user.Role);

                return Ok(new { token });
            }

            return Unauthorized(new { message = WebApiTexts.Auth_InvalidCredentials });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserDto userDto)
        {
            var existingUser = await this.userRepository.FindByEmailAsync(userDto.Email);

            if (existingUser is not null)
            {
                return Conflict(WebApiTexts.Auth_UserAlreadyExists);
            }

            var user = await this.userRepository.CreateUserAsync(userDto, Domain.Enums.UserRole.Customer);

            var token = this.authService.GenerateJwtToken(user.UserId, user.Email, user.Role);

            return Ok(new { token });
        }

        [HttpPost("register/{code:guid}")]
        public async Task<IActionResult> RegisterWithCode(Guid code, [FromBody] UserDto userDto)
        {
            var inviteCode = await this.inviteCodeRepository.FindByCodeAsync(code);

            var isInviteCodeValid = inviteCode is not null &&
                                    !inviteCode.IsUsed &&
                                    inviteCode.Email == userDto.Email;

            if (isInviteCodeValid)
            {
                var existingUser = await this.userRepository.FindByEmailAsync(userDto.Email);
                if (existingUser is not null)
                {
                    return Conflict(WebApiTexts.Auth_UserAlreadyExists);
                }

                var user = await this.userRepository.CreateUserAsync(userDto, Domain.Enums.UserRole.Admin);

                inviteCode!.IsUsed = true;

                await this.unitOfWork.SaveChangesAsync();

                var token = this.authService.GenerateJwtToken(user.UserId, user.Email, user.Role);

                return Ok(new { token });
            }

            return Unauthorized(new { message = WebApiTexts.Auth_InvalidCredentials });
        }
    }
}
