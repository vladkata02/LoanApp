using AutoMapper;
using LoanApp.Application.Mapping.DTOs;
using LoanApp.Domain.Entities;

namespace LoanApp.Application.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            this.CreateMap<LoanApplication, LoanApplicationDto>().ReverseMap();
            this.CreateMap<User, UserDto>();
            this.CreateMap<LoanApplicationNote, LoanApplicationNoteDto>().ReverseMap();
        }
    }
}
