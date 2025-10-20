import React from 'react';
import { Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import dayjs from 'dayjs';

interface MediaRatioProps {
  selectedDate: dayjs.Dayjs;
  mediaStats: {
    mts: { count: number; ratio: number };
    iOneBank: { count: number; ratio: number };
  };
  loading?: boolean;
}

interface ChartDataItem {
  name: string;
  value: number;
  count: number;
  color: string;
}

export function MediaRatio({ selectedDate, mediaStats, loading = false }: MediaRatioProps) {
  const isYesterday = selectedDate.isSame(dayjs().subtract(1, 'day'), 'day');
  
  const chartData: ChartDataItem[] = [
    { 
      name: 'MTS', 
      value: mediaStats.mts.ratio, 
      count: mediaStats.mts.count,
      color: '#1976d2'
    },
    { 
      name: 'i-One Bank', 
      value: mediaStats.iOneBank.ratio, 
      count: mediaStats.iOneBank.count,
      color: '#dc004e'
    },
  ];

  const isEmpty = chartData.every(item => item.count === 0);

  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, index } = props;
    
    if (typeof cx !== 'number' || 
        typeof cy !== 'number' || 
        typeof midAngle !== 'number' || 
        typeof innerRadius !== 'number' || 
        typeof outerRadius !== 'number' ||
        typeof index !== 'number') {
      return null;
    }
    
    const RADIAN = Math.PI / 180;
    const data = chartData[index];
    if (!data) return null;

    // 내부 레이블 위치
    const innerRadius2 = innerRadius + (outerRadius - innerRadius) * 0.5;
    const innerX = cx + innerRadius2 * Math.cos(-midAngle * RADIAN);
    const innerY = cy + innerRadius2 * Math.sin(-midAngle * RADIAN);

    // 외부 레이블 위치
    const radius = 85;
    const direction = index === 0 ? -1 : 1;
    const outerX = cx + (direction * radius);
    const outerY = cy;

    return (
      <g key={`label-${index}`}>
        {/* 내부 비율 표시 */}
        <text 
          x={innerX} 
          y={innerY} 
          textAnchor="middle" 
          dominantBaseline="central"
          fontSize="12"
          fontWeight="bold"
          fill="white"
        >
          {`${data.value.toFixed(1)}%`}
        </text>
        
        {/* 외부 매체명과 개수 표시 */}
        <text 
          x={outerX} 
          y={outerY - 10} 
          textAnchor="middle" 
          dominantBaseline="central"
          fontSize="11"
          fontWeight="bold"
          fill="#333"
        >
          {data.name}
        </text>
        <text 
          x={outerX} 
          y={outerY + 10} 
          textAnchor="middle" 
          dominantBaseline="central"
          fontSize="10"
          fill="#666"
        >
          {`${data.count}건`}
        </text>
      </g>
    );
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <ul style={{ 
        listStyle: 'none', 
        padding: 0, 
        margin: 0, 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px',
        marginTop: '10px'
      }}>
        {payload?.map((entry: any, index: number) => (
          <li key={`legend-${index}`} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px',
            fontSize: '12px'
          }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: entry.color,
              borderRadius: '2px'
            }} />
            <span style={{ fontWeight: 'bold' }}>{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card className="stats-card">
      <CardContent className="stats-card-content">
        <Typography variant="h6" gutterBottom>
          {isYesterday ? '전일' : selectedDate.format('MM/DD')} 매체별 비율
        </Typography>
        <div className="media-ratio-chart">
          {loading ? (
            <div style={{ 
              height: '220px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CircularProgress size={40} />
            </div>
          ) : isEmpty ? (
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                height: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              데이터가 없습니다
            </Typography>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={renderCustomizedLabel}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
