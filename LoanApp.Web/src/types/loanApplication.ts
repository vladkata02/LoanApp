export interface LoanApplicationNoteDto {
  loanApplicationNoteId: number;
  loanApplicationId: number;
  senderId: number;
  content: string;
  sentAt: string;
  isFromAdmin: boolean;
}

export interface UserDto {
  userId: number;
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

// Add interface for creating notes
export interface CreateNoteRequest {
  content: string;
  isFromAdmin: boolean;
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

export const canEditApplication = (status: number): boolean => {
  return status === LoanApplicationStatus.Pending;
};

export const canSubmitApplication = (status: number): boolean => {
  return status === LoanApplicationStatus.Pending;
};

export const canAdminReview = (status: number): boolean => {
  return status === LoanApplicationStatus.Submitted;
};

// Helper function to get sender display name (you'll need user data for this)
export const getSenderDisplayName = (note: LoanApplicationNoteDto, users?: UserDto[]): string => {
  if (note.isFromAdmin) {
    return 'Administrator';
  }
  // You might want to look up the user by senderId
  return 'Customer';
};
