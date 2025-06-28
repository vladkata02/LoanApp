export interface PortfolioMetrics {
  period: string;
  totalApplications: {
    count: number;
    amount: number;
  };
  submittedApplications: {
    count: number;
    amount: number;
  };
  approvedApplications: {
    count: number;
    amount: number;
  };
  rejectedApplications: {
    count: number;
    amount: number;
  };
}

export interface PortfolioMetricsRequest {
  period: 'day' | 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
}