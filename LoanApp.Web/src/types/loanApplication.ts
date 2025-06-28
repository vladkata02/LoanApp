export interface LoanApplicationNoteDto {
    loanApplicationIdNoteId: number;
    loanApplicationId: number;
    noteText: string;
    isAdminNote: boolean;
    createdDate: string;
    createdBy: string;
}

export interface UserDto {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export interface LoanApplicationDto {
  loanApplicationId: number;
  userId: number;
  amount: number;
  termMonths: number;
  purpose: string;
  status: number;
  dateApplied: string;
  dateUpdated?: string;
  adminNotes?: string;
  customerNotes?: string;
  user?: UserDto;
  notes: LoanApplicationNoteDto[];
}

export interface CreateLoanApplicationRequest {
  amount: number;
  termMonths: number;
  purpose: string;
}

export interface UpdateLoanApplicationStatusRequest {
  status: number;
  adminNotes?: string;
}

export interface ValidationErrors {
  amount?: string;
  termMonths?: string;
  purpose?: string;
}

export const LoanApplicationStatus = {
  Pending: 1,
  Submitted: 2,
  Approved: 3,
  Rejected: 4
} as const;

export type LoanApplicationStatus = typeof LoanApplicationStatus[keyof typeof LoanApplicationStatus];

// Utility functions for status handling
export const getStatusText = (status: number): string => {
  switch (status) {
    case LoanApplicationStatus.Pending: return 'Pending';
    case LoanApplicationStatus.Submitted: return 'Submitted';
    case LoanApplicationStatus.Approved: return 'Approved';
    case LoanApplicationStatus.Rejected: return 'Rejected';
    default: return 'Unknown';
  }
};

export const getStatusColor = (status: number): string => {
  switch (status) {
    case LoanApplicationStatus.Pending: return 'bg-yellow-600';
    case LoanApplicationStatus.Submitted: return 'bg-blue-600';
    case LoanApplicationStatus.Approved: return 'bg-green-600';
    case LoanApplicationStatus.Rejected: return 'bg-red-600';
    default: return 'bg-gray-600';
  }
};
