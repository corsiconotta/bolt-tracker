import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Injection } from '../types';
import { formatDate } from '../utils/format';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Props {
  injections: Injection[];
}

export const TLevelChart: React.FC<Props> = ({ injections }) => {
  const getLast30DaysData = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return injections
      .filter(injection => 
        new Date(injection.date) >= thirtyDaysAgo && 
        injection.timeOfDay === 'morning'
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const filteredData = getLast30DaysData();
  
  const data = {
    labels: filteredData.map(injection => formatDate(injection.date)),
    datasets: [
      {
        label: 'Serum T Level',
        data: filteredData.map(injection => injection.serumTLevel || 0),
        fill: true,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => `${Math.round(context.raw)} ng/dL`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          callback: (value: number) => `${value} ng/dL`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Level History (Last 30 days)</h3>
      <div className="h-[300px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};