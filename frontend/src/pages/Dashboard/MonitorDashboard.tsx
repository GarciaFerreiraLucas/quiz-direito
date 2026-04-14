import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import iconeMonitores from '../../assets/icones/icone_monitores.svg';
import api from '../../services/api';
import './MonitorDashboard.css';

type AdminStats = {
  totalUsuarios: number;
  totalMonitores: number;
  usuarios7Dias: number;
  chartData: { name: string; quantidade: number }[];
};

export function MonitorDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/dashboard/admin-stats');
        setStats(res.data);
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  // Formatter to stack the XAxis strings vertically
  const renderCustomAxisTick = ({ x, y, payload }: any) => {
    const breakLabel = (name: string) => {
      if (name.length > 2) {
        return [name.substring(0, 2), name.substring(2)];
      }
      return [name, ''];
    };

    const parts = breakLabel(payload.value);

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" fill="#838e9c" fontSize={13}>
          {parts[0]}
        </text>
        {parts[1] && (
           <text x={0} y={0} dy={30} textAnchor="middle" fill="#838e9c" fontSize={13}>
             {parts[1]}
           </text>
        )}
      </g>
    );
  };

  // Calculate max Y value for the chart ticks
  const maxQuantidade = stats?.chartData
    ? Math.max(...stats.chartData.map((d) => d.quantidade), 5)
    : 20;
  const yMax = Math.ceil(maxQuantidade / 5) * 5 + 5;
  const yTicks = Array.from({ length: yMax / 5 + 1 }, (_, i) => i * 5);

  if (loading) {
    return (
      <section className="monitor-dashboard">
        <p style={{ textAlign: 'center', padding: '48px', color: '#838e9c' }}>Carregando dashboard...</p>
      </section>
    );
  }

  return (
    <section className="monitor-dashboard">
      <div className="monitor-dashboard__metrics">
        <div className="monitor-dashboard__metric-card">
          <span className="monitor-dashboard__metric-label">Usuários cadastrados (7 Dias)</span>
          <div className="monitor-dashboard__metric-value-wrap">
            <img src={iconeMonitores} alt="Ícone usuários" className="monitor-dashboard__metric-icon" />
            <span className="monitor-dashboard__metric-value">{stats?.usuarios7Dias ?? 0}</span>
          </div>
        </div>

        <div className="monitor-dashboard__metric-card">
          <span className="monitor-dashboard__metric-label">Total de monitores cadastrados</span>
          <div className="monitor-dashboard__metric-value-wrap">
            <img src={iconeMonitores} alt="Ícone monitores" className="monitor-dashboard__metric-icon" />
            <span className="monitor-dashboard__metric-value">{stats?.totalMonitores ?? 0}</span>
          </div>
        </div>

        <div className="monitor-dashboard__metric-card">
          <span className="monitor-dashboard__metric-label">Total de usuários cadastrados</span>
          <div className="monitor-dashboard__metric-value-wrap">
            <span className="monitor-dashboard__metric-value" style={{ marginLeft: 0 }}>{stats?.totalUsuarios ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="monitor-dashboard__chart-card">
        <h3 className="monitor-dashboard__chart-title">
          Gráfico de cadastros dos últimos 7 dias<br />
          <span>(quantidade)</span>
        </h3>
        
        <div className="monitor-dashboard__chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.chartData || []} margin={{ top: 10, right: 30, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9eaf0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={renderCustomAxisTick}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#838e9c', fontSize: 13 }} 
                ticks={yTicks} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#111e3b', marginBottom: '4px' }}
                itemStyle={{ color: '#111e3b' }}
              />
              <Line 
                type="linear" 
                dataKey="quantidade" 
                stroke="#15284b" 
                strokeWidth={3.5}
                dot={{ r: 5.5, stroke: '#15284b', strokeWidth: 2.5, fill: '#fff' }}
                activeDot={{ r: 8, stroke: '#15284b', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
