'use client';

import { Card, CardContent, Typography } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Props as LegendProps } from 'recharts/types/component/DefaultLegendContent';
import dayjs from 'dayjs';
import { PieLabelRenderProps } from 'recharts';

const COLORS = {
  click: '#0051A4',    // IBK 파란색 (O)
  nonClick: '#d32f2f'  // 빨간색 (X)
};

interface ChartDataItem {
  name: string;
  value: number;
  count: number;
  symbol: string;
}

interface ClickRatioProps {
  selectedDate: dayjs.Dayjs;
  clickRatio: {
    click: { count: number; ratio: number; };
    nonClick: { count: number; ratio: number; };
  };
}

export function ClickRatio({ selectedDate, clickRatio }: ClickRatioProps) {
  const isYesterday = selectedDate.isSame(dayjs().subtract(1, 'day'), 'day');
  const defaultRatio = { count: 0, ratio: 0 };
  
  const clickData: ChartDataItem[] = [
    { 
      name: '종목 버튼 클릭', 
      symbol: 'O', 
      value: clickRatio?.click?.ratio ?? 0, 
      count: clickRatio?.click?.count ?? 0 
    },
    { 
      name: '직접 질문 입력', 
      symbol: 'X', 
      value: clickRatio?.nonClick?.ratio ?? 0, 
      count: clickRatio?.nonClick?.count ?? 0 
    },
  ];

  const isEmpty = clickData.every(item => item.count === 0);

  const renderCustomizedLabel = (props: PieLabelRenderProps) => {
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
    const data = clickData[index];
    if (!data) return null;

    // 내부 레이블 위치 (파이 차트 회전에 따라 변경)
    const innerRadius2 = innerRadius + (outerRadius - innerRadius) * 0.5;
    const innerX = cx + innerRadius2 * Math.cos(-midAngle * RADIAN);
    const innerY = cy + innerRadius2 * Math.sin(-midAngle * RADIAN);

    // 외부 레이블 위치 (고정)
    const radius = 85;
    const direction = index === 0 ? -1 : 1;
    const outerX = cx + (direction * radius);
    const outerY = cy;

    return (
      <g key={`label-${index}`}>
        <text
          x={innerX}
          y={innerY}
          fill="#fff"
          textAnchor="middle"
          dominantBaseline="middle"
          className="pie-chart-label-inner"
        >
          {data.count}회
        </text>
        <text
          x={outerX}
          y={outerY}
          fill="#666"
          textAnchor={index === 0 ? "end" : "start"}
          dominantBaseline="middle"
          className="pie-chart-label-outer"
        >
          {`${data.symbol} ${data.value}%`}
        </text>
      </g>
    );
  };

  const renderLegend = (props: LegendProps) => {
    const { payload } = props;
    
    if (!payload) return null;
    
    return (
      <ul className="pie-chart-legend">
        {payload.map((entry, index) => (
          <li key={`legend-${index}`} className="pie-chart-legend-item">
            <span className="legend-symbol" style={{ color: entry.color }}>
              {clickData[index].symbol}
            </span>
            <span className="legend-text">
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card className="stats-card">
      <CardContent className="stats-card-content">
        <Typography variant="h6" gutterBottom>
          {isYesterday ? '전일' : selectedDate.format('MM/DD')} 종목 버튼 클릭 여부
        </Typography>
        <div className="click-ratio-chart">
          {isEmpty ? (
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
              <PieChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                <Pie
                  data={clickData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={60}
                  dataKey="value"
                  nameKey="name"
                  paddingAngle={2}
                  label={renderCustomizedLabel}
                  labelLine={true}
                  isAnimationActive={false}
                  startAngle={90}
                  endAngle={450}
                >
                  {clickData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={Object.values(COLORS)[index]}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => {
                    const item = clickData.find(d => d.name === name);
                    return item ? [`${item.count}회 (${item.value}%)`] : [];
                  }}
                />
                <Legend 
                  content={renderLegend}
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 