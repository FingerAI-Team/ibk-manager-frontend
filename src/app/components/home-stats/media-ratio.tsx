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

    // 내부에 비율만 표시
    const innerRadius2 = innerRadius + (outerRadius - innerRadius) * 0.5;
    const innerX = cx + innerRadius2 * Math.cos(-midAngle * RADIAN);
    const innerY = cy + innerRadius2 * Math.sin(-midAngle * RADIAN);

    return (
      <g key={`label-${index}`}>
        {/* 내부 비율만 표시 */}
        <text 
          x={innerX} 
          y={innerY} 
          textAnchor="middle" 
          dominantBaseline="central"
          fontSize="14"
          fontWeight="bold"
          fill="white"
        >
          {`${data.value.toFixed(1)}%`}
        </text>
      </g>
    );
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '30px',
        marginTop: '15px'
      }}>
        {payload?.map((entry: any, index: number) => {
          const data = chartData[index];
          return (
            <div key={`legend-${index}`} style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px'
              }}>
                <div style={{ 
                  width: '14px', 
                  height: '14px', 
                  backgroundColor: entry.color,
                  borderRadius: '3px'
                }} />
                <span style={{ 
                  fontWeight: 'bold', 
                  fontSize: '14px',
                  color: '#333'
                }}>
                  {entry.value}
                </span>
              </div>
              <span style={{ 
                fontSize: '12px',
                color: '#666',
                fontWeight: '500'
              }}>
                {data?.count}건
              </span>
            </div>
          );
        })}
      </div>
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
