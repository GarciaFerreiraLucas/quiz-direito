import { useMemo } from 'react';
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
import './MonitorDashboard.css';

export function MonitorDashboard() {
  const chartData = useMemo(() => [
    { name: 'Seg', quantidade: 4 },
    { name: 'Ter', quantidade: 8 },
    { name: 'Qua', quantidade: 6 },
    { name: 'Qui', quantidade: 12 },
    { name: 'Sex', quantidade: 10 },
    { name: 'Sáb', quantidade: 16 },
    { name: 'Dom', quantidade: 14 }
  ], []);

  // Formatter to stack the XAxis strings to mimic screenshot breaking line "Se\ng"
  const renderCustomAxisTick = ({ x, y, payload }: any) => {
    // If the label is exactly "Seg", we break it as "Se" and "g" vertically as per visual
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

  return (
    <section className="monitor-dashboard">
      <div className="monitor-dashboard__metrics">
        <div className="monitor-dashboard__metric-card">
          <span className="monitor-dashboard__metric-label">Usuários cadastrados (7 Dias)</span>
          <div className="monitor-dashboard__metric-value-wrap">
            <img src={iconeMonitores} alt="Ícone usuários" className="monitor-dashboard__metric-icon" />
            <span className="monitor-dashboard__metric-value">123</span>
          </div>
        </div>

        <div className="monitor-dashboard__metric-card">
          <span className="monitor-dashboard__metric-label">Total de monitores cadastrados</span>
          <div className="monitor-dashboard__metric-value-wrap">
            <img src={iconeMonitores} alt="Ícone monitores" className="monitor-dashboard__metric-icon" />
            <span className="monitor-dashboard__metric-value">123</span>
          </div>
        </div>

        <div className="monitor-dashboard__metric-card">
          <span className="monitor-dashboard__metric-label">Total de usuários cadastrados</span>
          <div className="monitor-dashboard__metric-value-wrap">
            <span className="monitor-dashboard__metric-value" style={{ marginLeft: 0 }}>999</span>
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
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 20 }}>
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
                ticks={[0, 5, 10, 15, 20]} 
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
