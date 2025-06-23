﻿namespace LoanApp.Domain.Entities
{
    public class User
    {
        public string Id { get; set; }

        public string Email { get; set; }

        public string PasswordHash { get; set; }

        public List<Loan> Loans { get; set; } = new();
    }
}
