// src/components/admin/SalesChart.tsx
'use client';

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler, // For area fill
} from 'chart.js';
import PageLoader from '@/components/PageLoader';

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

interface SalesChartData {
  labels: string[];
  data: number[];
}

const SalesChart = () => {
  const [chartData, setChartData] = useState<SalesChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/dashboard/sales-chart-data');
        if (!response.ok) {
          const errData = await response.json().catch(() => ({ message: "Failed to parse chart error" }));
          throw new Error(errData.message || 'Failed to fetch sales chart data');
        }
        const data: SalesChartData = await response.json();
        setChartData(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching sales chart data for component:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChartData();
  }, []);

  if (isLoading) {
    return <div className="h-72 flex items-center justify-center"><PageLoader message="Loading chart data..." /></div>;
  }
  if (error) {
    return <div className="h-72 flex items-center justify-center text-red-500"><p>Error loading chart: {error}</p></div>;
  }
  if (!chartData || chartData.data.length === 0) {
    return <div className="h-72 flex items-center justify-center text-gray-500"><p>No sales data available for the chart.</p></div>;
  }

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Revenue (Ksh)',
        data: chartData.data,
        fill: true, // Fill area under the line
        borderColor: 'rgb(250, 172, 0)', // solar-flare-start like color
        backgroundColor: 'rgba(250, 172, 0, 0.2)', // Lighter fill
        tension: 0.3, // Makes the line a bit curvy
        pointBackgroundColor: 'rgb(250, 172, 0)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(250, 172, 0)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Important for controlling height with a wrapper div
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
            font: {
                size: 12,
            }
        }
      },
      title: {
        display: true,
        text: 'Sales Revenue - Last 7 Days',
        font: {
            size: 16,
            weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
            label: function(context: any) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(context.parsed.y);
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
                // Include a currency sign in the ticks
                callback: function(value: any, index: any, values: any) {
                    return 'Ksh ' + value.toLocaleString();
                }
            }
        }
    }
  };

  return (
    <div className="relative h-72 md:h-96"> {/* Control chart height with a wrapper */}
      <Line options={options} data={data} />
    </div>
  );
};

export default SalesChart;