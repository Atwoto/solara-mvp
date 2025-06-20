// src/components/admin/OrderStatusChart.tsx
'use client';

import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2'; // Or Doughnut
import {
  Chart as ChartJS,
  ArcElement, // Needed for Pie/Doughnut
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import PageLoader from '@/components/PageLoader';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  Title
);

interface ChartApiData {
  labels: string[];
  data: number[];
}

// Predefined colors for better visualization (add more if you have many statuses)
const chartColors = [
  'rgba(54, 162, 235, 0.8)',  // Blue (e.g., Processing)
  'rgba(75, 192, 192, 0.8)',  // Green (e.g., Delivered)
  'rgba(255, 206, 86, 0.8)',  // Yellow (e.g., Pending Verification)
  'rgba(255, 99, 132, 0.8)',   // Red (e.g., Cancelled/Failed)
  'rgba(153, 102, 255, 0.8)', // Purple (e.g., Shipped)
  'rgba(255, 159, 64, 0.8)',  // Orange (e.g., Paid)
  'rgba(201, 203, 207, 0.8)', // Grey (e.g., Pending Payment)
];

const OrderStatusChart = () => {
  const [chartData, setChartData] = useState<ChartApiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/dashboard/order-status-chart');
        if (!response.ok) {
          const errData = await response.json().catch(() => ({message: "Failed to parse chart error"}));
          throw new Error(errData.message || 'Failed to fetch order status data');
        }
        const data: ChartApiData = await response.json();
        setChartData(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching order status chart data for component:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChartData();
  }, []);

  if (isLoading) {
    return <div className="h-72 flex items-center justify-center"><PageLoader message="Loading order status chart..." /></div>;
  }
  if (error) {
    return <div className="h-72 flex items-center justify-center text-red-500"><p>Error loading chart: {error}</p></div>;
  }
  if (!chartData || chartData.data.length === 0) {
    return <div className="h-72 flex items-center justify-center text-gray-500"><p>No order data to display status distribution.</p></div>;
  }

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Order Statuses',
        data: chartData.data,
        backgroundColor: chartColors.slice(0, chartData.labels.length), // Use dynamic number of colors
        borderColor: chartColors.map(color => color.replace('0.8', '1')), // Slightly darker border
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
        labels: {
            font: { size: 12 }
        }
      },
      title: {
        display: true,
        text: 'Order Status Distribution',
        font: { size: 16, weight: 'bold' as const }
      },
      tooltip: {
        callbacks: {
            label: function(context: any) {
                let label = context.label || '';
                if (label) {
                    label += ': ';
                }
                const value = context.raw;
                if (value !== null) {
                    label += value + (value === 1 ? ' order' : ' orders');
                }
                return label;
            }
        }
      }
    },
  };

  return (
    <div className="relative h-72 md:h-96"> {/* Control chart height */}
      <Pie data={data} options={options} />
      {/* Or use Doughnut: <Doughnut data={data} options={options} /> */}
    </div>
  );
};

export default OrderStatusChart;