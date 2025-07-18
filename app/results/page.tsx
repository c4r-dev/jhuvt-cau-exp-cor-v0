'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Submission {
  _id: string;
  explanation: string;
  timestamp: string;
}

export default function ResultsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.causalExpCorrSubmissions || []);
      } else {
        setError('Failed to fetch submissions');
      }
    } catch (err) {
      setError('An error occurred while fetching submissions');
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleBackToChart = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="main-container">
        <div className="results-container">
          <h1>Loading submissions...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-container">
        <div className="results-container">
          <h1>Error</h1>
          <p className="error-message">{error}</p>
          <button className="button restart-button" onClick={handleBackToChart}>
            RESTART
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="results-container">
        <div className="results-header">
          <h1>All Submissions</h1>
          <p className="results-subtitle">
            See what others think about this correlation
          </p>
        </div>

        {submissions.length === 0 ? (
          <div className="no-submissions">
            <p>No submissions found yet.</p>
          </div>
        ) : (
          <div className="submissions-list">
            {submissions.map((submission, index) => (
              <div key={submission._id} className="submission-item">
                <div className="submission-content">
                  <p>{submission.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="restart-button-container">
          <button className="button restart-button" onClick={handleBackToChart}>
            RESTART
          </button>
        </div>
      </div>
    </div>
  );
}