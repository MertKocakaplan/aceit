import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { GlassCard } from '../../ui';

const SixMonthTrend = ({ trendData }) => {
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Grafik verisi
  const chartData = trendData.map(month => ({
    month: month.monthName.split(' ')[0], // Sadece ay adı
    saat: month.durationHours,
    başarı: month.successRate,
    oturum: month.sessions,
  }));

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl">
          <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
            Son 6 Aylık Trend
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Aylık çalışma saati ve başarı oranı gelişimi
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280" 
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            yAxisId="left"
            stroke="#6b7280" 
            style={{ fontSize: '12px' }}
            label={{ value: 'Saat', angle: -90, position: 'insideLeft' }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#6b7280" 
            style={{ fontSize: '12px' }}
            label={{ value: 'Başarı %', angle: 90, position: 'insideRight' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="saat" 
            stroke="#6366f1" 
            strokeWidth={3}
            dot={{ fill: '#6366f1', r: 5 }}
            activeDot={{ r: 7 }}
            name="Çalışma Saati"
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="başarı" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ fill: '#10b981', r: 5 }}
            activeDot={{ r: 7 }}
            name="Başarı Oranı (%)"
          />
        </LineChart>
      </ResponsiveContainer>
    </GlassCard>
  );
};

export default SixMonthTrend;