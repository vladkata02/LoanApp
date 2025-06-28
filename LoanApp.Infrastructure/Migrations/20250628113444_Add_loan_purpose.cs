using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LoanApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Add_loan_purpose : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Purpose",
                table: "LoanApplications",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Purpose",
                table: "LoanApplications");
        }
    }
}
