# LoanApp - Loan Management System

A modern, secure loan application management system built with .NET 9 and React. The system enables customers to apply for loans and administrators to manage applications through a comprehensive workflow.

## Architecture

```
├── LoanApp.Api/            # Web API Layer (Controllers, Configuration)
├── LoanApp.Application/    # Application Layer (Services, DTOs, Mapping)
├── LoanApp.Data/           # Data Access Layer (Repositories, Unit of Work)
├── LoanApp.Domain/         # Domain Layer (Entities, Enums)
├── LoanApp.Infrastructure/ # Infrastructure (Database Context, Migrations)
└── LoanApp.Web/            # React Frontend
```

### Technology Stack

**Backend:**
- .NET 9.0 with ASP.NET Core
- Entity Framework Core 9.0
- SQL Server
- JWT Authentication
- AutoMapper
- BCrypt for password hashing

**Frontend:**
- React 19.1.0 with TypeScript
- Vite build tool
- TailwindCSS for styling
- React Router for navigation

## Features

### Customer Portal
- ✅ User registration and authentication
- ✅ Loan application creation and management
- ✅ Application status tracking

### Administrative Panel
- ✅ User management with invite-based registration
- ✅ Loan application review and approval workflow
- ✅ Portfolio metrics and analytics
- ✅ Role-based access control

### Security Features
- 🔐 JWT-based authentication
- 🛡️ Role-based authorization (Customer/Admin)
- 🔒 Secure password hashing with BCrypt
- 🚫 Input validation and sanitization
- ⚡ Global exception handling

## 📋 Prerequisites

### Development Environment
- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 18+](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) or SQL Server Express
- [Visual Studio 2022](https://visualstudio.microsoft.com/) or [VS Code](https://code.visualstudio.com/)

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/vladkata02/LoanApp.git
cd loanapp
```

### 2. Backend Configuration

- Replace `REPLACE_THIS_WITH_ENV_VARIABLE` with actual secure values `appsettings.json` in `LoanApp.Api/`.
- Replace `DefaultConnection` value with actual connection string `appsettings.json` in `LoanApp.Api/` and `LoanApp.Infrastructure/`.
- JWT Secret must be at least 32 characters long
- Admin email and password are for development environment and can be changed

### 3. Database Setup
```bash
# Navigate to the API project
cd LoanApp.Api

# Update connection string in appsettings.json
# Run database migrations
dotnet ef database update --project ../LoanApp.Infrastructure
```

### 4. Frontend Setup
```bash
cd LoanApp.Web
npm install
```

### 5. Build and Run

**Development:**
```bash
# Backend (from LoanApp.Api/)
dotnet run

# Frontend (from LoanApp.Web/)
npm run dev
```

## 🔧 Configuration

### Environment Variables

**Backend (`appsettings.json`):**
| Setting | Description | Required |
|---------|-------------|----------|
| `ConnectionStrings:DefaultConnection` | SQL Server connection string | ✅ |
| `AppSettings:Application:JwtSection:Secret` | JWT signing key (min 32 chars) | ✅ |
| `AppSettings:Application:JwtSection:Issuer` | JWT issuer | ✅ |
| `AppSettings:Application:JwtSection:Audience` | JWT audience | ✅ |
| `AppSettings:Data:AdminAccountSettings:Email` | Default admin email | ✅ |
| `AppSettings:Data:AdminAccountSettings:Password` | Default admin password | ✅ |
| `AllowedOrigins` | CORS allowed origins | ✅ |

**Frontend (`.env`):**
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | ✅ |

### Security Configuration

1. **JWT Secret**: Must be at least 32 characters long
2. **CORS**: Configure allowed origins for production
3. **HTTPS**: Always use HTTPS in production
4. **Database**: Use connection pooling and encrypted connections

## 📖 API Documentation

### Authentication Endpoints
```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/register/{inviteCode}
```

### Loan Application Endpoints
```http
GET    /api/loan-applications                      # Get all applications (filtered by role)
GET    /api/loan-applications/{id}                 # Get specific application
POST   /api/loan-applications                      # Create new application
PUT    /api/loan-applications/{id}                 # Update application
PUT    /api/loan-applications/{id}/submit          # Submit for review
PUT    /api/loan-applications/{id}/review/{status} # Admin review (Approved/Rejected)
```

### User Management Endpoints (Admin Only)
```http
GET    /api/users                       # Get all users
GET    /api/users/{id}                  # Get user by ID
POST   /api/users/invitation            # Create invitation code
PUT    /api/users/{id}                  # Update user
```

### Portfolio Metrics (Admin Only)
```http
GET    /api/portfolio-metrics           # Get portfolio statistics
```

## 🔐 Authentication & Authorization

### User Roles
- **Customer**: Can create, view, and manage their own loan applications
- **Admin**: Full system access including user management and application review

### Security Flow
1. User authenticates with email/password
2. Server returns JWT token with user claims
3. Client includes token in Authorization header
4. Server validates token and extracts user information
5. Role-based access control enforced on endpoints

### Password Requirements
- Minimum 8 characters, maximum 128 characters
- BCrypt hashing with work factor 12 for secure storage

## 🗄️ Database Schema

### Core Entities

**Users**
- UserId (Primary Key)
- Email (Unique)
- PasswordHash
- Role (Customer/Admin)

**LoanApplications**
- LoanApplicationId (Primary Key)
- UserId (Foreign Key)
- Amount
- TermMonths
- Purpose
- Status (Pending/Submitted/Approved/Rejected)
- DateApplied

**InviteCodes**
- InviteCodeId (Primary Key)
- Code (GUID)
- Email
- IsUsed
- CreatedDate

### Application Workflow
1. **Pending**: Initial state when created
2. **Submitted**: User submits for review
3. **Approved/Rejected**: Admin decision

## 🔒 Security Considerations

### Implemented Security Measures
- ✅ JWT authentication with secure token generation
- ✅ BCrypt hashing with work factor 12
- ✅ Input validation to prevent attacks
- ✅ Role-based authorization
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Global exception handling
- ✅ HTTPS enforcement

### Error Handling
The application includes comprehensive error handling:
- Global exception middleware
- Structured error responses
- Client-friendly error messages
- Security-aware error disclosure

**Last Updated:** June 2025  
**Version:** 1.0.0  
**Minimum Requirements:** .NET 9.0, Node.js 18+, SQL Server 2019+