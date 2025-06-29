﻿namespace LoanApp.Application.Configuration
{
    public class JwtSection
    {
        public string Secret { get; set; } = string.Empty;

        public string Issuer { get; set; } = string.Empty;

        public string Audience { get; set; } = string.Empty;

        public int ExpiryMinutes { get; set; }
    }
}
