// src/components/admin/NewCustomersChart.tsx
'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import PageLoader from '@/components/PageLoader'; // Ensure this path is correct relative to tsconfig paths

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartApiData {
  labels: string[];
  data: number[];
}

const NewCustomersChart = () => {
  const [chartData, setChartData] = useState<ChartApiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/dashboard/new-customers-chart');
        if (!response.ok) {
          const errData = await response.json().catch(() => ({message: "Failed to parse chart error"}));
          throw new Error(errData.message || 'Failed to fetch new customers chart data');
        }
        const data: ChartApiData = await response.json();
        setChartData(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching new customers chart data for component:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChartData();
  }, []);

  if (isLoading) {
    return <div className="h-72 flex items-center justify-center"><PageLoader message="Loading new customers chart..." /></div>;
  }
  if (error) {
    return <div className="h-72 flex items-center justify-center text-red-500"><p>Error loading chart: {error}</p></div>;
  }
  if (!chartData || chartData.data.length === 0) {
    return <div className="h-72 flex items-center justify-center text-gray-500"><p>No new customer data available for this period.</p></div>;
  }

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'New Customers',
        data: chartData.data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)', 
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { font: { size: 12 } }
      },
      title: {
        display: true,
        text: 'New Customer Registrations - Last 7 Days',
        font: { size: 16, weight: 'bold' as const }
      },
      tooltip: {
        callbacks: {
            label: function(context: any) {
                let label = context.dataset.label || '';
                if (label) { label += ': '; }
                if (context.parsed.y !== null) {
                    label += context.parsed.y + (context.parsed.y === 1 ? ' customer' : ' customers');
                }
                return label;
            }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1, 
          precision: 0 
        }
      }
    }
  };

  return (
    <div className="relative h-72 md:h-96">
      <Bar options={options} data={data} />
    </div>
  );
};

export default NewCustomersChart;