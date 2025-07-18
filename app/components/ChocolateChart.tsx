'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

interface DataPoint {
  Country: string;
  Consumption: number;
  Nobel: number;
}

interface ChocolateChartProps {
  data: DataPoint[];
}

const ChocolateChart: React.FC<ChocolateChartProps> = ({ data }) => {
  const [explanation, setExplanation] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  
  // Transform data for Recharts
  const chartData = data.map(item => ({
    x: item.Consumption,
    y: item.Nobel,
    country: item.Country
  }));

  const handleSubmit = async () => {
    if (explanation.length < 10) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          explanation: explanation
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Submission successful:', result);
        // Navigate to results page
        router.push('/results');
      } else {
        console.error('Submission failed:', await response.text());
        alert('Failed to submit analysis. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting analysis:', error);
      alert('An error occurred while submitting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-country">{data.country}</p>
          <p className="tooltip-consumption">
            Consumption: {data.x} kg/capita/year
          </p>
          <p className="tooltip-nobel">
            Nobel Laureates: {data.y} per capita
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h1 className="chart-title">Chocolate Consumption vs Nobel Laureates by Country</h1>
        <p className="chart-subtitle">Current data (2022-2024) from industry sources and Wikipedia</p>
      </div>
      
      <div className="chart-wrapper">
        <div className="chart-with-labels">
          <p className="y-axis-label">Nobel Laureates (per capita)</p>
          <ResponsiveContainer width="100%" height={500}>
            <ScatterChart
              margin={{
                top: 20,
                right: 30,
                bottom: 20,
                left: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Chocolate Consumption"
                domain={[0, 10]}
                ticks={[0, 2, 4, 6, 8, 10]}
                tick={{ fontSize: 12, fill: '#666' }}
                axisLine={{ stroke: '#666' }}
                tickLine={{ stroke: '#666' }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Nobel Laureates"
                domain={[0, 35]}
                ticks={[0, 5, 10, 15, 20, 25, 30, 35]}
                tick={{ fontSize: 12, fill: '#666' }}
                axisLine={{ stroke: '#666' }}
                tickLine={{ stroke: '#666' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter 
                data={chartData} 
                fill="#FF8C00" 
                stroke="#FF8C00"
                strokeWidth={2}
                r={6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="x-axis-label">Chocolate Consumption (kg/capita/year)</p>
        
        <div className="explanation-section">
          <h3 className="explanation-title">Assume that this correlation is real. Propose an explanation:</h3>
          <textarea 
            className="explanation-textbox"
            placeholder="Type your explanation here..."
            rows={4}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
          />
          <div className="submit-button-container">
            <button 
              className="button submit-button"
              onClick={handleSubmit}
              disabled={explanation.length < 10 || isSubmitting}
            >
              {isSubmitting ? 'SUBMITTING...' : 'SUBMIT ANALYSIS'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChocolateChart;