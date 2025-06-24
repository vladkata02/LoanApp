using AutoMapper;
using LoanApp.Application.Mapping.DTOs;
using LoanApp.Data.Generic;
using LoanApp.Data.Repositories.Users;
using LoanApp.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace LoanApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository userRepository;
        private readonly IUnitOfWork unitOfWork;
        private readonly IMapper mapper;

        public UsersController(
            IUserRepository userRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper)
        {
            this.userRepository = userRepository;
            this.unitOfWork = unitOfWork;
            this.mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken ct)
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

        [HttpPost]
        public async Task<IActionResult> Create(UserDto userDto, CancellationToken ct)
        {
            var user = this.mapper.Map<User>(userDto);

            await this.userRepository.AddAsync(user, ct);

            await this.unitOfWork.SaveChangesAsync(ct);

            return CreatedAtAction(nameof(GetById), new { userId = userDto.UserId }, userDto);
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

        [HttpDelete("{userId:int}")]
        public async Task<IActionResult> Delete(int userId, CancellationToken ct)
        {
            var existing = await this.userRepository.GetByIdAsync(userId, ct);
            if (existing is null)
            {
                return NotFound();
            }

            this.userRepository.Remove(existing);

            await this.unitOfWork.SaveChangesAsync(ct);

            return NoContent();
        }
    }
}
