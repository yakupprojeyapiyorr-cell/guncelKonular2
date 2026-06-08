import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import apiClient from '../lib/api';

export default function CategoryPieChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        const response = await apiClient.get('/stats/me/categories');
        // Sadece değeri 0'dan büyük olan kategorileri göster
        const filteredData = response.data.filter(item => item.value > 0);
        setData(filteredData);
      } catch (err) {
        console.error('Kategori verisi alınamadı:', err);
        setError('Veriler yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryStats();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm">
        <span className="text-3xl mb-3 opacity-50">📊</span>
        <p>Henüz kategori verisi bulunmuyor.</p>
        <p className="text-xs mt-1">Pomodoro tamamladıkça grafik oluşacaktır.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1a1f2e] border border-white/[0.05] shadow-xl p-3 rounded-lg backdrop-blur-md">
          <p className="text-white font-medium mb-1">{data.name}</p>
          <p className="text-sm" style={{ color: data.color }}>
            {data.value} dakika
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            animationDuration={1500}
            animationBegin={200}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.05)" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value, entry) => <span className="text-slate-300 text-xs ml-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
