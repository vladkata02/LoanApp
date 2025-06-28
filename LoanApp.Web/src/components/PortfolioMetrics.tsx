import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { PortfolioMetrics as MetricsType } from '../types/PortfolioMetrics';

const PortfolioMetrics: React.FC = () => {
  const { token, userRole } = useAuth();
  const [metrics, setMetrics] = useState<MetricsType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  const apiUrl = import.meta.env.VITE_API_URL;
  const isAdmin = userRole === 'Admin' || userRole === 'admin' || userRole === 'ADMIN';

  const getDateRange = (period: 'day' | 'week' | 'month' | 'year'): { startDate: string; endDate: string } => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startDate = new Date(now.getFullYear(), now.getMonth(), diff);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  useEffect(() => {
    if (isAdmin) {
      fetchMetrics();
    } else {
      setError('Access denied - Admin role required');
      setLoading(false);
    }
  }, [isAdmin, selectedPeriod]);

  const fetchMetrics = async () => {
    if (!token) {
      setError('Please log in to view metrics');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getDateRange(selectedPeriod);
      
      const params = new URLSearchParams({
        startDate,
        endDate
      });

      const response = await fetch(`${apiUrl}/api/portfolio-metrics?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMessage;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json().catch(() => ({}));
          errorMessage = errorData.message || errorData.title || 'Failed to fetch metrics';
        } else {
          errorMessage = await response.text().catch(() => 'Failed to fetch metrics');
        }
        
        if (response.status === 401) {
          errorMessage = "Unauthorized - Please login again";
        } else if (response.status === 403) {
          errorMessage = "Access denied";
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period: 'day' | 'week' | 'month' | 'year') => {
    setSelectedPeriod(period);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getPeriodDisplayText = (): string => {
    const { startDate, endDate } = getDateRange(selectedPeriod);
    const start = new Date(startDate).toLocaleDateString();
    const end = new Date(endDate);
    end.setDate(end.getDate() - 1); // Subtract one day since endDate is exclusive
    return `${selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} (${start} - ${end.toLocaleDateString()})`;
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-600 text-white p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p>Administrator privileges required to view portfolio metrics.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-xl">Loading portfolio metrics...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-600 text-white p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p>{error}</p>
            <button
              onClick={fetchMetrics}
              className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-800 rounded transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Portfolio Metrics</h1>
          
          {/* Period Selection */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Time Period</h2>
            <div className="flex flex-wrap gap-4">
              {(['day', 'week', 'month', 'year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  className={`px-4 py-2 rounded font-medium transition-colors duration-200 ${
                    selectedPeriod === period
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Current Period Display */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
            <p className="text-gray-400 text-sm">
              <span className="font-medium">Current Period:</span> {getPeriodDisplayText()}
            </p>
          </div>

          {/* Metrics Display */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Applications */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-blue-400 mb-4">Total Applications</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Count:</span>
                    <span className="text-2xl font-bold text-white">{metrics.totalApplications.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-xl font-semibold text-white">
                      {formatCurrency(metrics.totalApplications.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submitted Applications */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-yellow-400 mb-4">Submitted</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Count:</span>
                    <span className="text-2xl font-bold text-white">{metrics.submittedApplications.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-xl font-semibold text-white">
                      {formatCurrency(metrics.submittedApplications.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Approved Applications */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-green-400 mb-4">Approved</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Count:</span>
                    <span className="text-2xl font-bold text-white">{metrics.approvedApplications.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-xl font-semibold text-white">
                      {formatCurrency(metrics.approvedApplications.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rejected Applications */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-red-400 mb-4">Rejected</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Count:</span>
                    <span className="text-2xl font-bold text-white">{metrics.rejectedApplications.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-xl font-semibold text-white">
                      {formatCurrency(metrics.rejectedApplications.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioMetrics;