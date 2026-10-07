import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  PointElement, 
  LineElement 
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { MONTHS } from '../data/initialData';
import { formatTokenNumber } from '../utils/formatters';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function AnalyticsCharts({
  theme,
  useCases,
  allocations,
  usage,
  selectedMonth
}) {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#9CA3AF' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';
  
  // Monthly totals
  const monthlyAllocatedTotals = MONTHS.map(m => {
    let sum = 0;
    useCases.forEach(uc => {
      sum += (allocations[uc.id] && allocations[uc.id][m]) || 0;
    });
    return sum;
  });

  const monthlyConsumedTotals = MONTHS.map(m => {
    let sum = 0;
    useCases.forEach(uc => {
      sum += (usage[uc.id] && usage[uc.id][m]) || 0;
    });
    return sum;
  });

  const barData = {
    labels: MONTHS,
    datasets: [
      {
        label: 'Allocated Quota',
        data: monthlyAllocatedTotals,
        backgroundColor: 'rgba(99, 102, 241, 0.65)',
        borderColor: '#6366F1',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Consumed Tokens',
        data: monthlyConsumedTotals,
        backgroundColor: 'rgba(236, 72, 153, 0.75)',
        borderColor: '#EC4899',
        borderWidth: 1,
        borderRadius: 6,
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: textColor, font: { family: 'Plus Jakarta Sans' } }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${formatTokenNumber(context.raw)}`
        }
      }
    },
    scales: {
      x: {
        ticks: { color: textColor },
        grid: { color: gridColor }
      },
      y: {
        ticks: { 
          color: textColor,
          callback: (value) => formatTokenNumber(value, true)
        },
        grid: { color: gridColor }
      }
    }
  };

  // Doughnut Data
  const doughnutData = {
    labels: useCases.map(uc => uc.name),
    datasets: [
      {
        label: `${selectedMonth} Allocation`,
        data: useCases.map(uc => (allocations[uc.id] && allocations[uc.id][selectedMonth]) || 0),
        backgroundColor: useCases.map(uc => uc.color),
        borderColor: isDark ? '#0B0F19' : '#FFFFFF',
        borderWidth: 2,
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { 
          color: textColor, 
          font: { size: 11, family: 'Plus Jakarta Sans' },
          boxWidth: 12
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${formatTokenNumber(context.raw)} tokens`
        }
      }
    }
  };

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      
      {/* Monthly Bar Comparison */}
      <div className={`glass-panel p-5 rounded-2xl lg:col-span-2 border shadow-xl ${
        isDark ? 'border-white/10' : 'border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-500">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-bold ${textPrimary} text-base`}>Monthly Quota vs Consumption Trend</h3>
              <p className={`text-xs ${textMuted}`}>Aggregated token budget vs consumed volume across 12 months</p>
            </div>
          </div>
        </div>
        <div className="h-64 w-full">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* Doughnut Use Case Share */}
      <div className={`glass-panel p-5 rounded-2xl border shadow-xl ${
        isDark ? 'border-white/10' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-500">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-bold ${textPrimary} text-base`}>{selectedMonth} Distribution Share</h3>
            <p className={`text-xs ${textMuted}`}>Token allocation breakdown by use case</p>
          </div>
        </div>
        <div className="h-64 w-full flex items-center justify-center">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>

    </div>
  );
}
