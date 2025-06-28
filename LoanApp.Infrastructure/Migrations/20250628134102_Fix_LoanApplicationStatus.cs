using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LoanApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Fix_LoanApplicationStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_LoanApplication_Status",
                table: "LoanApplications");

            migrationBuilder.AddCheckConstraint(
                name: "CK_LoanApplication_Status",
                table: "LoanApplications",
                sql: "[Status] IN (1, 2, 3, 4)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_LoanApplication_Status",
                table: "LoanApplications");

            migrationBuilder.AddCheckConstraint(
                name: "CK_LoanApplication_Status",
                table: "LoanApplications",
                sql: "[Status] IN (1, 2, 3)");
        }
    }
}
