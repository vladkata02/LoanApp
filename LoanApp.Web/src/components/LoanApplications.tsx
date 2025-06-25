import React, { useEffect, useState } from 'react';

interface LoanApplicationDto {
  id: string;
  userId: number;
  amount: number;
  termMonths: number;
  status: number;
  dateApplied: string;
}

const LoanApplications: React.FC = () => {
  const [loanApps, setLoanApps] = useState<LoanApplicationDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/loanapplications')
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.text();
          throw new Error(err || 'Failed to fetch loan applications');
        }
        return res.json();
      })
      .then(data => {
        setLoanApps(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading loan applications...</p>;

  if (error) return <p>Error loading loan applications: {error}</p>;

  return (
    <div>
      <h2>Loan Applications</h2>
      <ul>
        {loanApps.map(app => (
          <li key={app.id}>
            <b>Amount:</b> ${app.amount} - <b>Term:</b> {app.termMonths} months - <b>Status:</b> {app.status} - <b>Date:</b> {new Date(app.dateApplied).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LoanApplications;